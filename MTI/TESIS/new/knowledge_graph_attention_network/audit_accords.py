# -*- coding: utf-8 -*-
"""Audit read-only: vocab accord + isolasi referensi + T4. TIDAK ubah data."""
import json
import build_dataset as B  # impor fungsi build (B sudah set stdout utf-8)

P_PROD = "Data/dataset-aromatique.xlsx"
P_GLOB = "Data/global_reference.xlsx"
P_ALI = "Data/ref_aliases.tsv"

prods = B.load_products(P_PROD)
grows, acols, ov = B.load_global_reference(P_GLOB)
al = B.load_aliases(P_ALI)
byraw = {B.norm(g["Revolutionize"]): g for g in grows}
byinterp = {B.norm(g["interpreted_as"]): g for g in grows}

# ---- vocab lokal & per-produk local accords -------------------------------
local_vocab = set()
prod_local = {}
for p in prods:
    la = B.split_local_accords(p.get("main_accords"))
    prod_local[str(p["product_name"]).strip()] = la
    local_vocab |= set(la)

# ---- resolusi ref -> global accords ---------------------------------------
ref_acc = {}     # ref_name -> [global accord]
prod_ref = {}    # product_name -> ref_name
t4 = []          # (prod, rev, interp, global_accords)
for p in prods:
    pn = str(p["product_name"]).strip()
    res = B.resolve_reference(pn, p.get("revolutionize"), byraw, byinterp, ov, al)
    if res is None:
        continue
    name, g, tier = res
    prod_ref[pn] = name
    if g is not None:
        ga = B.split_global_accords(g, acols)
        ref_acc[name] = ga
    if tier == "T4_prefix":
        t4.append((pn, str(p.get("revolutionize")).strip(), name,
                   B.split_global_accords(g, acols) if g else []))

global_vocab = set()
for ga in ref_acc.values():
    global_vocab |= set(ga)

print("=" * 70)
print("AUDIT ACCORD VOCAB + ISOLASI REFERENSI (read-only)")
print("=" * 70)
print("local_vocab=%d  global_vocab=%d  shared=%d  global_only=%d"
      % (len(local_vocab), len(global_vocab),
         len(local_vocab & global_vocab), len(global_vocab - local_vocab)))

# =====================================================================
# A. AUDIT SPLIT ACCORD
# =====================================================================
print("\n" + "#" * 70)
print("# A. AUDIT SPLIT ACCORD (Flag 1)")
print("#" * 70)

print("\n[A.1] SEMUA accord global (%d) terurut  [S=single-word M=multi-word]:"
      % len(global_vocab))
for a in sorted(global_vocab):
    tag = "M" if " " in a else "S"
    inloc = "*lokal" if a in local_vocab else ""
    print("   [%s] %-28s %s" % (tag, a, inloc))

print("\n[A.2] Token mencurigakan berdiri sendiri (fragmen?):")
suspects = ["fresh", "spicy", "warm", "dry", "soft", "sweet", "woody"]
for tok in suspects:
    has_single = tok in global_vocab
    parents = sorted(a for a in global_vocab if " " in a and tok in a.split())
    flag = ""
    if has_single and parents:
        flag = "  <-- BUG SPLIT? single + multiword dua-duanya ada"
    print("   '%s': single_node=%s | multiword_parent=%s%s"
          % (tok, has_single, parents, flag))

print("\n[A.4] Multi-word: lokal=%d  global=%d  global_multiword_TANPA_pasangan_lokal=%d"
      % (len([a for a in local_vocab if " " in a]),
         len([a for a in global_vocab if " " in a]),
         len({a for a in global_vocab if " " in a} - local_vocab)))
print("   global multiword tanpa pasangan lokal:")
for a in sorted({a for a in global_vocab if " " in a} - local_vocab):
    print("      ", a)

# =====================================================================
# B. ISOLASI REFERENSI EKSAK
# =====================================================================
print("\n" + "#" * 70)
print("# B. ISOLASI REFERENSI (Flag 2)")
print("#" * 70)

# node accord BERSAMA = irisan vocab (merge_accord=on -> id sama jika nama sama)
shared_nodes = local_vocab & global_vocab
# accord -> produk (via has_accord lokal)
acc_to_prod = {}
for pn, la in prod_local.items():
    for a in la:
        acc_to_prod.setdefault(a, set()).add(pn)

labeled_refs = sorted(set(prod_ref.values()))
isolated = []
for ref in labeled_refs:
    gacc = set(ref_acc.get(ref, []))
    # jalur: ref -> global accord -> node bersama -> produk
    reach = set()
    for a in gacc:
        if a in shared_nodes:
            reach |= acc_to_prod.get(a, set())
    if not reach:
        isolated.append(ref)

print("\n[B.5] referensi berlabel=%d  TERISOLASI (tak ada jalur ke produk via accord)=%d"
      % (len(labeled_refs), len(isolated)))
for r in isolated:
    print("       ISOLATED:", r, "| global_accords=", ref_acc.get(r, "NONE"))

# B.6 per fold
fa = json.load(open("Data/aromatique/fold_assignment.json", encoding="utf-8"))
# map user_id -> ref_name via ref_user_entity_map
uid2ref = {}
with open("Data/aromatique/ref_user_entity_map.txt", encoding="utf-8") as f:
    next(f)
    for ln in f:
        name, uid, eid = ln.rstrip("\n").split("\t")
        uid2ref[int(uid)] = name
iso_set = set(isolated)
print("\n[B.6] ref terisolasi di test-set per fold:")
for fk, fold in enumerate(fa["folds"]):
    refs_in_fold = {uid2ref[e["user_id"]] for e in fold}
    iso_here = refs_in_fold & iso_set
    print("   fold_%d: test_refs=%d  terisolasi=%d" % (fk, len(refs_in_fold), len(iso_here)))

# =====================================================================
# C. AUDIT T4 PREFIX
# =====================================================================
print("\n" + "#" * 70)
print("# C. AUDIT T4_prefix (Flag 3)")
print("#" * 70)
for pn, rev, interp, ga in t4:
    print("\n   produk        : %s" % pn)
    print("   revolutionize : %s" % rev)
    print("   interpreted_as: %s" % interp)
    print("   global_accords: %s" % ga)
