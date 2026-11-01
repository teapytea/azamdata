# -*- coding: utf-8 -*-
"""
build_dataset.py — Konstruksi dataset Aromatique -> format KGAT/CR-HKGE.

Spesifikasi: GUIDE_01_Konstruksi_Dataset_CRHKGE.md

Aturan keras:
  - Label HANYA `inspired_by` (produk -> referensi). TIDAK ada positive_pair_scores.
  - Tidak ada angka hasil eksperimen di sini; hanya membangun data + laporan sanity.
  - Semua toggle ablation via argumen, bukan hardcode.

Framing retrieval cross-reference:
  user/query = parfum referensi global ; item/target = produk Aromatique ;
  interaksi/label = relasi inspired_by.

Output (per fold) mengikuti konvensi loader KGAT (Model/utility/load_data.py):
  train.txt / test.txt : "user_id item_id [item_id ...]"
  kg_final.txt         : "head relation tail" (id entity)
  *_list.txt           : "org_name remap_id"
"""

import argparse
import json
import os
import sys
import io
import re
from collections import defaultdict, OrderedDict

import openpyxl

# token placeholder (bukan accord nyata) -> dibuang. Flag 2 cleanup.
PLACEHOLDER_TOKENS = {"", "-", "--", "—", "–", "n/a", "na", "none", "null", "nan"}

# stdout utf-8 (Windows cp1252 aman)
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")


# ----------------------------------------------------------------------------
# Util
# ----------------------------------------------------------------------------
_SYN = {}  # peta sinonim accord (opsional, §2.5). norm_variant -> norm_canonical


def norm(s):
    """Lowercase + strip. Kunci normalisasi tunggal untuk accord/nama (D1)."""
    if s is None:
        return ""
    return str(s).strip().lower()


def norm_token(s):
    """Token accord/visual-note ternormalisasi (lower + strip + sinonim §2.5)."""
    t = norm(s)
    return _SYN.get(t, t)


def valid_token(t):
    """Buang token kosong/placeholder ('—', '-', 'n/a', ...). Flag 2 cleanup."""
    return bool(t) and t not in PLACEHOLDER_TOKENS


def load_synonyms(path):
    """
    §2.5 (opsional, default OFF): file accord_synonyms.tsv -> peta sinonim manual.
    Format TSV: variant <TAB> canonical (mis. 'vanila' -> 'vanilla').
    Default: tidak dipakai (cocok string ternormalisasi apa adanya).
    """
    syn = {}
    if not path or not os.path.exists(path):
        return syn
    with open(path, encoding="utf-8") as f:
        for ln in f:
            ln = ln.rstrip("\n")
            if not ln or ln.startswith("#"):
                continue
            cols = ln.split("\t")
            if cols[0].strip().lower() in ("variant", "from"):
                continue
            if len(cols) >= 2 and cols[0].strip() and cols[1].strip():
                syn[norm(cols[0])] = norm(cols[1])
    return syn


def split_local_accords(raw):
    """main_accords lokal: split koma."""
    if not raw:
        return []
    return [t for t in (norm_token(x) for x in str(raw).split(",")) if valid_token(t)]


def split_global_accords(row, accord_cols):
    """
    Global main_accord: split delimiter ';' DAN ',' (FLAG 1: sumber tak konsisten,
    mayoritas baris pakai ',' -> kalau hanya split ';' seluruh list jadi 1 node
    sampah). UNION accord_1..accord_10. Buang placeholder & duplikat.
    """
    toks = []
    raw = row.get("main_accord")
    if raw:
        toks += [norm_token(x) for x in re.split(r"[;,]", str(raw))]
    for c in accord_cols:
        v = row.get(c)
        if v:
            toks.append(norm_token(v))
    out, seen = [], set()
    for t in toks:
        if valid_token(t) and t not in seen:
            seen.add(t)
            out.append(t)
    return out


def split_visual_notes(*raws):
    """Visual note: split '/' dari visual_note (+ alt), normalisasi, dedup."""
    out, seen = [], set()
    for raw in raws:
        if not raw:
            continue
        for x in str(raw).split("/"):
            t = norm_token(x)
            if valid_token(t) and t not in seen:
                seen.add(t)
                out.append(t)
    return out


# ----------------------------------------------------------------------------
# Load input
# ----------------------------------------------------------------------------
def load_products(path):
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb["Sheet1"]
    hdr = list(next(ws.iter_rows(min_row=1, max_row=1, values_only=True)))
    prods = []
    for r in ws.iter_rows(min_row=2, values_only=True):
        if r[1] is None:
            continue
        prods.append(dict(zip(hdr, r)))
    wb.close()
    return prods


def load_global_reference(path):
    """
    global_reference.xlsx:
      Sheet1     : header pada baris ke-2 (row index 1). Data setelahnya.
      Ambiguous / Ambiguous_New : override original_name -> interpreted_as.
    """
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    rows = list(wb["Sheet1"].iter_rows(min_row=2, values_only=True))
    ghdr = list(rows[0])
    accord_cols = [c for c in ghdr if c and str(c).startswith("accord_")]
    grows = []
    for r in rows[1:]:
        d = dict(zip(ghdr, r))
        if d.get("Revolutionize"):
            grows.append(d)

    overrides = OrderedDict()  # norm(original_name) -> interpreted_as (raw)
    for sh in ("Ambiguous", "Ambiguous_New"):
        if sh in wb.sheetnames:
            for r in wb[sh].iter_rows(min_row=2, values_only=True):
                if r[1]:
                    overrides[norm(r[1])] = str(r[2]).strip()
    wb.close()
    return grows, accord_cols, overrides


# ----------------------------------------------------------------------------
# Entity resolution produk -> referensi
# ----------------------------------------------------------------------------
def load_aliases(path):
    """
    File alias entity-resolution manual (verified): produk yang revolutionize-nya
    tidak cocok exact karena urutan kata/abreviasi (mis. "Freedom Tommy Hilfiger"
    vs global "Tommy Hilfiger Freedom"). Di-key per NAMA PRODUK supaya produk
    berbeda dengan revolutionize sama tetap bisa dipetakan ke baris global berbeda
    (mis. Chance Eau Tendre EDT vs EDP).

    Format TSV: product_name <TAB> global_revolutionize <TAB> [note]
    Mengembalikan dict: norm(product_name) -> global_revolutionize (raw target).
    """
    aliases = {}
    if not path or not os.path.exists(path):
        return aliases
    with open(path, encoding="utf-8") as f:
        for ln in f:
            ln = ln.rstrip("\n")
            if not ln or ln.startswith("#"):
                continue
            cols = ln.split("\t")
            if cols[0].strip().lower() == "product_name":
                continue
            if len(cols) >= 2 and cols[0].strip() and cols[1].strip():
                aliases[norm(cols[0])] = cols[1].strip()
    return aliases


def resolve_reference(prod_name, prod_rev, by_raw, by_interp, overrides, aliases):
    """
    Kembalikan (ref_name_baku, global_row_or_None, tier_str) atau None bila unmatched.

    Tier (deterministik, semua dicatat di laporan):
      T0 alias    : nama produk ada di ref_aliases.tsv (verified manual) ->
                    petakan ke baris global_reference target.
      T1 override : revolutionize ada di sheet Ambiguous* -> interpreted_as.
      T2 raw      : cocok persis ke global_reference.Revolutionize.
      T3 interp   : cocok persis ke global_reference.interpreted_as.
      T4 prefix   : satu string adalah prefix dari yang lain (truncation/ejaan),
                    kandidat unik. Konservatif, dicatat untuk audit manual.
    """
    n = norm(prod_rev)

    # T0 alias (diutamakan; berlaku walau revolutionize kosong pun, tapi di sini
    # alias hanya dipakai utk produk enriched)
    na = norm(prod_name)
    if na in aliases:
        tgt = aliases[na]
        g = by_raw.get(norm(tgt)) or by_interp.get(norm(tgt))
        # nama baku: utamakan nama bersih dari override (sheet Ambiguous) bila ada,
        # karena interp baris global utk kasus ambigu kadang berupa kalimat catatan
        # (mis. '"Channel" dibetulkan...; nama final: Allure Homme Sport by Chanel').
        if n in overrides:
            name = overrides[n]
        elif g is not None:
            name = str(g["interpreted_as"]).strip()
        else:
            name = str(tgt).strip()
        return (str(name).strip(), g, "T0_alias")

    if not n or n == "no_revolutionize":
        return None

    # T1 override
    if n in overrides:
        name = overrides[n]
        g = by_interp.get(norm(name)) or by_raw.get(n)
        return (str(name).strip(), g, "T1_override")

    # T2 raw exact
    if n in by_raw:
        g = by_raw[n]
        return (str(g["interpreted_as"]).strip(), g, "T2_raw")

    # T3 interpreted_as exact
    if n in by_interp:
        g = by_interp[n]
        return (str(g["interpreted_as"]).strip(), g, "T3_interp")

    # T4 prefix containment (unik, len>=6)
    cands = []
    for gr_norm, g in by_raw.items():
        if len(gr_norm) >= 6 and (gr_norm.startswith(n) or n.startswith(gr_norm)):
            cands.append(g)
    if len(cands) == 1:
        g = cands[0]
        return (str(g["interpreted_as"]).strip(), g, "T4_prefix")

    return None


# ----------------------------------------------------------------------------
# Build
# ----------------------------------------------------------------------------
class IdSpace:
    """org_name(asli) -> remap_id berurutan, deterministik (urut abjad)."""

    def __init__(self):
        self._items = OrderedDict()  # display_name -> id (diisi setelah finalize)
        self._pending = set()

    def add(self, name):
        self._pending.add(name)

    def finalize(self, start=0):
        for i, name in enumerate(sorted(self._pending)):
            self._items[name] = start + i
        return start + len(self._items)

    def id(self, name):
        return self._items[name]

    def __contains__(self, name):
        return name in self._items

    def items(self):
        return self._items.items()

    def __len__(self):
        return len(self._items)


def build(args):
    rep = []  # baris laporan validasi

    def log(s=""):
        rep.append(s)
        print(s)

    log("=" * 70)
    log("BUILD DATASET AROMATIQUE -> KGAT  (GUIDE_01)")
    log("toggles: merge_accord=%s include_ref=%s sem_similar=%s seed=%d n_folds=%d"
        % (args.merge_accord, args.include_ref, args.sem_similar, args.seed, args.n_folds))
    log("=" * 70)

    global _SYN
    _SYN = load_synonyms(args.accord_synonyms)
    if _SYN:
        log("[input] accord_synonyms=%d (§2.5 AKTIF) -> %s" % (len(_SYN), args.accord_synonyms))

    products = load_products(args.products)
    grows, accord_cols, overrides = load_global_reference(args.global_ref)
    log("[input] products=%d  global_rows=%d  override_entries=%d"
        % (len(products), len(grows), len(overrides)))

    by_raw = {norm(g["Revolutionize"]): g for g in grows}
    by_interp = {norm(g["interpreted_as"]): g for g in grows}
    aliases = load_aliases(args.aliases)
    log("[input] ref_aliases=%d (manual verified)" % len(aliases))

    # ---- resolve setiap produk ke referensi ------------------------------
    # product display name unik: pakai product_name; bila duplikat tambah suffix #no
    prod_names = []
    seen_pn = {}
    for p in products:
        base = str(p["product_name"]).strip()
        if base in seen_pn:
            seen_pn[base] += 1
            base = "%s #%d" % (base, seen_pn[base])
        else:
            seen_pn[base] = 0
        prod_names.append(base)

    prod_ref = [None] * len(products)       # idx produk -> ref_name_baku
    prod_global = [None] * len(products)    # idx produk -> global_row (accords/family)
    tier_count = defaultdict(int)
    unmatched = []                          # produk enriched yang revolutionize tak ketemu
    no_revolutionize = []                   # produk tanpa inspirasi global (D4)
    missing_accords = []                    # data_quality MISSING_ACCORDS / accord lokal kosong
    t4_audit = []                           # (produk, rev, ref_name) hasil T4_prefix utk audit

    for i, p in enumerate(products):
        rev = p.get("revolutionize")
        has_rev = bool(rev) and norm(rev) != "no_revolutionize"
        res = resolve_reference(str(p["product_name"]).strip(), rev,
                                by_raw, by_interp, overrides, aliases)
        if not has_rev and res is None:
            no_revolutionize.append(prod_names[i])
            continue
        if res is None:
            unmatched.append((prod_names[i], str(rev).strip()))
            continue
        ref_name, g, tier = res
        prod_ref[i] = ref_name
        prod_global[i] = g
        tier_count[tier] += 1
        if tier == "T4_prefix":
            t4_audit.append((prod_names[i], str(rev).strip(), ref_name))

    # ---- kumpulkan node accord / family / visual ------------------------
    local_acc = IdSpace()
    global_acc = IdSpace()       # dipakai hanya bila merge_accord=off
    fam_local = IdSpace()
    fam_global = IdSpace()
    visnote = IdSpace()
    ref_space = IdSpace()        # referensi (entity + user)

    prod_local_accords = [None] * len(products)
    prod_visnotes = [None] * len(products)
    prod_family = [None] * len(products)

    for i, p in enumerate(products):
        la = split_local_accords(p.get("main_accords"))
        prod_local_accords[i] = la
        for a in la:
            local_acc.add(a)
        vn = split_visual_notes(p.get("visual_note"), p.get("visual_note_alt"))
        prod_visnotes[i] = vn
        for v in vn:
            visnote.add(v)
        fam = norm(p.get("olfactory_family"))
        # family lokal disimpan UPPERCASE sbg display (17 unik), id via abjad
        if p.get("olfactory_family"):
            disp = str(p["olfactory_family"]).strip().upper()
            prod_family[i] = disp
            fam_local.add(disp)
        if norm(p.get("data_quality")) == "missing_accords" or not la:
            if not la:
                missing_accords.append(prod_names[i])

    # referensi + global accord/family (hanya bila include_ref=on)
    ref_global_accords = {}   # ref_name -> [accord_norm]
    ref_global_family = {}    # ref_name -> family_global_display
    for i, p in enumerate(products):
        ref_name = prod_ref[i]
        if ref_name is None:
            continue
        ref_space.add(ref_name)
        g = prod_global[i]
        if args.include_ref == "on" and g is not None:
            ga = split_global_accords(g, accord_cols)
            ref_global_accords[ref_name] = ga
            for a in ga:
                if args.merge_accord == "on":
                    local_acc.add(a)      # node sama dengan lokal (D1)
                else:
                    global_acc.add(a)     # node terpisah (ablation)
            gf = g.get("global_family")
            if gf:
                disp = str(gf).strip()
                ref_global_family[ref_name] = disp
                fam_global.add(disp)

    # ---- assign id ENTITY: produk dulu (item id == entity id) -----------
    # produk menempati entity id 0..n_products-1 (konvensi KGAT)
    prod_entity_id = {prod_names[i]: i for i in range(len(products))}
    n_products = len(products)

    cur = n_products
    # referensi (bila include_ref=on -> jadi entity; bila off -> tidak ada entity)
    ref_entity_id = {}
    if args.include_ref == "on":
        ref_space.finalize(start=cur)
        for name, rid in ref_space.items():
            ref_entity_id[name] = rid
        cur += len(ref_space)
    else:
        # tetap perlu daftar referensi utk user-space, tapi tanpa entity
        ref_space.finalize(start=0)  # id sementara, hanya utk enumerasi user

    # accord
    cur = local_acc.finalize(start=cur)
    if args.merge_accord == "off":
        cur = global_acc.finalize(start=cur)
    # family lokal & global
    cur = fam_local.finalize(start=cur)
    cur = fam_global.finalize(start=cur)
    # visual note
    cur = visnote.finalize(start=cur)
    n_entities = cur

    # ---- user-space: referensi (semua model CF) -------------------------
    # user id 0..N-1 urut abjad nama referensi
    ref_user_id = {}
    for uid, name in enumerate(sorted(ref_space._pending if args.include_ref == "off"
                                      else dict(ref_space.items()).keys())):
        ref_user_id[name] = uid
    n_users = len(ref_user_id)

    def acc_entity_id(accord_norm, is_global):
        if args.merge_accord == "on":
            return local_acc.id(accord_norm)
        return global_acc.id(accord_norm) if is_global else local_acc.id(accord_norm)

    # ---- bangun triple KG (relasi 0-5 [+6]) -----------------------------
    triples = []          # (head_entity, rel, tail_entity)
    inspired_edges = []   # (prod_entity_id, ref_entity_id, user_id, prod_item_id) utk split
    REL = {"inspired_by": 0, "has_accord": 1, "has_visual_note": 2,
           "belongs_to_family": 3, "has_global_accord": 4,
           "belongs_to_global_family": 5, "sem_similar": 6}

    for i in range(n_products):
        pe = i  # entity id produk == item id
        # rel1 has_accord
        for a in prod_local_accords[i]:
            triples.append((pe, REL["has_accord"], acc_entity_id(a, False)))
        # rel2 has_visual_note
        for v in prod_visnotes[i]:
            triples.append((pe, REL["has_visual_note"], visnote.id(v)))
        # rel3 belongs_to_family
        if prod_family[i] is not None:
            triples.append((pe, REL["belongs_to_family"], fam_local.id(prod_family[i])))
        # rel0 inspired_by (+ catat utk train/test CF interaction)
        ref_name = prod_ref[i]
        if ref_name is not None and ref_name in ref_user_id:
            uid = ref_user_id[ref_name]
            if args.include_ref == "on":
                re_id = ref_entity_id[ref_name]
                inspired_edges.append((pe, re_id, uid, i))
                # KG edge entity-entity (produk -> referensi). §7 kg_final memuat
                # relasi 0; §8 edge test fold akan dihapus dari kg_final per fold.
                triples.append((pe, REL["inspired_by"], re_id))
            else:
                # include_ref=off: referensi bukan entity -> inspired_by hanya
                # hadir sbg interaksi CF di train/test, tak ada di kg_final.
                inspired_edges.append((pe, None, uid, i))

    # rel4/5: atribut global referensi (entity) — hanya include_ref=on
    if args.include_ref == "on":
        for name, re_id in ref_entity_id.items():
            for a in ref_global_accords.get(name, []):
                triples.append((re_id, REL["has_global_accord"], acc_entity_id(a, True)))
            gf = ref_global_family.get(name)
            if gf is not None:
                triples.append((re_id, REL["belongs_to_global_family"], fam_global.id(gf)))

    # rel6 sem_similar (opsional, buatan): same local family + >=2 shared local accords
    n_sem_pairs = 0
    if args.sem_similar == "on":
        by_fam = defaultdict(list)
        for i in range(n_products):
            if prod_family[i] is not None:
                by_fam[prod_family[i]].append(i)
        for fam, idxs in by_fam.items():
            for a_ in range(len(idxs)):
                for b_ in range(a_ + 1, len(idxs)):
                    i, j = idxs[a_], idxs[b_]
                    shared = set(prod_local_accords[i]) & set(prod_local_accords[j])
                    if len(shared) >= 2:
                        triples.append((i, REL["sem_similar"], j))
                        triples.append((j, REL["sem_similar"], i))
                        n_sem_pairs += 1

    # dedup triple, jaga deterministik
    triples = sorted(set(triples))

    # ---- 5-fold split atas edge inspired_by -----------------------------
    import random
    rng = random.Random(args.seed)
    edges = list(inspired_edges)
    rng.shuffle(edges)
    folds = [[] for _ in range(args.n_folds)]
    for k, e in enumerate(edges):
        folds[k % args.n_folds].append(e)

    # ---- tulis output ----------------------------------------------------
    out_root = args.out
    os.makedirs(out_root, exist_ok=True)

    def write_list(fp, pairs, header):
        with open(fp, "w", encoding="utf-8") as f:
            f.write(header + "\n")
            for name, rid in sorted(pairs, key=lambda x: x[1]):
                f.write("%s\t%d\n" % (name, rid))

    # *_list.txt (shared)
    write_list(os.path.join(out_root, "item_list.txt"),
               [(prod_names[i], i) for i in range(n_products)], "org_id\tremap_id")
    write_list(os.path.join(out_root, "user_list.txt"),
               list(ref_user_id.items()), "org_id\tremap_id")
    write_list(os.path.join(out_root, "relation_list.txt"),
               [(k, v) for k, v in REL.items()
                if v != 6 or args.sem_similar == "on"], "org_id\tremap_id")

    # entity_list (produk + referensi + accord + family + visnote)
    ent_pairs = [(prod_names[i], i) for i in range(n_products)]
    if args.include_ref == "on":
        ent_pairs += list(ref_entity_id.items())
    for name, rid in local_acc.items():
        ent_pairs.append(("accord::" + name, rid))
    if args.merge_accord == "off":
        for name, rid in global_acc.items():
            ent_pairs.append(("global_accord::" + name, rid))
    for name, rid in fam_local.items():
        ent_pairs.append(("family_local::" + name, rid))
    for name, rid in fam_global.items():
        ent_pairs.append(("family_global::" + name, rid))
    for name, rid in visnote.items():
        ent_pairs.append(("visnote::" + name, rid))
    write_list(os.path.join(out_root, "entity_list.txt"), ent_pairs, "org_id\tremap_id")

    # mapping referensi dual-role (FLAG 2)
    with open(os.path.join(out_root, "ref_user_entity_map.txt"), "w", encoding="utf-8") as f:
        f.write("ref_name\tuser_id\tentity_id\n")
        for name in sorted(ref_user_id):
            eid = ref_entity_id.get(name, -1) if args.include_ref == "on" else -1
            f.write("%s\t%d\t%d\n" % (name, ref_user_id[name], eid))

    # per-fold train/test/kg_final
    base_triples = triples  # sudah termasuk inspired_by semua fold
    inspired_set_by_fold = []
    for fk in range(args.n_folds):
        test_edges = folds[fk]
        train_edges = [e for f_ in range(args.n_folds) if f_ != fk for e in folds[f_]]

        # kg_final = base_triples MINUS inspired_by edge yang ada di test fold
        # (cegah kebocoran; has_global_accord referensi TETAP ada -> §8)
        test_inspired = set()
        for (pe, re_id, uid, item) in test_edges:
            if re_id is not None:
                test_inspired.add((pe, REL["inspired_by"], re_id))
        kg = [t for t in base_triples
              if not (t[1] == REL["inspired_by"] and t in test_inspired)]
        inspired_set_by_fold.append(test_inspired)

        fold_dir = os.path.join(out_root, "fold_%d" % fk)
        os.makedirs(fold_dir, exist_ok=True)

        # train/test dikelompokkan per user (multi-positive aware)
        def group(edges):
            d = defaultdict(list)
            for (pe, re_id, uid, item) in edges:
                d[uid].append(item)
            return d

        for fname, eds in (("train.txt", train_edges), ("test.txt", test_edges)):
            d = group(eds)
            with open(os.path.join(fold_dir, fname), "w", encoding="utf-8") as f:
                for uid in sorted(d):
                    items = sorted(set(d[uid]))
                    f.write("%d %s\n" % (uid, " ".join(str(x) for x in items)))

        with open(os.path.join(fold_dir, "kg_final.txt"), "w", encoding="utf-8") as f:
            for (h, r, t) in kg:
                f.write("%d %d %d\n" % (h, r, t))

    # fold assignment (reproducible)
    with open(os.path.join(out_root, "fold_assignment.json"), "w", encoding="utf-8") as f:
        json.dump({
            "seed": args.seed, "n_folds": args.n_folds,
            "folds": [[{"prod_item_id": e[3], "user_id": e[2],
                        "ref_entity_id": e[1]} for e in folds[fk]]
                      for fk in range(args.n_folds)]
        }, f, indent=2, ensure_ascii=False)

    # =====================================================================
    # §10 LAPORAN VALIDASI (sanity, bukan hasil eksperimen)
    # =====================================================================
    log("")
    log("#" * 70)
    log("# LAPORAN VALIDASI (§10)")
    log("#" * 70)

    # 1. jumlah entity per tipe & triple per relasi
    log("\n[1] Entity per tipe:")
    log("    produk            = %d (entity id 0..%d, == item id)" % (n_products, n_products - 1))
    log("    referensi         = %d %s" % (len(ref_user_id),
        "(entity+user)" if args.include_ref == "on" else "(user-only, tanpa atribut)"))
    log("    accord lokal      = %d" % len(local_acc))
    if args.merge_accord == "off":
        log("    accord global     = %d (TERPISAH, merge_accord=off)" % len(global_acc))
    log("    family lokal      = %d" % len(fam_local))
    log("    family global     = %d" % len(fam_global))
    log("    visual note       = %d" % len(visnote))
    log("    TOTAL entity      = %d" % n_entities)

    rel_count = defaultdict(int)
    for (_, r, _) in base_triples:
        rel_count[r] += 1
    inv_rel = {v: k for k, v in REL.items()}
    log("\n    Triple per relasi (KG penuh, sebelum hold-out):")
    for r in sorted(rel_count):
        log("      %d %-25s = %d" % (r, inv_rel[r], rel_count[r]))
    log("      TOTAL triple = %d" % len(base_triples))
    if args.sem_similar == "on":
        log("      (sem_similar pasangan unik = %d)" % n_sem_pairs)

    # 2. cek merge accord
    log("\n[2] Cek merge accord (D1):")
    if args.merge_accord == "on":
        # buktikan id sama utk nama sama dipakai rel1 & rel4
        local_used = set(t[2] for t in base_triples if t[1] == REL["has_accord"])
        global_used = set(t[2] for t in base_triples if t[1] == REL["has_global_accord"])
        shared = local_used & global_used
        log("    accord id dipakai has_accord(lokal) = %d node" % len(local_used))
        log("    accord id dipakai has_global_accord  = %d node" % len(global_used))
        log("    id accord BERSAMA (lokal & global)   = %d node  -> bukti merge OK" % len(shared))
        # contoh
        ex = sorted(shared)[:5]
        inv_acc = {rid: name for name, rid in local_acc.items()}
        log("    contoh node bersama: %s" % ", ".join("%s(id=%d)" % (inv_acc[i], i) for i in ex))
    else:
        log("    merge_accord=off -> accord lokal & global SENGAJA terpisah (ablation).")

    # 3. cek anti-bocor
    log("\n[3] Cek anti-bocor per fold:")
    leak_total = 0
    for fk in range(args.n_folds):
        fold_dir = os.path.join(out_root, "fold_%d" % fk)
        kg = set()
        with open(os.path.join(fold_dir, "kg_final.txt"), encoding="utf-8") as f:
            for ln in f:
                a, b, c = ln.split()
                kg.add((int(a), int(b), int(c)))
        leak = len(kg & inspired_set_by_fold[fk])
        leak_total += leak
        log("    fold_%d: edge inspired_by test bocor di kg_final = %d" % (fk, leak))
    log("    TOTAL kebocoran = %d %s" % (leak_total, "(OK)" if leak_total == 0 else "(GAGAL!)"))

    # 4. cek konektivitas ref test -> accord -> produk
    log("\n[4] Cek konektivitas (ref test -> accord -> produk):")
    if args.include_ref == "on" and args.merge_accord == "on":
        # bangun map accord->produk dari has_accord
        acc_to_prod = defaultdict(set)
        for (h, r, t) in base_triples:
            if r == REL["has_accord"]:
                acc_to_prod[t].add(h)
        ref_to_acc = defaultdict(set)
        for (h, r, t) in base_triples:
            if r == REL["has_global_accord"]:
                ref_to_acc[h].add(t)
        sample = folds[0][:20]
        reachable = 0
        for (pe, re_id, uid, item) in sample:
            accs = ref_to_acc.get(re_id, set())
            prods_reach = set()
            for a in accs:
                prods_reach |= acc_to_prod.get(a, set())
            if prods_reach:
                reachable += 1
        log("    sampel %d referensi test: punya jalur ke produk via accord = %d"
            % (len(sample), reachable))
        if sample and reachable < len(sample):
            log("    PERINGATAN: ada referensi terisolasi -> cek §2/§5.")
    else:
        log("    dilewati (perlu include_ref=on & merge_accord=on).")

    # 5. unmatched / missing / no_revolutionize
    log("\n[5] Sanity konstruksi (§1, §6):")
    log("    produk enriched (punya revolutionize)        = %d" % (len(products) - len(no_revolutionize)))
    log("    produk NO_REVOLUTIONIZE (D4, tanpa label)    = %d" % len(no_revolutionize))
    log("    produk enriched UNMATCHED (rev tak ketemu)   = %d" % len(unmatched))
    log("    produk accord lokal KOSONG (MISSING_ACCORDS) = %d" % len(missing_accords))
    log("    referensi unik (berlabel)                    = %d" % len(ref_user_id))
    log("    edge inspired_by (label) total               = %d" % len(inspired_edges))
    log("    resolusi per tier: %s" % dict(tier_count))
    # ref berlabel TANPA global accord (terisolasi via accord; §6 tandai eksplisit)
    attr_less = sorted(r for r in ref_user_id if not ref_global_accords.get(r))
    if args.include_ref == "on":
        log("    referensi TANPA global accord (terisolasi, §6 ditandai) = %d" % len(attr_less))
        for r in attr_less:
            log("        ISOLATED-REF: %s" % r)
    if t4_audit:
        log("    -- T4_prefix (resolusi prefix, perlu audit manual): --")
        for pn, rev, ref_name in t4_audit:
            log("        %-30s rev=%-35s -> %s" % (pn, rev, ref_name))
    if unmatched:
        log("    -- UNMATCHED (tetap kandidat/distractor, TANPA inspired_by) --")
        for pn, rev in unmatched:
            log("        %-30s rev=%s" % (pn, rev))

    # 6. konsistensi id
    log("\n[6] Konsistensi id:")
    bad = 0
    for (h, r, t) in base_triples:
        if not (0 <= h < n_entities and 0 <= t < n_entities):
            bad += 1
    max_item = max((e[3] for e in inspired_edges), default=-1)
    max_user = max((e[2] for e in inspired_edges), default=-1)
    log("    triple dgn id entity di luar [0,%d) = %d %s" % (n_entities, bad, "(OK)" if bad == 0 else "(GAGAL!)"))
    log("    max item id = %d (< n_products=%d : %s)" % (max_item, n_products, max_item < n_products))
    log("    max user id = %d (< n_users=%d : %s)" % (max_user, n_users, max_user < n_users))

    log("\n[done] output -> %s/" % out_root)
    log("       file: item_list.txt user_list.txt entity_list.txt relation_list.txt")
    log("             ref_user_entity_map.txt fold_assignment.json fold_0../fold_%d/" % (args.n_folds - 1))

    # tulis laporan ke file
    with open(os.path.join(out_root, "validation_report.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(rep))

    # catatan adaptasi loader (§5) -> diteruskan ke GUIDE model
    with open(os.path.join(out_root, "LOADER_NOTES.md"), "w", encoding="utf-8") as f:
        f.write(LOADER_NOTES % {
            "n_users": n_users, "n_products": n_products, "n_entities": n_entities,
            "ent_start_ref": n_products,
            "n_distractor": len(no_revolutionize) + len(unmatched),
        })


LOADER_NOTES = """# Catatan Adaptasi Loader (GUIDE_01 §5) -> diteruskan ke GUIDE model

## Dual-role referensi
Setiap referensi muncul DUA kali dengan id berbeda:
- **user_id** (ruang user, 0..%(n_users)d-1) untuk `train.txt`/`test.txt`.
- **entity_id** (ruang entity, mulai %(ent_start_ref)d) untuk `kg_final.txt`
  (edge `has_global_accord` / `belongs_to_global_family`).

Pemetaannya ada di `ref_user_entity_map.txt` (kolom: ref_name, user_id, entity_id).

## Konvensi id
- Produk = item: entity id 0..%(n_products)d-1 == item remap id (konvensi KGAT).
- n_entities = %(n_entities)d.
- Relasi: 0 inspired_by, 1 has_accord, 2 has_visual_note, 3 belongs_to_family,
  4 has_global_accord, 5 belongs_to_global_family, (6 sem_similar bila ON).

## inspired_by hadir DUA kali (sengaja, sesuai §7/§8)
- Sebagai **interaksi CF** di `train.txt`/`test.txt` (ref_user -> produk_item).
  `load_data.py` & `loader_kgat.py` menambahkannya sbg relasi 0 pada adjacency.
- Sebagai **edge KG** di `kg_final.txt` (produk_entity -> ref_entity, relasi 0),
  supaya ref_entity tersambung ke produk dalam propagasi graf.
Per fold, edge `inspired_by` test DIHAPUS dari KEDUA tempat (test.txt = hold-out;
kg_final = sudah dihapus saat build). `has_global_accord` ref TETAP ada (§8).

## Yang WAJIB diadaptasi di loader KGAT asli (utk GUIDE 02)
`Model/utility/load_data.py` hanya membaca train/test/kg_final dan TIDAK
mengantisipasi entity yang juga user. DUA adaptasi kritis:

1. **n_items HARUS dipaksa = jumlah produk (%(n_products)d), bukan
   `max(item_id)+1` dari interaksi.** `_statistic_ratings()` menurunkan
   `n_items` dari id terbesar yang muncul di interaksi. Padahal %(n_distractor)d
   produk distractor (NO_REVOLUTIONIZE + unmatched) TIDAK pernah jadi positif,
   sehingga bisa terbuang dari kandidat ranking. §8 mewajibkan ranking SELURUH
   produk. Override: `n_items = len(item_list.txt)`.

2. **Mayoritas referensi test TIDAK ada di train** (ref ber-edge tunggal: edge-nya
   hanya ada di 1 fold). Saat fold itu jadi test, ref tsb absen dari
   `train_user_dict`. Loader/eval harus tahan `KeyError` (anggap training_items=[]).
   Ini BUKAN bug data — justru keterbatasan transduktif yang ingin ditunjukkan
   (baseline tak punya embedding utk ref test); CR-HKGE menjawabnya secara inductive.

Untuk:
- **Baseline KGAT/CF lain**: user(ref) & entity(ref) TIDAK berbagi embedding ->
  keterbatasan transduktif yang ingin ditunjukkan. Format file valid utk loader
  bawaan SETELAH dua adaptasi di atas.
- **CR-HKGE (GUIDE berikutnya)**: ikat representasi user(ref) ke atribut
  global-accord-nya (inductive) memakai `ref_user_entity_map.txt`.

## Evaluasi
- 5-fold di folder `fold_0..fold_{n-1}`, seed tercatat di `fold_assignment.json`.
- Saat evaluasi: ranking SELURUH produk untuk tiap referensi query.
- Multi-positive: train/test sudah dikelompokkan per user (boleh >1 produk benar);
  pakai metrik multi-relevan (Hits@k/Recall@k; MRR ambil rank positif terbaik).
"""


def main():
    ap = argparse.ArgumentParser(description="Konstruksi dataset Aromatique -> KGAT (GUIDE_01)")
    ap.add_argument("--products", default="Data/dataset-aromatique.xlsx")
    ap.add_argument("--global_ref", default="Data/global_reference.xlsx")
    ap.add_argument("--aliases", default="Data/ref_aliases.tsv",
                    help="TSV alias entity-resolution manual (product_name -> global_revolutionize)")
    ap.add_argument("--accord_synonyms", default="Data/accord_synonyms.tsv",
                    help="(§2.5) TSV variant<TAB>canonical untuk sinonim/typo accord. "
                         "Default Data/accord_synonyms.tsv; kosongkan ('') untuk OFF.")
    ap.add_argument("--out", default="Data/aromatique")
    ap.add_argument("--merge_accord", choices=["on", "off"], default="on")
    ap.add_argument("--include_ref", choices=["on", "off"], default="on")
    ap.add_argument("--sem_similar", choices=["on", "off"], default="off")
    ap.add_argument("--seed", type=int, default=2019)
    ap.add_argument("--n_folds", type=int, default=5)
    args = ap.parse_args()
    build(args)


if __name__ == "__main__":
    main()
