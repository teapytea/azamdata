# Diagnostic: does `inspired_by` carry signal KGAT doesn't already capture?

**Report-only. No training.** Fast structural analysis on
`dataset-aromatique-crhkge-ready` (full KG: 340 products, 998 entities, 9 250 KG
edges). Reproduce with `python scripts/diagnose_inspired_by_signal.py`.

**Question.** Across three experiments (original CR-HKGE, Plan B, Plan C+) every
gain vanished under hold-out. Is `inspired_by` redundant with what KGAT already
learns from `sem_similar` + accords + family — i.e. is there *no headroom* to beat
KGAT under hold-out?

---

## Headline structural fact (frames everything below)

| quantity | value |
|---|---|
| enriched products (have `inspired_by`) | 243 |
| distinct global references | **241** |
| products per global reference | **239 refs → 1 product, 2 refs → 2 products** |
| `same_global_reference` product pairs | **2** |

Nearly every enriched product points to its **own unique** global reference. The
`same_global_reference` relation — the term the task calls "the test-label
positives" — therefore connects **2 pairs out of C(243,2) = 29 403 possible enriched
pairs (0.007 %)**. The test positives are in practice driven by attribute similarity
(local accord 2.0, family 1.5, etc.), **not** by shared reference. This alone says
the same-reference channel is almost empty; Analyses 1–3 below operate on those 2
pairs and a broader cross-reference-enrichment view is added for completeness.

---

## ANALYSIS 1 — Redundancy of `inspired_by` with existing relations
Over the 2 `same_global_reference` pairs, with `inspired_by` removed:

| metric | result |
|---|---|
| (a) directly `sem_similar`-connected | 1/2 = **50 %** |
| (b) share ≥1 accord (avg shared accords) | 2/2 = **100 %** (avg **3.0**) |
| (c) share the same local family | 2/2 = **100 %** |
| (d) shortest path in graph w/o `inspired_by` | mean **1.5**, max **2**, unreachable **0** |
| within 2 hops without `inspired_by` | **100 %** |

Both same-reference pairs are already 1–2 hops apart through `sem_similar` /
accords / family, share ≥1 accord, and share a family. Removing `inspired_by`
changes their reachability by essentially nothing.

**Verdict: redundant.**

---

## ANALYSIS 2 — Do same-reference partners already rank high without `inspired_by`?
No trained KGAT embeddings exist on disk (training ran on Colab) and the task
forbids retraining, so this uses a **structural proxy**: a 3-hop symmetric-normalized
diffusion over the exact graph KGAT sees **without** `inspired_by`
(`sem_similar` + accords + family + notes — i.e. the hold-out graph). Real
embeddings can be dropped in via `--kgat_embeddings`.

| metric (4 partner instances) | proxy | random |
|---|---|---|
| mean rank of same-ref partner (of 339) | **6.0** | ~170 |
| mean percentile | **top 1.8 %** | top 50 % |
| recall@5 / @10 / @20 | **0.50 / 0.75 / 1.00** | 0.015 / 0.029 / 0.059 |

Using only non-`inspired_by` structure, same-reference partners already sit among
the **closest ~2 %** of the catalogue. KGAT's own message passing operates over the
same edges, so it implicitly places these pairs together without ever needing
`inspired_by` — consistent with the hold-out null result. (Caveat: only 4 partner
instances and a structural proxy, not trained weights, so this is corroborating, not
decisive on its own.)

**Verdict: redundant** (proxy; n is tiny but every signal points the same way).

---

## ANALYSIS 3 — Where exactly does the signal live?
"`inspired_by`-exclusive" pairs = same-reference pairs **not** directly `sem_similar`
**and** sharing **0** accords (the only place a cross-reference mechanism could add
non-redundant value):

| definition | count | % of same-ref pairs |
|---|---|---|
| loose (no `sem_similar` edge AND 0 shared accords) | **0** | **0 %** |
| strict (also 0 shared family AND 0 notes → only `inspired_by`) | **0** | **0 %** |

There is **no** pair that only `inspired_by` connects. The subset where a
cross-reference mechanism could add non-redundant value is **empty**.

### Supplement — the broader cross-reference *enrichment* channel
Because same-reference pairs are nearly absent, `inspired_by`'s real contribution to
the labels is via its reference's **global accords / families**
(`has_global_accord`, `belongs_to_global_family`). Per enriched product, comparing
the reference's global attributes to the product's **own local** attributes (by
name):

| channel | mean coverage by local | mean #NEW per product | products with ≥1 NEW |
|---|---|---|---|
| global **accords** vs local accords | **49.5 %** (Jaccard 0.48) | 4.56 | 97.4 % |
| global **families** vs local families | 3.9 % | 0.96 | 96.1 % |

So ~half of the global-accord information is *nominally* new (and 93 % of the global-
accord vocabulary, 56/60 names, is reused local-accord vocabulary). **But this
enrichment is delivered through `has_global_accord` / `belongs_to_global_family`
edges that plain KGAT already aggregates on the full KG, and that the hold-out
removes for every model.** So it is (i) already available to KGAT on the full KG and
(ii) unavailable to *any* model under hold-out — either way, not exploitable to beat
KGAT under hold-out.

**Verdict: redundant / no headroom** (0 exclusive pairs; enrichment already
KGAT-accessible on full KG and absent under hold-out).

---

## ANALYSIS 4 — Standard-product reachability via `sem_similar`
Can standard products (no `inspired_by`) reach enriched products laterally?

| metric | value |
|---|---|
| standard products with ≥1 `sem_similar` link to an enriched product | **94/97 = 96.9 %** |
| `sem_similar` links to enriched per standard product | mean **5.49**, median 4, max 25 |
| ≥3 enriched neighbours | 80.4 % | 
| ≥5 enriched neighbours | 40.2 % |

The lateral path is structurally **present** for almost all standard products.
However, this is exactly the `sem_similar` adjacency KGAT's message passing **already
propagates over**, so the path being available does not imply unexploited signal — it
implies KGAT already uses it.

**Verdict: redundant** (path exists, but it is the same `sem_similar` adjacency KGAT
already aggregates; no new lever for a cross-reference mechanism).

---

## OVERALL VERDICT — is there non-redundant `inspired_by` signal a future mechanism could exploit to beat KGAT under hold-out?

# NO.

Justifying numbers:

1. **The target barely exists.** 241 distinct references for 243 enriched products →
   only **2** `same_global_reference` pairs (0.007 % of enriched pairs). There is
   almost no shared-reference structure for any mechanism to recover.
2. **No exclusive structure.** **0** `inspired_by`-exclusive pairs: every
   same-reference pair is already ≤2 hops and shares ≥1 accord + a family without
   `inspired_by` (Analysis 1, 3). The few partners already rank in the **top 1.8 %**
   under non-`inspired_by` structure (Analysis 2).
3. **The enrichment is already KGAT's, or hidden.** The global-accord/family
   enrichment (~50 % nominally new) flows through `has_global_accord` /
   `belongs_to_global_family` edges that **plain KGAT already aggregates on the full
   KG**, and that the **hold-out deletes for every model**. So under hold-out the
   signal is, by construction, unavailable to anyone — there is nothing for a smarter
   mechanism to extract that KGAT cannot.
4. **Lateral path is KGAT's too.** 96.9 % of standard products reach enriched
   products via `sem_similar` (Analysis 4) — but that is the very adjacency KGAT
   message-passes over.

**Conclusion.** The repeated hold-out null result is structural, not a modelling
failure: on the full KG `inspired_by`'s signal is near-fully captured by KGAT's
aggregation over `sem_similar` + attributes (+ the global-attr edges), and under
hold-out the `inspired_by`/global edges are removed so no model can use them. There
is **no non-redundant `inspired_by` headroom** to beat KGAT under hold-out. Further
cross-reference model work on this dataset is not worth pursuing; any real gains must
come from a **richer reference graph** (references shared by many products, or
reference attributes genuinely disjoint from local ones) — which this dataset does
not have.
