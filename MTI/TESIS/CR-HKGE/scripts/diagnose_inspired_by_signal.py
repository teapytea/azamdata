"""Diagnostic: does inspired_by carry signal KGAT does not already capture?

Report-only, NO training. Four analyses (see DIAGNOSTIC_REPORT.md):
  1. Redundancy of inspired_by with sem_similar / accords / family.
  2. Structural-proximity ranking proxy for plain-KGAT embedding similarity
     (multi-hop diffusion over the EXACT graph KGAT sees WITHOUT inspired_by;
     real trained embeddings can be supplied via --kgat_embeddings).
  3. inspired_by-exclusive same-reference pairs (the only headroom).
  4. Standard-product reachability to enriched via sem_similar.

Relations (full KG): 0 inspired_by, 1 has_accord, 2 has_visual_note,
3 belongs_to_family, 4 sem_similar, 5 has_global_accord, 6 belongs_to_global_family.
"""
from __future__ import annotations
import argparse
import collections
from itertools import combinations
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
R_INSPIRED, R_ACCORD, R_NOTE, R_FAMILY, R_SEM = 0, 1, 2, 3, 4
NONCROSS_RELS = {R_ACCORD, R_NOTE, R_FAMILY, R_SEM}  # what KGAT sees under hold-out


def load(dataset):
    base = ROOT / dataset
    kg = np.loadtxt(base / "kg_final.txt", dtype=np.int64)
    # product ids = rows of product2id.tsv (0..n_items-1)
    prod_lines = (base / "product2id.tsv").read_text(encoding="utf-8-sig").splitlines()[1:]
    n_items = sum(1 for l in prod_lines if l.strip())
    n_entities = int(max(kg[:, 0].max(), kg[:, 2].max())) + 1
    return kg, n_items, n_entities


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dataset", default="dataset-aromatique-crhkge-ready")
    ap.add_argument("--kgat_embeddings", default="",
                    help="optional .npy of shape [n_items, d] of trained KGAT product embeddings")
    ap.add_argument("--topk", default="5,10,20")
    args = ap.parse_args()
    Ks = [int(x) for x in args.topk.split(",")]

    kg, n_items, n_entities = load(args.dataset)
    print("dataset=%s  n_items=%d  n_entities=%d  kg_edges=%d" %
          (args.dataset, n_items, n_entities, len(kg)))

    # ---- index the KG ----
    product_refs = collections.defaultdict(set)     # product -> {global_ref}
    product_accords = collections.defaultdict(set)
    product_families = collections.defaultdict(set)
    product_notes = collections.defaultdict(set)
    sem_pairs = set()                               # frozenset({p,q}) product-product
    sem_adj = collections.defaultdict(set)
    adj = collections.defaultdict(set)              # G_minus (no inspired_by/global)
    for h, r, t in kg:
        h, r, t = int(h), int(r), int(t)
        if h < n_items and r == R_INSPIRED:
            product_refs[h].add(t)
        if h < n_items and r == R_ACCORD:
            product_accords[h].add(t)
        if h < n_items and r == R_FAMILY:
            product_families[h].add(t)
        if h < n_items and r == R_NOTE:
            product_notes[h].add(t)
        if r == R_SEM and h < n_items and t < n_items:
            sem_pairs.add(frozenset((h, t)))
            sem_adj[h].add(t); sem_adj[t].add(h)
        if r in NONCROSS_RELS:
            adj[h].add(t); adj[t].add(h)

    enriched = sorted(product_refs)                 # products with inspired_by
    standard = [p for p in range(n_items) if p not in product_refs]
    ref_to_products = collections.defaultdict(set)
    for p, refs in product_refs.items():
        for g in refs:
            ref_to_products[g].add(p)

    # same_global_reference positive pairs (test-label positives)
    same_ref_pairs = set()
    for g, prods in ref_to_products.items():
        for a, b in combinations(sorted(prods), 2):
            same_ref_pairs.add((a, b))
    same_ref_pairs = sorted(same_ref_pairs)
    P = len(same_ref_pairs)
    print("\nenriched=%d standard=%d global_refs=%d same_reference_pairs=%d" %
          (len(enriched), len(standard), len(ref_to_products), P))

    def shared(a, b, d):
        return d.get(a, set()) & d.get(b, set())

    # ===== ANALYSIS 1 =====
    sem_direct = sum(1 for a, b in same_ref_pairs if frozenset((a, b)) in sem_pairs)
    acc_shared_counts = [len(shared(a, b, product_accords)) for a, b in same_ref_pairs]
    fam_shared = sum(1 for a, b in same_ref_pairs if shared(a, b, product_families))
    acc_ge1 = sum(1 for c in acc_shared_counts if c >= 1)

    # ---- BFS shortest paths in G_minus from each enriched product ----
    def bfs(src, targets):
        dist = {src: 0}
        q = collections.deque([src])
        need = set(targets)
        out = {}
        while q and need:
            u = q.popleft()
            for v in adj[u]:
                if v not in dist:
                    dist[v] = dist[u] + 1
                    if v in need:
                        out[v] = dist[v]; need.discard(v)
                    q.append(v)
        for t in need:
            out[t] = np.inf
        return out

    # distances for same_ref pairs (BFS per unique anchor)
    by_anchor = collections.defaultdict(list)
    for a, b in same_ref_pairs:
        by_anchor[a].append(b)
    pair_dist = {}
    for a, bs in by_anchor.items():
        d = bfs(a, bs)
        for b in bs:
            pair_dist[(a, b)] = d[b]
    dists = np.array([pair_dist[(a, b)] for a, b in same_ref_pairs], dtype=float)
    finite = dists[np.isfinite(dists)]

    print("\n=== ANALYSIS 1: redundancy of inspired_by ===")
    print("(a) same-ref pairs DIRECTLY sem_similar-connected: %d/%d = %.1f%%" %
          (sem_direct, P, 100*sem_direct/P))
    print("(b) same-ref pairs sharing >=1 accord: %d/%d = %.1f%% ; avg shared accords (all pairs)=%.2f"
          % (acc_ge1, P, 100*acc_ge1/P, float(np.mean(acc_shared_counts))))
    print("(c) same-ref pairs sharing same local family: %d/%d = %.1f%%" %
          (fam_shared, P, 100*fam_shared/P))
    print("(d) G_minus shortest path (inspired_by removed): mean=%.2f median=%.1f "
          "max(finite)=%.0f unreachable=%d/%d" %
          (finite.mean(), np.median(finite), finite.max(),
           int(np.isinf(dists).sum()), P))
    for d in [1, 2, 3]:
        print("     dist==%d: %d (%.1f%%)" % (d, int((dists == d).sum()), 100*(dists == d).sum()/P))
    print("     dist>=4 or inf: %d (%.1f%%)" %
          (int((dists >= 4).sum() + np.isinf(dists).sum()),
           100*((dists >= 4).sum() + np.isinf(dists).sum())/P))
    reachable_12 = (dists <= 2).sum()
    print("  => %.1f%% of same-ref pairs are within 2 hops WITHOUT inspired_by" % (100*reachable_12/P))

    # ===== ANALYSIS 2 (structural proxy or real embeddings) =====
    print("\n=== ANALYSIS 2: do same-ref partners rank high WITHOUT inspired_by? ===")
    partners = collections.defaultdict(set)
    for a, b in same_ref_pairs:
        partners[a].add(b); partners[b].add(a)

    if args.kgat_embeddings:
        E = np.load(args.kgat_embeddings)[:n_items]
        En = E / (np.linalg.norm(E, axis=1, keepdims=True) + 1e-12)
        sim = En @ En.T
        source = "REAL trained KGAT embeddings (%s)" % args.kgat_embeddings
    else:
        # Structural proxy: symmetric-normalized multi-hop diffusion over G_minus
        # (relations 1-4 only, NEVER inspired_by) = the proximity KGAT can learn
        # under hold-out. S = sum_{l=1..3} A_hat^l, product-product block.
        A = np.zeros((n_entities, n_entities), dtype=np.float64)
        for u in adj:
            for v in adj[u]:
                A[u, v] = 1.0
        A += np.eye(n_entities)
        deg = A.sum(1)
        dinv = 1.0 / np.sqrt(np.maximum(deg, 1e-12))
        Ahat = (A * dinv).T * dinv
        S = np.zeros_like(Ahat); P_l = np.eye(n_entities)
        for _l in range(3):
            P_l = P_l @ Ahat
            S += P_l
        sim = S[:n_items, :n_items]
        source = "STRUCTURAL PROXY (3-hop diffusion over sem_similar+accords+family+notes; NO inspired_by; no trained weights on disk)"
    print("ranking source:", source)

    np.fill_diagonal(sim, -np.inf)
    anchors_with_partners = [a for a in enriched if partners[a]]
    ranks, rec = [], {k: [] for k in Ks}
    for a in anchors_with_partners:
        order = np.argsort(-sim[a])              # best-first
        pos = {item: i for i, item in enumerate(order)}  # rank (0-based, lower=closer)
        for b in partners[a]:
            ranks.append(pos[b])
        for k in Ks:
            topk = set(order[:k].tolist())
            rec[k].append(len(topk & partners[a]) / len(partners[a]))
    ranks = np.array(ranks, dtype=float)
    cand = n_items - 1
    print("anchors with >=1 same-ref partner: %d (partner instances: %d)" %
          (len(anchors_with_partners), len(ranks)))
    if len(ranks):
        print("same-ref partner rank (0=closest of %d): mean=%.1f median=%.0f  (random mean ~%.0f)" %
              (cand, ranks.mean(), np.median(ranks), cand/2))
        print("mean percentile of partners: top %.1f%% of catalogue" % (100*ranks.mean()/cand))
        for k in Ks:
            print("recall@%d of same-ref partners = %.3f   (random ~%.3f)" %
                  (k, float(np.mean(rec[k])), k/cand))

    # ===== ANALYSIS 3: inspired_by-exclusive pairs =====
    print("\n=== ANALYSIS 3: inspired_by-EXCLUSIVE same-ref pairs ===")
    excl_loose = []   # no direct sem_similar AND 0 shared accords
    excl_strict = []  # + 0 shared family AND 0 shared notes (truly only inspired_by)
    for a, b in same_ref_pairs:
        no_sem = frozenset((a, b)) not in sem_pairs
        no_acc = len(shared(a, b, product_accords)) == 0
        if no_sem and no_acc:
            excl_loose.append((a, b))
            if not shared(a, b, product_families) and not shared(a, b, product_notes):
                excl_strict.append((a, b))
    print("loose (no direct sem_similar AND 0 shared accords): %d/%d = %.1f%%" %
          (len(excl_loose), P, 100*len(excl_loose)/P))
    print("strict (also 0 shared family AND 0 shared notes -> ONLY inspired_by links): %d/%d = %.1f%%" %
          (len(excl_strict), P, 100*len(excl_strict)/P))
    if excl_loose:
        dl = np.array([pair_dist[p] for p in excl_loose], dtype=float)
        print("loose-exclusive G_minus distance: mean=%.2f median=%.1f unreachable=%d" %
              (dl[np.isfinite(dl)].mean() if np.isfinite(dl).any() else np.inf,
               np.median(dl[np.isfinite(dl)]) if np.isfinite(dl).any() else np.inf,
               int(np.isinf(dl).sum())))

    # ===== ANALYSIS 4: standard-product reachability =====
    print("\n=== ANALYSIS 4: standard-product reachability via sem_similar ===")
    deg_to_enriched = []
    enr_set = set(enriched)
    have = 0
    for p in standard:
        c = len(sem_adj[p] & enr_set)
        deg_to_enriched.append(c)
        if c >= 1:
            have += 1
    dte = np.array(deg_to_enriched)
    print("standard products with >=1 sem_similar link to an enriched product: %d/%d = %.1f%%" %
          (have, len(standard), 100*have/max(1, len(standard))))
    print("sem_similar links to enriched per standard product: mean=%.2f median=%.0f max=%d min=%d" %
          (dte.mean(), np.median(dte), dte.max(), dte.min()))
    for thr in [0, 1, 3, 5, 10]:
        print("   >= %2d enriched sem-neighbors: %d (%.1f%%)" %
              (thr, int((dte >= thr).sum()), 100*(dte >= thr).sum()/len(standard)))


if __name__ == "__main__":
    main()
