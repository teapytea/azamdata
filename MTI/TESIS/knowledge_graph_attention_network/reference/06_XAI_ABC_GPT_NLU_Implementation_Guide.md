# XAI A/B/C and GPT NLU Implementation Guide

Tanggal konteks: 2026-05-13  
Workspace utama: `D:\Azam\MTI\TESIS\knowledge_graph_attention_network`  
Repo frontend/backend app: `_external/aromatique-ai`

Dokumen ini adalah handoff teknis untuk menyempurnakan pilot study Raissa. Fokusnya adalah mengimplementasikan condition A/B/C berbasis system prompt markdown dan menjelaskan opsi upgrade preference extraction dari deterministic keyword ke GPT NLU.

---

## 1. Tujuan Implementasi Berikutnya

Target utama:

1. Satu session user mendapat satu condition: `A`, `B`, atau `C`.
2. Condition tersebut konsisten dari greeting, chat, sampai explanation Top-3.
3. Explanation Top-3 dibuat oleh `gpt-4o-mini` memakai system prompt markdown:
   - `A`: feature-based explanation.
   - `B`: narrative-based explanation.
   - `C`: comparative-based explanation.
4. Retrieval tetap memakai pilot engine sekarang:
   - `recommendation_engine = "kgat_baseline"`
   - `model_version = "kgat_baseline_epoch69_v1"`
5. CR-HKGE tidak diimplementasikan dulu.
6. Condition/prompt/model yang dipakai harus bisa dimonitor dari Supabase.

---

## 2. Kondisi Sistem Saat Ini

Yang sudah berjalan:

- Frontend React sudah bisa dites.
- Supabase remote sudah aktif di project:

```text
https://esqzngqpfwrlcnapmfpx.supabase.co
```

- Edge Function aktif:

```text
aromatique-chat
```

- Mode chat sudah memakai OpenAI Chat Completions dengan default:

```text
gpt-4o-mini
```

- Mode recommend sudah:
  - Query tabel `products`.
  - Query tabel `kg_edges`.
  - Ranking Top-3.
  - Build `kg_path`.
  - Return `recommendations[]`.
  - Return `explanation_type`, `recommendation_engine`, dan `model_version`.

- Supabase seed sudah ada:

```text
products = 340
kg_edges = 9250
product_embeddings = 340
```

Keterbatasan saat ini:

- Explanation A/B/C masih dibuat dari template TypeScript, belum memakai file prompt markdown.
- Chat system prompt belum berbeda untuk A/B/C.
- Condition assignment belum rotasi seimbang A -> B -> C berbasis session count.
- Preference extraction masih deterministic keyword, belum GPT NLU.
- `product_embeddings.embedding` masih `null`, karena CR-HKGE/KGAT checkpoint embedding belum tersedia lokal.

---

## 3. File Prompt yang Harus Dipakai

Tempatkan tiga file prompt di repo `aromatique-ai`:

```text
_external/aromatique-ai/supabase/functions/aromatique-chat/prompts/
├── system_prompt_feature_based_explanation.md
├── system_prompt_narrative_based_explanation.md
└── system_prompt_comparative_based_explanation.md
```

Mapping condition:

| Condition | Prompt File | Tujuan |
|---|---|---|
| A | `system_prompt_feature_based_explanation.md` | Feature-based explanation |
| B | `system_prompt_narrative_based_explanation.md` | Narrative-based explanation |
| C | `system_prompt_comparative_based_explanation.md` | Comparative-based explanation |

Catatan:

- Jika file prompt saat ini masih di `Downloads`, copy ke folder prompt di atas.
- Jangan menyimpan prompt hanya di root repo KGAT jika Edge Function perlu membundlenya saat deploy.
- Karena Supabase Edge Function deploy via MCP menerima daftar file eksplisit, prompt markdown harus ikut dikirim saat deploy.

---

## 4. Arsitektur Target Pilot Study

```text
Frontend
  Welcome -> Consent -> Chat -> Recommendation -> Feedback
       |
       v
Supabase Edge Function: aromatique-chat
       |
       |-- assign/load condition A/B/C
       |
       |-- mode="chat"
       |     gpt-4o-mini
       |     base chat prompt + condition prompt
       |
       |-- mode="recommend"
             deterministic/GPT preference extraction
             KGAT baseline retrieval from products + kg_edges
             Top-3 + kg_path
             gpt-4o-mini explanation using prompt A/B/C
             JSON response to frontend
```

Untuk pilot:

```text
retrieval = kgat_baseline metadata/KG fallback
explanation = GPT-4o-mini with A/B/C prompt
```

Untuk final Azam nanti:

```text
retrieval = CR-HKGE vector retrieval
explanation = GPT-4o-mini with A/B/C prompt
```

---

## 5. Condition Assignment yang Disarankan

### Prinsip

Condition harus ditetapkan server-side di Edge Function, bukan bergantung pada frontend.

Alur:

1. Jika `conversation_id` sudah punya condition, gunakan condition itu.
2. Jika `session_id` sudah pernah punya row di `experiment_sessions`, gunakan condition itu.
3. Jika session baru, assign condition baru.
4. Simpan ke:
   - `conversations.condition`
   - `experiment_sessions.condition`
   - `experiment_sessions.explanation_type`

### Untuk pilot cepat

Boleh random:

```ts
const condition = ["A", "B", "C"][Math.floor(Math.random() * 3)];
```

### Untuk eksperimen utama

Lebih baik rotasi seimbang:

```text
count existing experiment_sessions
condition = ["A", "B", "C"][count % 3]
```

Dengan cara ini distribusi 90 partisipan lebih mendekati:

```text
A = 30
B = 30
C = 30
```

---

## 6. Database Metadata untuk Monitoring

Tambahkan migration baru di `aromatique-ai`:

```sql
ALTER TABLE public.experiment_sessions
  ADD COLUMN IF NOT EXISTS prompt_name TEXT,
  ADD COLUMN IF NOT EXISTS prompt_version TEXT,
  ADD COLUMN IF NOT EXISTS llm_model TEXT;

ALTER TABLE public.recommendations
  ADD COLUMN IF NOT EXISTS prompt_name TEXT,
  ADD COLUMN IF NOT EXISTS prompt_version TEXT,
  ADD COLUMN IF NOT EXISTS llm_model TEXT,
  ADD COLUMN IF NOT EXISTS explanation_payload JSONB;
```

Nilai yang disarankan:

```json
{
  "condition": "A",
  "prompt_name": "system_prompt_feature_based_explanation.md",
  "prompt_version": "v1",
  "llm_model": "gpt-4o-mini",
  "recommendation_engine": "kgat_baseline",
  "model_version": "kgat_baseline_epoch69_v1"
}
```

---

## 7. Cara Monitoring di Supabase

### Melihat session terbaru dan condition

```sql
SELECT
  session_id,
  conversation_id,
  condition,
  explanation_type,
  prompt_name,
  prompt_version,
  llm_model,
  recommendation_engine,
  model_version,
  assigned_at
FROM public.experiment_sessions
ORDER BY assigned_at DESC;
```

### Melihat recommendation dan prompt yang dipakai

```sql
SELECT
  r.created_at,
  c.session_id,
  c.condition AS conversation_condition,
  r.explanation_type,
  r.prompt_name,
  r.prompt_version,
  r.llm_model,
  r.recommendation_engine,
  r.model_version,
  r.summary,
  r.kg_paths,
  r.explanation_payload
FROM public.recommendations r
JOIN public.conversations c ON c.id = r.conversation_id
ORDER BY r.created_at DESC;
```

### Mengecek distribusi A/B/C

```sql
SELECT
  condition,
  count(*) AS n
FROM public.experiment_sessions
GROUP BY condition
ORDER BY condition;
```

### Mengecek feedback per condition

```sql
SELECT
  c.condition,
  f.explanation_type,
  f.model_version,
  count(*) AS n_feedback
FROM public.feedback f
JOIN public.conversations c ON c.id = f.conversation_id
GROUP BY c.condition, f.explanation_type, f.model_version
ORDER BY c.condition;
```

---

## 8. Deterministic Keyword vs GPT NLU

### Deterministic Keyword

Deterministic keyword berarti sistem membaca teks user memakai daftar kata kunci yang sudah ditulis manual di kode.

Contoh:

```text
User: "Aku suka parfum segar floral untuk kerja."
```

Kode mendeteksi:

```text
"segar" -> fresh, citrus, aquatic, green
"floral" -> floral, white floral, rose, jasmine
"kerja" -> fresh, citrus, aromatic, musky
```

Lalu produk diberi skor berdasarkan kecocokan term tersebut dengan metadata produk:

```text
main_accords
visual_note
olfactory_family
kg_edges
```

Kelebihan deterministic keyword:

- Cepat.
- Murah.
- Stabil.
- Output mudah di-debug.
- Input sama hampir pasti menghasilkan output sama.
- Cocok untuk pilot awal karena mengurangi variabilitas.

Kekurangan deterministic keyword:

- Tidak paham sinonim yang tidak ada di daftar.
- Tidak paham konteks kompleks.
- Sulit menangkap preferensi negatif.
- Sulit menangkap intensitas, misalnya "sedikit manis tapi jangan terlalu gourmand".
- Sulit menangkap trade-off, misalnya "segar untuk kantor tapi tetap elegan untuk meeting".

### GPT NLU

GPT NLU berarti preference extraction dilakukan oleh GPT, bukan daftar keyword manual.

Contoh input:

```text
Aku cari parfum buat kerja, jangan terlalu manis, tapi tetap feminin dan clean.
```

GPT bisa mengubahnya menjadi struktur:

```json
{
  "occasion": ["kerja", "daily"],
  "liked_accords": ["clean", "fresh", "floral", "musky"],
  "disliked_accords": ["overly sweet", "gourmand"],
  "style": ["feminine", "professional", "soft"],
  "intensity": "moderate",
  "time_of_use": ["day"],
  "summary": "User mencari parfum kerja yang clean, feminin, tidak terlalu manis, dan nyaman dipakai siang hari."
}
```

Kelebihan GPT NLU:

- Lebih fleksibel.
- Bisa memahami sinonim dan konteks.
- Bisa mengambil preferensi negatif.
- Bisa membuat structured profile yang lebih kaya.
- Lebih cocok untuk percakapan natural.

Kekurangan GPT NLU:

- Ada biaya LLM tambahan.
- Output perlu divalidasi dengan schema.
- Bisa bervariasi jika prompt/schema tidak ketat.
- Jika tidak dijaga, GPT bisa mengarang kategori yang tidak ada di dataset.

---

## 9. Cara Implementasi GPT NLU

### Target

Tambahkan satu fungsi di Edge Function:

```ts
extractPreferencesWithGPT(messages)
```

Fungsi ini dipakai sebelum ranking produk.

Alur target:

```text
messages user
  -> GPT NLU structured JSON
  -> normalize terms ke vocabulary Aromatique
  -> rank products
  -> Top-3 + kg_path
  -> GPT explanation A/B/C
```

### Schema Output NLU

Gunakan JSON schema sederhana:

```json
{
  "liked_terms": ["fresh", "floral"],
  "disliked_terms": ["too sweet"],
  "occasion": ["work"],
  "style": ["soft", "clean"],
  "intensity": "light | moderate | strong | unknown",
  "time_of_use": ["day"],
  "summary": "string"
}
```

### Prompt NLU yang Disarankan

```text
You extract fragrance preferences from Indonesian user messages.
Return only valid JSON.
Use only concise fragrance terms.
Do not invent product recommendations.
Capture liked terms, disliked terms, occasion, style, intensity, time_of_use, and summary.
```

### Validasi Output

Setelah GPT mengembalikan JSON:

1. Parse JSON.
2. Jika parse gagal, fallback ke deterministic keyword.
3. Normalize semua term:
   - lowercase
   - trim
   - hilangkan duplikasi
4. Batasi term ke vocabulary produk/KG jika memungkinkan.
5. Gabungkan dengan deterministic keyword sebagai fallback.

### Strategi Aman untuk Pilot

Gunakan hybrid:

```text
GPT NLU result + deterministic keyword fallback
```

Jika GPT berhasil:

```text
ranking terms = GPT liked_terms + deterministic detected terms
negative terms = GPT disliked_terms
```

Jika GPT gagal:

```text
ranking terms = deterministic keyword only
```

Dengan ini pilot tetap stabil walaupun API error.

---

## 10. Cara Implementasi GPT Explanation A/B/C

### Input ke GPT Explanation

Untuk `mode="recommend"`, setelah Top-3 didapat:

```json
{
  "condition": "A",
  "user_preference_summary": "User mencari aroma segar floral untuk kerja.",
  "recommendations": [
    {
      "rank": 1,
      "product_name": "White Sense",
      "olfactory_family": "FLORAL",
      "main_accords": "floral, violet, fresh",
      "visual_note": "White Floral / Fresh",
      "revolutionize": null,
      "match_score": 92,
      "kg_path": [
        {
          "relation": "has_accord",
          "entity": "floral",
          "matched": true,
          "reason": "Node floral cocok langsung dengan preferensi pengguna."
        }
      ]
    }
  ]
}
```

### Output yang Diminta dari GPT

Minta GPT mengembalikan JSON:

```json
{
  "summary": "string",
  "recommendations": [
    {
      "rank": 1,
      "product_id": "68",
      "reason": "string"
    }
  ]
}
```

Lalu merge `reason` ke object recommendation hasil retrieval.

### Kenapa Harus JSON?

Agar frontend tetap stabil dan tidak perlu parsing teks bebas.

---

## 11. Checklist Implementasi untuk New Chat

### Preparation

- [ ] Baca `04_Joint_Research_Azam_Raissa.md`.
- [ ] Baca `05_Implementation_Handoff.md`.
- [ ] Baca Edge Function sekarang:

```text
_external/aromatique-ai/supabase/functions/aromatique-chat/index.ts
```

- [ ] Baca frontend:

```text
_external/aromatique-ai/src/components/AromatiqueApp.tsx
```

- [ ] Baca tiga prompt markdown A/B/C.

### Prompt Files

- [ ] Buat folder:

```text
_external/aromatique-ai/supabase/functions/aromatique-chat/prompts/
```

- [ ] Copy prompt A ke:

```text
system_prompt_feature_based_explanation.md
```

- [ ] Copy prompt B ke:

```text
system_prompt_narrative_based_explanation.md
```

- [ ] Copy prompt C ke:

```text
system_prompt_comparative_based_explanation.md
```

### Database

- [ ] Tambah migration metadata prompt:
  - `experiment_sessions.prompt_name`
  - `experiment_sessions.prompt_version`
  - `experiment_sessions.llm_model`
  - `recommendations.prompt_name`
  - `recommendations.prompt_version`
  - `recommendations.llm_model`
  - `recommendations.explanation_payload`

- [ ] Apply migration ke Supabase remote.

### Edge Function

- [ ] Tambahkan mapping condition ke prompt file.
- [ ] Tambahkan helper `getPromptMetadata(condition)`.
- [ ] Tambahkan helper `resolveSessionCondition(...)`.
- [ ] Pastikan condition server-side konsisten.
- [ ] Patch `mode="chat"` agar system prompt mengikuti condition.
- [ ] Patch `mode="recommend"` agar explanation dibuat GPT berdasarkan prompt A/B/C.
- [ ] Simpan `prompt_name`, `prompt_version`, `llm_model`, dan `explanation_payload`.
- [ ] Pertahankan fallback deterministic reason jika GPT error.

### Frontend

- [ ] Kirim `conversation_id` dan `session_id` saat chat dan recommend.
- [ ] Jangan jadikan frontend sumber utama condition.
- [ ] Terima `explanation_type`, `prompt_name`, `llm_model`.
- [ ] Insert metadata prompt ke `recommendations`.
- [ ] Feedback tetap menyimpan `explanation_type` dan `model_version`.

### Testing

- [ ] Test mode chat.
- [ ] Test mode recommend.
- [ ] Test satu session lengkap sampai feedback.
- [ ] Query `experiment_sessions` untuk melihat condition.
- [ ] Query `recommendations` untuk melihat prompt metadata.
- [ ] Cek distribusi A/B/C.

---

## 12. Prompt untuk New Chat

Gunakan instruksi ini di new chat:

```text
Lanjutkan implementasi XAI A/B/C berdasarkan 04_Joint_Research_Azam_Raissa.md dan 06_XAI_ABC_GPT_NLU_Implementation_Guide.md. Gunakan tiga file system prompt markdown sebagai prompt condition A/B/C. Jangan implement CR-HKGE dulu; tetap pakai kgat_baseline retrieval yang sudah ada. Pastikan satu session konsisten memakai condition yang sama dari greeting, chat, sampai explanation Top-3. Simpan condition, prompt_name, prompt_version, llm_model, model_version, dan explanation_payload ke Supabase agar bisa dimonitor.
```

