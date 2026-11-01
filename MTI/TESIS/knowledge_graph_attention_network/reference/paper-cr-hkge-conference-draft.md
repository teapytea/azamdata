# Cross-Reference Semantic Enrichment on Heterogeneous Knowledge Graph Embedding for Personalized Fragrance Recommendation in Conversational Systems

> Draft status: fill all placeholders marked with `[RESULT_...]`, `[CONFIRM_...]`, or `[TABLE_...]` after the final training and evaluation logs are complete.
>
> Critical wording rule: this paper must not claim that CR-HKGE uses historical user interactions. It uses content-based positive pairs as surrogate supervision because Aromatique has no purchase, rating, or click logs.

## Abstract

Fragrance recommendation is a challenging cold-start problem because local perfume catalogs often lack historical user-item interactions, while user preferences are expressed through subjective olfactory concepts such as accords, fragrance families, visual notes, usage occasions, and global fragrance references. Existing knowledge graph recommendation models, including KGAT, are usually trained with user-item interaction matrices and therefore cannot be directly applied to small-scale catalogs without behavioral logs. This paper proposes CR-HKGE, a Cross-Reference Semantic Enrichment model on top of heterogeneous knowledge graph embedding for personalized fragrance recommendation in conversational systems. CR-HKGE follows a KGAT-compatible alternating training scheme, but replaces historical interactions with content-based positive pairs derived from fragrance metadata. The model introduces three main components: a fragrance-specific heterogeneous knowledge graph, a cross-reference semantic propagation layer through the `inspired_by` relation, and relation-type specific attention weights that prioritize semantically informative relations. Experiments on the Aromatique fragrance catalog compare CR-HKGE with KGAT and other recommendation baselines using Precision@K, Recall@K, Hit@K, NDCG@K, MRR, and coverage. The final results show that CR-HKGE achieves `[RESULT_MAIN_SUMMARY]`, improving `[RESULT_KEY_METRIC_NAME]` from `[RESULT_BASELINE_VALUE]` to `[RESULT_CRHKGE_VALUE]`. These findings indicate that cross-reference semantic enrichment can improve recommendation quality in interaction-sparse fragrance catalogs.

## Keywords

knowledge graph recommendation, fragrance recommendation, conversational recommender system, cold-start recommendation, heterogeneous knowledge graph, KGAT, cross-reference enrichment

## I. Introduction

Perfume recommendation is a domain-specific cold-start recommendation problem. Unlike movies, books, or e-commerce products with large-scale purchase histories, local fragrance catalogs often do not contain enough historical user behavior to support collaborative filtering. A customer may describe a desired perfume through subjective terms such as "sweet", "woody", "fresh", "powdery", "amber", or through a reference perfume that they already know. These signals are semantic, sparse, and often conversational rather than behavioral.

Conversational recommender systems (CRS) address this problem by eliciting user preferences through dialogue instead of relying only on historical logs [1], [2]. However, the conversational layer alone does not solve the ranking problem. A CRS still requires a recommendation engine that can represent products, compare them against user preferences, and produce a ranked list of candidates. If the recommendation engine cannot operate under zero historical interaction conditions, the dialogue system cannot provide reliable recommendations.

Knowledge graphs (KGs) provide a natural representation for this problem because fragrance knowledge is inherently relational. A perfume product can be connected to accords, olfactory families, visual notes, and reference perfumes. A KG can encode these relationships as triples `(h, r, t)`, where `h` is a head entity, `r` is a relation, and `t` is a tail entity [3]. KG-based recommendation models such as CKE [8], KGAT [5], KGCN [6], and RippleNet [7] have shown that structured knowledge can improve recommendation quality. However, these models are commonly evaluated on benchmark datasets such as MovieLens, Amazon-Book, Last.FM, and other datasets that contain user-item interaction records.

The Aromatique Studio Parfum dataset represents a different setting. The catalog contains `[CONFIRM_PRODUCT_COUNT]` perfume products, but no historical purchase, rating, or click logs are available. At the same time, the catalog contains rich semantic product information, including fragrance accords, olfactory families, visual notes, and the `inspired_by` attribute that links a local perfume to a globally recognized fragrance reference. This `inspired_by` relation is especially important because many local perfume names are not semantically informative, while global fragrance references are better known and richer in descriptive information.

This paper proposes CR-HKGE, or Cross-Reference Semantic Enrichment on Heterogeneous Knowledge Graph Embedding, to address this setting. CR-HKGE modifies the KGAT design with three novelty components. First, it constructs a fragrance-specific heterogeneous KG with seven relation types. Second, it introduces a cross-reference semantic propagation layer that transfers information from global reference fragrance nodes to local product nodes through the `inspired_by` relation. Third, it applies relation-type specific attention weights so that the model can differentiate semantically important relations such as `inspired_by` and `has_accord` from auxiliary relations such as `has_visual_note`.

Since Aromatique does not contain real historical user interactions, this work constructs content-based positive pairs from fragrance metadata. These pairs are not purchase or rating logs. They are surrogate preference links derived from product similarity and are used only to support KGAT-compatible offline training and evaluation. This allows KGAT, CR-HKGE, and other baselines to be trained under the same offline protocol while preserving the research problem: recommendation in the absence of historical interaction data.

The contributions of this paper are as follows.

1. A fragrance-specific heterogeneous knowledge graph is constructed from the Aromatique catalog and global reference enrichment, containing `[CONFIRM_ENTITY_COUNT]` entities, `[CONFIRM_TRIPLE_COUNT]` triples, and seven relation types.
2. A cross-reference semantic propagation layer is introduced to enrich local product embeddings through the `inspired_by` relation.
3. Relation-type specific attention weights are introduced to differentiate the contribution of heterogeneous fragrance relations during attention and message propagation.
4. Content-based positive pairs are constructed as surrogate supervision for KGAT-compatible training in a zero historical interaction setting.
5. CR-HKGE is evaluated against KGAT and other baseline models, followed by ablation analysis and enriched-vs-standard product group comparison.

The rest of this paper is organized as follows. Section II reviews related work on knowledge graph recommendation, heterogeneous KG models, sparse recommendation, and conversational recommender systems. Section III presents the proposed CR-HKGE methodology. Section IV describes the experimental setup and evaluation metrics. Section V presents the results and discussion. Section VI concludes the paper and outlines future work.

## II. Related Work

### A. Knowledge Graph-Based Recommendation

Knowledge graph-based recommendation uses structured relational information to improve item representation and ranking. CKE integrates collaborative filtering with knowledge graph embedding and additional side information [8]. KGCN applies convolutional neighborhood aggregation over a knowledge graph to learn user-specific item representations [6]. RippleNet propagates user preferences from historical seed items through multi-hop KG paths [7]. These models demonstrate that KG signals can improve recommendation quality, especially when item-side semantics are useful.

KGAT is the most direct architectural basis for this study [5]. KGAT constructs a collaborative knowledge graph by combining user-item interactions with item-side KG triples. It then applies an attentive propagation mechanism over the unified graph. KGAT uses TransR-based relation modeling to compute attention scores for KG triples and optimizes recommendation using BPR loss. CR-HKGE inherits the KGAT-compatible alternating training structure, but modifies it for a fragrance catalog where historical user-item interactions do not exist. Instead of behavioral interactions, CR-HKGE uses content-based positive pairs as surrogate supervision.

The limitation of KGAT for the Aromatique setting is not the attention mechanism itself, but the assumption that a user-item interaction matrix is available. Without such a matrix, KGAT cannot be trained in its original form. CR-HKGE addresses this limitation by combining content-based positive pair construction with fragrance-specific KG enrichment.

### B. Heterogeneous Knowledge Graph Recommendation

Heterogeneous knowledge graphs contain multiple entity types and relation types. This is important in fragrance recommendation because products are not only connected to other products, but also to accords, families, visual notes, and global references. HKGAT and other heterogeneous KG recommendation models show that typed graph structures can support explainable recommendation [11]. HN-DKG and HGKR further explore dynamic and heterogeneous graph structures for recommendation [12], [14].

However, existing heterogeneous KG recommendation models generally do not treat local fragrance catalogs and global reference perfumes as a cross-reference enrichment problem. In the Aromatique setting, the `inspired_by` relation is not merely another attribute. It acts as a semantic bridge between local products and globally recognized reference perfumes. CR-HKGE operationalizes this bridge through a cross-reference propagation layer.

### C. Sparse and Cold-Start Recommendation

Sparse and cold-start recommendation remains a major problem in recommender systems. Traditional collaborative filtering requires sufficient user-item interaction data. When interactions are sparse or unavailable, collaborative filtering becomes unstable or unusable. KG-based approaches partially address this issue by using item-side semantic relations, but most of them still require user interaction records for training and evaluation.

The Aromatique dataset represents an extreme sparse setting because it does not contain historical purchase, rating, or click logs. Therefore, this study distinguishes between historical user interactions and content-based positive pairs. Historical interactions are behavioral records collected from users. Content-based positive pairs are surrogate links generated from fragrance metadata. This distinction is important because the proposed model is designed for a zero historical interaction business setting, but still requires a consistent offline training protocol to compare with KGAT and other baselines.

### D. Conversational Recommender Systems

Conversational recommender systems interact with users through dialogue to elicit preferences and refine recommendations [1], [2]. In a fragrance domain, a conversational system can ask about preferred accords, usage occasions, olfactory families, or reference perfumes. The recommendation engine must then convert these structured preferences into ranked product candidates.

CR-HKGE is positioned as the recommendation engine layer in such a conversational system. The model learns product representations from a fragrance-specific heterogeneous KG and can later support structured query retrieval. In this paper, the offline evaluation focuses on KGAT-compatible ranking using content-based positive pairs, while the broader system motivation is conversational fragrance recommendation.

## III. Methodology

### A. Problem Formulation

Let `P` be a set of perfume products and `G = (E, R, T)` be a heterogeneous knowledge graph, where `E` is the set of entities, `R` is the set of relation types, and `T` is the set of triples. Each triple is represented as `(h, r, t)`, where `h in E`, `r in R`, and `t in E`.

The research problem is to rank perfume products for recommendation without historical user interactions. The Aromatique dataset does not contain records such as purchases, ratings, or clicks. Therefore, this paper constructs a surrogate training set `Y_c` consisting of content-based positive pairs. These pairs are derived from fragrance metadata and are used as KGAT-compatible positive signals. The resulting training files `train.txt` and `test.txt` should be interpreted as content-based supervision, not as historical user behavior.

Given a pseudo-user or content profile `u` and a candidate product `p`, the model learns a score:

```text
y_hat(u, p) = f(e_u, e_p)
```

where `e_u` is the learned embedding of the content-based profile and `e_p` is the learned embedding of the perfume product. The recommendation task is to rank candidate products according to `y_hat(u, p)`.

### B. Data Sources

Two data sources are used in this study.

1. Aromatique product catalog. This dataset contains `[CONFIRM_PRODUCT_COUNT]` perfume products in tabular format. Each product contains fragrance-related attributes such as accord, olfactory family, visual note, and local product metadata.
2. Global reference enrichment. External fragrance reference data is collected from Fragrantica or other public fragrance information sources. These references are connected to local products through the `inspired_by` relation.

After preprocessing and remapping, the KGAT-ready dataset contains:

```text
Products: [CONFIRM_PRODUCT_COUNT]
Entities: [CONFIRM_ENTITY_COUNT]
Triples: [CONFIRM_TRIPLE_COUNT]
Relation types: 7
Content-based train pairs: [CONFIRM_N_TRAIN]
Content-based test pairs: [CONFIRM_N_TEST]
```

The current training logs should be used to fill these numbers. Do not mix raw catalog counts with remapped KGAT-ready counts.

### C. Fragrance-Specific Heterogeneous Knowledge Graph Construction

The fragrance KG is constructed using seven relation types:

```text
inspired_by
has_accord
has_visual_note
belongs_to_family
sem_similar
has_global_accord
belongs_to_global_family
```

The relation `inspired_by` links a local perfume product to a global reference fragrance. The relation `has_accord` links a product to its fragrance accord entities. The relation `belongs_to_family` links a product to an olfactory family. The relation `has_visual_note` captures visual or presentation-related fragrance cues. The relation `sem_similar` connects semantically similar products. The relations `has_global_accord` and `belongs_to_global_family` describe global reference fragrance nodes.

This graph construction is the first novelty of CR-HKGE. Unlike generic recommendation datasets, fragrance recommendation requires domain-specific relations that reflect olfactory structure and cross-reference semantics.

### D. Content-Based Positive Pair Construction

Because Aromatique has no historical user interactions, content-based positive pairs are constructed to support offline training. These pairs replace behavioral user-item records with metadata-derived positive associations.

The construction follows the principle that products sharing strong fragrance attributes can form positive supervision groups. For example, products may be grouped based on shared accord profiles, olfactory family, semantic similarity, or other fragrance metadata. The resulting `train.txt` and `test.txt` files follow the KGAT format, but they do not represent real user purchases or ratings.

This distinction must be preserved throughout the paper. The correct terminology is:

```text
content-based positive pairs
surrogate preference links
KGAT-compatible offline supervision
```

The incorrect terminology is:

```text
historical user interactions
real user behavior
purchase history
ratings
click logs
```

### E. CR-HKGE Model Architecture

CR-HKGE consists of four layers.

#### 1. Layer 1: TransR Knowledge Graph Embedding

The first layer follows the TransR-based KG embedding component used by KGAT. Each entity is represented in an entity embedding space, while each relation projects entities into a relation-specific space. For a triple `(h, r, t)`, the TransR score is:

```text
g(h, r, t) = || W_r e_h + e_r - W_r e_t ||^2
```

where `e_h` and `e_t` are entity embeddings, `e_r` is the relation embedding, and `W_r` is the relation-specific projection matrix.

This layer preserves KGAT's knowledge embedding foundation and provides relation-aware representations for fragrance entities.

#### 2. Layer 2: Relation-Type Specific Attention

KGAT computes attention scores at the triple level, but it does not explicitly prioritize relation types based on fragrance-domain importance. CR-HKGE introduces a learnable relation-type weight `lambda_r` for each semantic relation type.

The original KGAT attention score can be written as:

```text
pi(h, r, t) = (W_r e_t)^T tanh(W_r e_h + e_r)
```

CR-HKGE modifies it as:

```text
pi_CR(h, r, t) = lambda_tilde_r * (W_r e_t)^T tanh(W_r e_h + e_r)
```

where `lambda_tilde_r` is the normalized relation-type attention weight. In the final implementation, fragrance-domain priors can initialize the relation weights so that semantically important relations, such as `sem_similar`, `has_accord`, `belongs_to_family`, and `inspired_by`, start with more meaningful scales. These weights remain trainable during model optimization.

This is the second novelty of CR-HKGE.

#### 3. Layer 3: Cross-Reference Semantic Propagation

The cross-reference propagation layer uses the `inspired_by` relation to transfer semantic information from global reference fragrance nodes to local product nodes. For a local product `p` connected to a global reference `g`, CR-HKGE constructs a cross-reference context:

```text
e_CR(p) = lambda_tilde_inspired_by * W_CR * (e_g + sum pi_CR(g, r_prime, t_prime) e_t_prime)
```

where the global reference node `g` can be enriched by its global accord and global family attributes. The product representation is then updated by combining the original neighborhood aggregation and the cross-reference context:

```text
e_p^(l) = sigma(W * (e_p^(l-1) + e_N(p) + e_CR(p)))
```

For products without an `inspired_by` relation, the cross-reference context is zero, and the propagation follows the standard KGAT neighborhood aggregation path.

This is the third novelty of CR-HKGE.

#### 4. Layer 4: Bi-Interaction and Prediction

CR-HKGE preserves the KGAT bi-interaction aggregation structure. At each propagation layer, the model combines additive neighborhood aggregation and element-wise bi-interaction between ego embeddings and side embeddings. The final representation is the concatenation of embeddings from all propagation layers:

```text
e_p* = e_p^(0) || e_p^(1) || ... || e_p^(L)
```

The predicted score between a content-based profile `u` and a product `p` is:

```text
y_hat(u, p) = e_u^T e_p*
```

The Top-K recommendation list is obtained by ranking candidate products according to `y_hat(u, p)`.

### F. Training Objective

CR-HKGE follows KGAT's alternating training procedure.

#### Phase I: BPR Training over Content-Based Positive Pairs

The first phase optimizes Bayesian Personalized Ranking (BPR) loss using content-based positive pairs. For each content profile `u`, a positive item `i`, and a negative item `j`, the loss is:

```text
L_BPR = - sum log sigma(y_hat(u, i) - y_hat(u, j))
```

This phase trains the recommendation ranking component. The positive pairs are metadata-derived surrogate signals, not historical user behavior.

#### Phase II: TransR Knowledge Graph Training and Attention Update

The second phase optimizes KG embedding through TransR loss and updates the attentive adjacency matrix `A_in`. This allows the model to learn relation-aware entity representations and update attention scores over the heterogeneous KG.

The total training process alternates between Phase I and Phase II until convergence or until the maximum number of epochs is reached.

## IV. Experimental Setup

### A. Dataset

The experiment uses the KGAT-ready Aromatique fragrance dataset. The final dataset statistics must be taken from the final training logs.

```text
Number of products: [CONFIRM_PRODUCT_COUNT]
Number of entities: [CONFIRM_ENTITY_COUNT]
Number of relation types: 7
Number of KG triples: [CONFIRM_TRIPLE_COUNT]
Number of train pairs: [CONFIRM_N_TRAIN]
Number of test pairs: [CONFIRM_N_TEST]
Number of enriched products: [CONFIRM_ENRICHED_COUNT]
Number of standard products: [CONFIRM_STANDARD_COUNT]
```

Products with an `inspired_by` relation are categorized as enriched products. Products without an `inspired_by` relation are categorized as standard products.

### B. Baseline Models

CR-HKGE is compared against the following baselines.

1. BPRMF: a matrix factorization baseline trained with BPR loss.
2. CKE: a collaborative knowledge embedding model that incorporates KG embeddings.
3. NFM: a neural factorization machine baseline using KG-derived item features.
4. CFKG: a collaborative filtering and KG embedding baseline.
5. KGAT: the direct base model of CR-HKGE.

All models are trained using the same content-based positive pair split and evaluated using the same Top-K protocol.

### C. Hyperparameters

The main hyperparameter setting is:

```text
Embedding size: 64
KGE size: 64
Layer size: [64, 32, 16]
Learning rate: 0.0001
Batch size: 64
Node dropout: [0.1]
Message dropout: [0.1, 0.1, 0.1]
Epochs: [CONFIRM_EPOCHS]
K values: [3, 5, 10]
Adjacency type: si
Aggregation type: bi-interaction
```

### D. Evaluation Metrics

The evaluation uses Top-K ranking metrics.

Precision@K measures the proportion of recommended items in the Top-K list that are relevant.

Recall@K measures the proportion of relevant items recovered in the Top-K list.

Hit@K measures whether at least one relevant item appears in the Top-K list.

NDCG@K measures ranking quality by assigning higher gain when relevant items appear at higher ranks.

MRR measures the reciprocal rank of the first relevant item:

```text
MRR = (1 / |U|) sum_u 1 / rank_u
```

Coverage measures the proportion of catalog items that appear in recommendation lists:

```text
Coverage@K = | union recommended items in Top-K | / |P|
```

If MRR and coverage are not computed in the final logs, remove them from the results table or mark them as future evaluation.

## V. Results and Discussion

### A. Main Performance Comparison

Table I compares CR-HKGE with baseline models on the overall test set.

**Table I. Overall Top-K Recommendation Performance**

| Model | Precision@3 | Recall@3 | Hit@3 | NDCG@3 | MRR | Coverage@3 |
|---|---:|---:|---:|---:|---:|---:|
| BPRMF | [RESULT_BPRMF_PRECISION_3] | [RESULT_BPRMF_RECALL_3] | [RESULT_BPRMF_HIT_3] | [RESULT_BPRMF_NDCG_3] | [RESULT_BPRMF_MRR] | [RESULT_BPRMF_COVERAGE_3] |
| CKE | [RESULT_CKE_PRECISION_3] | [RESULT_CKE_RECALL_3] | [RESULT_CKE_HIT_3] | [RESULT_CKE_NDCG_3] | [RESULT_CKE_MRR] | [RESULT_CKE_COVERAGE_3] |
| NFM | [RESULT_NFM_PRECISION_3] | [RESULT_NFM_RECALL_3] | [RESULT_NFM_HIT_3] | [RESULT_NFM_NDCG_3] | [RESULT_NFM_MRR] | [RESULT_NFM_COVERAGE_3] |
| CFKG | [RESULT_CFKG_PRECISION_3] | [RESULT_CFKG_RECALL_3] | [RESULT_CFKG_HIT_3] | [RESULT_CFKG_NDCG_3] | [RESULT_CFKG_MRR] | [RESULT_CFKG_COVERAGE_3] |
| KGAT | [RESULT_KGAT_PRECISION_3] | [RESULT_KGAT_RECALL_3] | [RESULT_KGAT_HIT_3] | [RESULT_KGAT_NDCG_3] | [RESULT_KGAT_MRR] | [RESULT_KGAT_COVERAGE_3] |
| CR-HKGE | [RESULT_CRHKGE_PRECISION_3] | [RESULT_CRHKGE_RECALL_3] | [RESULT_CRHKGE_HIT_3] | [RESULT_CRHKGE_NDCG_3] | [RESULT_CRHKGE_MRR] | [RESULT_CRHKGE_COVERAGE_3] |

The results show that CR-HKGE achieves `[RESULT_MAIN_INTERPRETATION]`. Compared with KGAT, CR-HKGE improves Recall@3 by `[RESULT_DELTA_RECALL_3]` and NDCG@3 by `[RESULT_DELTA_NDCG_3]`. This indicates that adding fragrance-specific relation modeling and cross-reference propagation improves the ranking quality of the base KGAT architecture.

The improvement can be attributed to three mechanisms. First, the fragrance-specific KG provides richer product semantics than item identifiers alone. Second, relation-type attention allows the model to differentiate relations by recommendation importance. Third, cross-reference propagation transfers semantic information from global reference fragrances to local products through `inspired_by` links.

### B. Performance at Different K Values

Table II reports the performance at K = 3, 5, and 10.

**Table II. Overall Performance at K = 3, 5, and 10**

| Model | Recall@3 | NDCG@3 | Recall@5 | NDCG@5 | Recall@10 | NDCG@10 |
|---|---:|---:|---:|---:|---:|---:|
| BPRMF | [RESULT_BPRMF_RECALL_3] | [RESULT_BPRMF_NDCG_3] | [RESULT_BPRMF_RECALL_5] | [RESULT_BPRMF_NDCG_5] | [RESULT_BPRMF_RECALL_10] | [RESULT_BPRMF_NDCG_10] |
| CKE | [RESULT_CKE_RECALL_3] | [RESULT_CKE_NDCG_3] | [RESULT_CKE_RECALL_5] | [RESULT_CKE_NDCG_5] | [RESULT_CKE_RECALL_10] | [RESULT_CKE_NDCG_10] |
| NFM | [RESULT_NFM_RECALL_3] | [RESULT_NFM_NDCG_3] | [RESULT_NFM_RECALL_5] | [RESULT_NFM_NDCG_5] | [RESULT_NFM_RECALL_10] | [RESULT_NFM_NDCG_10] |
| CFKG | [RESULT_CFKG_RECALL_3] | [RESULT_CFKG_NDCG_3] | [RESULT_CFKG_RECALL_5] | [RESULT_CFKG_NDCG_5] | [RESULT_CFKG_RECALL_10] | [RESULT_CFKG_NDCG_10] |
| KGAT | [RESULT_KGAT_RECALL_3] | [RESULT_KGAT_NDCG_3] | [RESULT_KGAT_RECALL_5] | [RESULT_KGAT_NDCG_5] | [RESULT_KGAT_RECALL_10] | [RESULT_KGAT_NDCG_10] |
| CR-HKGE | [RESULT_CRHKGE_RECALL_3] | [RESULT_CRHKGE_NDCG_3] | [RESULT_CRHKGE_RECALL_5] | [RESULT_CRHKGE_NDCG_5] | [RESULT_CRHKGE_RECALL_10] | [RESULT_CRHKGE_NDCG_10] |

If CR-HKGE improves most strongly at K = 3, the interpretation should emphasize top-ranked recommendation quality. If the improvement is stronger at K = 10, the interpretation should emphasize candidate recall and catalog exploration.

### C. Ablation Study

The ablation study isolates the contribution of each CR-HKGE component. The full model is compared against variants that remove one or more novelty modules.

**Table III. Ablation Study**

| Variant | Cross-Reference | Relation Attention | Relation-Aware Message | Fragrance Prior | Recall@3 | NDCG@3 |
|---|---:|---:|---:|---:|---:|---:|
| Full CR-HKGE | Yes | Yes | Yes | Yes | [RESULT_FULL_RECALL_3] | [RESULT_FULL_NDCG_3] |
| w/o Cross-Reference | No | Yes | Yes | Yes | [RESULT_NO_CROSS_REF_RECALL_3] | [RESULT_NO_CROSS_REF_NDCG_3] |
| w/o Relation Attention | Yes | No | No | No | [RESULT_NO_REL_ATT_RECALL_3] | [RESULT_NO_REL_ATT_NDCG_3] |
| w/o Relation-Aware Message | Yes | Yes | No | Yes | [RESULT_NO_REL_MSG_RECALL_3] | [RESULT_NO_REL_MSG_NDCG_3] |
| w/o Fragrance Prior | Yes | Yes | Yes | No | [RESULT_NO_PRIOR_RECALL_3] | [RESULT_NO_PRIOR_NDCG_3] |
| w/o Novelty Modules | No | No | No | No | [RESULT_NO_NOVELTY_RECALL_3] | [RESULT_NO_NOVELTY_NDCG_3] |
| [OPTIONAL_VARIANT_7_NAME] | [OPTIONAL] | [OPTIONAL] | [OPTIONAL] | [OPTIONAL] | [RESULT_OPTIONAL_7_RECALL_3] | [RESULT_OPTIONAL_7_NDCG_3] |

The ablation results show that `[RESULT_ABLATION_INTERPRETATION]`. If removing cross-reference reduces performance, this supports the importance of `inspired_by` propagation. If removing relation attention reduces performance, this supports the importance of relation-type weighting. If the no-novelty variant approaches KGAT performance, this confirms that the improvement comes from the proposed CR-HKGE components rather than from implementation side effects.

If one ablation unexpectedly performs better than the full model, the discussion should not hide it. The correct interpretation is that the removed component may introduce noise or over-amplification under the current dataset split, and the final model variant should be selected based on validation performance.

### D. Enriched vs Standard Product Analysis

To evaluate the effect of cross-reference enrichment, products are divided into two groups:

```text
Enriched products: products with an inspired_by relation
Standard products: products without an inspired_by relation
```

**Table IV. Enriched vs Standard Product Performance**

| Model | Group | Recall@3 | Precision@3 | Hit@3 | NDCG@3 |
|---|---|---:|---:|---:|---:|
| KGAT | Enriched | [RESULT_KGAT_ENRICHED_RECALL_3] | [RESULT_KGAT_ENRICHED_PRECISION_3] | [RESULT_KGAT_ENRICHED_HIT_3] | [RESULT_KGAT_ENRICHED_NDCG_3] |
| CR-HKGE | Enriched | [RESULT_CRHKGE_ENRICHED_RECALL_3] | [RESULT_CRHKGE_ENRICHED_PRECISION_3] | [RESULT_CRHKGE_ENRICHED_HIT_3] | [RESULT_CRHKGE_ENRICHED_NDCG_3] |
| KGAT | Standard | [RESULT_KGAT_STANDARD_RECALL_3] | [RESULT_KGAT_STANDARD_PRECISION_3] | [RESULT_KGAT_STANDARD_HIT_3] | [RESULT_KGAT_STANDARD_NDCG_3] |
| CR-HKGE | Standard | [RESULT_CRHKGE_STANDARD_RECALL_3] | [RESULT_CRHKGE_STANDARD_PRECISION_3] | [RESULT_CRHKGE_STANDARD_HIT_3] | [RESULT_CRHKGE_STANDARD_NDCG_3] |

The enriched-vs-standard analysis evaluates whether cross-reference enrichment helps products with `inspired_by` links and whether it preserves recommendation quality for products without such links. A strong improvement in enriched products supports the cross-reference novelty directly. A strong improvement in standard products suggests that relation-type attention and fragrance-specific KG construction improve the overall embedding space, not only the cross-reference subset.

### E. Coverage Analysis

Coverage evaluates whether the model recommends a diverse portion of the catalog. This is important in fragrance recommendation because repeatedly recommending only popular or densely connected products can reduce catalog exploration.

**Table V. Coverage@K**

| Model | Coverage@3 | Coverage@5 | Coverage@10 |
|---|---:|---:|---:|
| BPRMF | [RESULT_BPRMF_COVERAGE_3] | [RESULT_BPRMF_COVERAGE_5] | [RESULT_BPRMF_COVERAGE_10] |
| CKE | [RESULT_CKE_COVERAGE_3] | [RESULT_CKE_COVERAGE_5] | [RESULT_CKE_COVERAGE_10] |
| NFM | [RESULT_NFM_COVERAGE_3] | [RESULT_NFM_COVERAGE_5] | [RESULT_NFM_COVERAGE_10] |
| CFKG | [RESULT_CFKG_COVERAGE_3] | [RESULT_CFKG_COVERAGE_5] | [RESULT_CFKG_COVERAGE_10] |
| KGAT | [RESULT_KGAT_COVERAGE_3] | [RESULT_KGAT_COVERAGE_5] | [RESULT_KGAT_COVERAGE_10] |
| CR-HKGE | [RESULT_CRHKGE_COVERAGE_3] | [RESULT_CRHKGE_COVERAGE_5] | [RESULT_CRHKGE_COVERAGE_10] |

If coverage is not computed in the final experiment, remove this subsection or move it to future work.

### F. Discussion

The experimental results should be interpreted in the context of the Aromatique dataset. The dataset does not provide historical user-item interactions, so the model is evaluated using content-based positive pairs. This makes the evaluation suitable for comparing recommendation architectures under the same surrogate supervision, but it does not replace a real user study.

If CR-HKGE outperforms KGAT, the improvement supports the central hypothesis that fragrance-specific heterogeneous KG construction, cross-reference propagation, and relation-type attention can improve recommendation quality beyond the base KGAT architecture. The `inspired_by` relation provides a semantic bridge from local products to global fragrance references. Relation-type attention allows the model to assign different importance to different relation types. Together, these mechanisms enrich product representations under interaction-sparse conditions.

If CR-HKGE only improves some metrics, the discussion should be precise. For example, improvement in Recall@3 means the model retrieves more relevant products in the top three. Improvement in NDCG@3 means the relevant products are ranked better near the top. If Recall improves but NDCG decreases, the model retrieves more relevant products but the ranking order still needs improvement.

If enriched products improve less than standard products, the likely explanation is that the content-based positive pair construction may reward local attributes such as accord and family more strongly than cross-reference paths. This does not invalidate the cross-reference novelty, but it suggests that the evaluation proxy may not fully capture reference-based recommendation behavior.

### G. Limitations

This study has several limitations.

First, the dataset is small and comes from a single local fragrance catalog. The results may not generalize directly to larger fragrance retailers without additional validation.

Second, the dataset does not contain historical purchase, rating, or click logs. Content-based positive pairs are necessary for offline training and evaluation, but they are not a substitute for real user feedback.

Third, the quality of global reference enrichment depends on the completeness and consistency of external fragrance reference information.

Fourth, the evaluation focuses on offline Top-K metrics. A deployed conversational recommender system should also be evaluated through user studies, satisfaction metrics, explanation quality, and purchase intention.

## VI. Conclusion

This paper proposed CR-HKGE, a Cross-Reference Semantic Enrichment model for personalized fragrance recommendation in a zero historical interaction setting. CR-HKGE extends KGAT with three components: a fragrance-specific heterogeneous knowledge graph, a cross-reference semantic propagation layer through the `inspired_by` relation, and relation-type specific attention weights. Since the Aromatique catalog does not contain purchase, rating, or click logs, content-based positive pairs are constructed as surrogate supervision for KGAT-compatible offline training and evaluation.

Experimental results show that CR-HKGE achieves `[RESULT_CONCLUSION_MAIN]` compared with KGAT and other baselines. The ablation study shows that `[RESULT_CONCLUSION_ABLATION]`, indicating that `[RESULT_CONCLUSION_NOVELTY_IMPACT]`. The enriched-vs-standard analysis further shows that `[RESULT_CONCLUSION_GROUP_ANALYSIS]`.

These results suggest that cross-reference semantic enrichment is a promising strategy for fragrance recommendation in small-scale catalogs without historical interactions. Future work will extend the dataset, incorporate real conversational feedback, evaluate the model in live user studies, and integrate explanation generation based on CR-HKGE knowledge paths.

