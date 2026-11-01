"""Build and optionally upload Aromatique serving data for Supabase.

The source of truth stays in this KGAT repo:
- dataset-aromatique/aromatique_KG_final.xlsx for product metadata
- dataset-aromatique-kgat-ready/* for remapped product/entity/KG ids

No third-party packages are required; the XLSX reader uses the standard
library because this script is intended to run in a lightweight handoff setup.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any
from xml.etree import ElementTree as ET
from zipfile import ZipFile


MODEL_VERSION = "kgat_baseline_epoch69_v1"
RECOMMENDATION_ENGINE = "kgat_baseline"
SOURCE_DATASET = "dataset-aromatique-kgat-ready"
ROOT = Path(__file__).resolve().parents[1]
KGAT_DATASET = ROOT / "dataset-aromatique-kgat-ready"
SOURCE_XLSX = ROOT / "dataset-aromatique" / "aromatique_KG_final.xlsx"
DEFAULT_OUTPUT = ROOT / "_external" / "aromatique-ai" / "supabase" / "seed" / "aromatique_serving_payload.json"
DEFAULT_ENV = ROOT / "_external" / "aromatique-ai" / ".env"
NS = {"a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def column_index(cell_ref: str) -> int:
    match = re.match(r"([A-Z]+)", cell_ref)
    if not match:
        raise ValueError(f"Invalid cell reference: {cell_ref}")
    value = 0
    for char in match.group(1):
        value = value * 26 + ord(char) - 64
    return value - 1


def load_shared_strings(zf: ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in zf.namelist():
        return []
    root = ET.fromstring(zf.read("xl/sharedStrings.xml"))
    values: list[str] = []
    for item in root.findall("a:si", NS):
        values.append("".join(node.text or "" for node in item.findall(".//a:t", NS)))
    return values


def cell_value(cell: ET.Element, shared_strings: list[str]) -> str:
    cell_type = cell.attrib.get("t")
    if cell_type == "s":
        value = cell.find("a:v", NS)
        return shared_strings[int(value.text)] if value is not None and value.text else ""
    if cell_type == "inlineStr":
        return "".join(node.text or "" for node in cell.findall(".//a:t", NS))
    value = cell.find("a:v", NS)
    return value.text if value is not None and value.text else ""


def read_xlsx_sheet(path: Path, sheet_path: str) -> list[dict[str, str]]:
    with ZipFile(path) as zf:
        shared_strings = load_shared_strings(zf)
        root = ET.fromstring(zf.read(sheet_path))
        rows: list[list[str]] = []
        for row in root.findall("a:sheetData/a:row", NS):
            out: list[str] = []
            for cell in row.findall("a:c", NS):
                idx = column_index(cell.attrib["r"])
                while len(out) <= idx:
                    out.append("")
                out[idx] = cell_value(cell, shared_strings).strip()
            rows.append(out)

    if not rows:
        return []
    headers = rows[0]
    records: list[dict[str, str]] = []
    for row in rows[1:]:
        if not any(row):
            continue
        records.append({headers[i]: row[i] if i < len(row) else "" for i in range(len(headers))})
    return records


def read_tsv(path: Path) -> list[dict[str, str]]:
    lines = path.read_text(encoding="utf-8-sig").splitlines()
    headers = lines[0].split("\t")
    rows = []
    for line in lines[1:]:
        if not line.strip():
            continue
        parts = line.split("\t")
        rows.append({headers[i]: parts[i] if i < len(parts) else "" for i in range(len(headers))})
    return rows


def read_relation_map(path: Path) -> dict[int, str]:
    lines = path.read_text(encoding="utf-8-sig").splitlines()
    relation_by_id: dict[int, str] = {}
    for line in lines[1:]:
        if not line.strip():
            continue
        name, rel_id = line.split()
        relation_by_id[int(rel_id)] = name
    return relation_by_id


def split_terms(value: str) -> list[str]:
    if not value:
        return []
    terms = re.split(r"\s*,\s*|\s*/\s*|\s*;\s*", value)
    return unique([term.strip() for term in terms if term.strip()])


def unique(values: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for value in values:
        key = value.casefold().strip()
        if not key or key in seen:
            continue
        seen.add(key)
        out.append(value.strip())
    return out


def normalize_term(value: str) -> str:
    return re.sub(r"\s+", " ", value.casefold()).strip()


def build_payload() -> dict[str, Any]:
    products_meta = {
        row["product_name"]: row
        for row in read_xlsx_sheet(SOURCE_XLSX, "xl/worksheets/sheet1.xml")
        if row.get("product_name")
    }
    products_by_id = read_tsv(KGAT_DATASET / "product2id.tsv")
    entities = {
        int(row["new_id"]): {
            "old_id": int(row["old_id"]),
            "entity_type": row["entity_type"],
            "entity_name": row["entity_name"],
        }
        for row in read_tsv(KGAT_DATASET / "entity2id_typed.tsv")
    }
    relation_by_id = read_relation_map(KGAT_DATASET / "relation2id.txt")

    kg_edges: list[dict[str, Any]] = []
    product_terms: dict[int, dict[str, list[str]]] = {
        int(row["new_product_id"]): {"accords": [], "visual_notes": [], "families": [], "global_accords": []}
        for row in products_by_id
    }

    for line in (KGAT_DATASET / "kg_final.txt").read_text(encoding="utf-8-sig").splitlines():
        if not line.strip():
            continue
        head_id, relation_id, tail_id = (int(part) for part in line.split())
        head = entities[head_id]
        tail = entities[tail_id]
        relation_name = relation_by_id[relation_id]
        head_product_id = str(head_id) if head["entity_type"] == "product" else None
        tail_product_id = str(tail_id) if tail["entity_type"] == "product" else None

        kg_edges.append(
            {
                "head_entity_id": head_id,
                "head_entity_type": head["entity_type"],
                "head_name": head["entity_name"],
                "relation_id": relation_id,
                "relation_name": relation_name,
                "tail_entity_id": tail_id,
                "tail_entity_type": tail["entity_type"],
                "tail_name": tail["entity_name"],
                "head_product_id": head_product_id,
                "tail_product_id": tail_product_id,
                "source_dataset": SOURCE_DATASET,
                "model_version": MODEL_VERSION,
            }
        )

        if head["entity_type"] == "product":
            bucket = product_terms.setdefault(head_id, {"accords": [], "visual_notes": [], "families": [], "global_accords": []})
            if relation_name == "has_accord":
                bucket["accords"].append(tail["entity_name"])
            elif relation_name == "has_visual_note":
                bucket["visual_notes"].append(tail["entity_name"])
            elif relation_name == "belongs_to_family":
                bucket["families"].append(tail["entity_name"])
            elif relation_name == "has_global_accord":
                bucket["global_accords"].append(tail["entity_name"])

    products: list[dict[str, Any]] = []
    embeddings: list[dict[str, Any]] = []

    for row in products_by_id:
        kgat_product_id = int(row["new_product_id"])
        old_entity_id = int(row["old_entity_id"])
        name = row["product_name"]
        meta = products_meta.get(name, {})
        terms = product_terms.get(kgat_product_id, {"accords": [], "visual_notes": [], "families": [], "global_accords": []})
        accords = unique(split_terms(meta.get("main_accords", "")) + terms["accords"] + terms["global_accords"])
        visual_notes = unique(split_terms(meta.get("visual_note", "")) + terms["visual_notes"])
        family = meta.get("olfactory_family") or (terms["families"][0] if terms["families"] else "")
        product = {
            "product_id": str(kgat_product_id),
            "kgat_product_id": kgat_product_id,
            "old_entity_id": old_entity_id,
            "product_name": name,
            "visual_note": meta.get("visual_note") or None,
            "visual_note_alt": meta.get("visual_note_alt") or None,
            "revolutionize": meta.get("revolutionize") or None,
            "main_accords": ", ".join(accords) if accords else (meta.get("main_accords") or None),
            "olfactory_family": family or None,
            "meaning": meta.get("meaning") or None,
            "data_quality": meta.get("data_quality") or None,
            "accords": accords,
            "visual_notes": visual_notes,
            "metadata": {
                "recommendation_engine": RECOMMENDATION_ENGINE,
                "model_version": MODEL_VERSION,
                "source_dataset": SOURCE_DATASET,
                "source_row_no": meta.get("no") or None,
            },
        }
        products.append(product)

        feature_terms = unique(
            [normalize_term(term) for term in accords]
            + [normalize_term(term) for term in visual_notes]
            + ([normalize_term(family)] if family else [])
        )
        embeddings.append(
            {
                "product_id": str(kgat_product_id),
                "model_version": MODEL_VERSION,
                "embedding": None,
                "feature_terms": feature_terms,
                "features": {
                    "accords": accords,
                    "visual_notes": visual_notes,
                    "olfactory_family": family or None,
                    "revolutionize": product["revolutionize"],
                    "meaning": product["meaning"],
                    "note": "KGAT checkpoint embeddings are not present locally; metadata features serve the pilot retrieval fallback.",
                },
            }
        )

    return {
        "model_version": MODEL_VERSION,
        "recommendation_engine": RECOMMENDATION_ENGINE,
        "products": products,
        "kg_edges": kg_edges,
        "product_embeddings": embeddings,
    }


def load_env(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.exists():
        return values
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def rest_upsert(url: str, key: str, table: str, rows: list[dict[str, Any]], on_conflict: str, batch_size: int) -> None:
    endpoint = f"{url.rstrip('/')}/rest/v1/{table}?on_conflict={urllib.parse.quote(on_conflict)}"
    for start in range(0, len(rows), batch_size):
        batch = rows[start : start + batch_size]
        request = urllib.request.Request(
            endpoint,
            data=json.dumps(batch, ensure_ascii=False).encode("utf-8"),
            method="POST",
            headers={
                "apikey": key,
                "authorization": f"Bearer {key}",
                "content-type": "application/json",
                "prefer": "resolution=merge-duplicates,return=minimal",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                if response.status not in (200, 201, 204):
                    raise RuntimeError(f"Unexpected status {response.status} while uploading {table}")
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"Upload failed for {table}: HTTP {exc.code}: {body}") from exc


def upload_payload(payload: dict[str, Any], env_path: Path, batch_size: int) -> None:
    env = load_env(env_path)
    url = env.get("VITE_SUPABASE_URL") or env.get("SUPABASE_URL")
    key = env.get("SUPABASE_SEED_KEY") or env.get("VITE_SUPABASE_PUBLISHABLE_KEY") or env.get("SUPABASE_PUBLISHABLE_KEY")
    if not url or not key:
        raise RuntimeError(f"Missing Supabase URL/key in {env_path}")

    rest_upsert(url, key, "products", payload["products"], "product_id", batch_size)
    rest_upsert(
        url,
        key,
        "kg_edges",
        payload["kg_edges"],
        "head_entity_id,relation_id,tail_entity_id,model_version",
        batch_size,
    )
    rest_upsert(url, key, "product_embeddings", payload["product_embeddings"], "product_id,model_version", batch_size)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--env", type=Path, default=DEFAULT_ENV)
    parser.add_argument("--upload", action="store_true")
    parser.add_argument("--batch-size", type=int, default=500)
    args = parser.parse_args()

    payload = build_payload()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {args.output}")
    print(f"products={len(payload['products'])} kg_edges={len(payload['kg_edges'])} product_embeddings={len(payload['product_embeddings'])}")

    if args.upload:
        upload_payload(payload, args.env, args.batch_size)
        print("Uploaded serving payload to Supabase")

    return 0


if __name__ == "__main__":
    sys.exit(main())
