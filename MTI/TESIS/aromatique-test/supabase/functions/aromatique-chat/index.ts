// Aromatique AI chat edge function - streaming + recommend tool
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CATALOG = [
  { id: "p1", name: "Senja Melati", family: "Floral Oriental", notes: ["Melati", "Vanila", "Sandalwood"], description: "Hangat dan feminin, cocok untuk acara malam yang elegan.", mood: ["romantis", "elegan", "malam"] },
  { id: "p2", name: "Hutan Pagi", family: "Woody Aromatic", notes: ["Cedarwood", "Bergamot", "Pine"], description: "Segar seperti embun pagi di hutan pinus, maskulin alami.", mood: ["segar", "alami", "kasual"] },
  { id: "p3", name: "Citrus Mentari", family: "Citrus Fresh", notes: ["Lemon", "Grapefruit", "Mint"], description: "Energetik dan ceria, ideal untuk aktivitas siang.", mood: ["energetik", "ceria", "siang"] },
  { id: "p4", name: "Mawar Kasmir", family: "Floral", notes: ["Mawar Damascena", "Peony", "Musk"], description: "Klasik feminin dengan sentuhan mewah.", mood: ["klasik", "feminin", "lembut"] },
  { id: "p5", name: "Kopi Senja", family: "Gourmand", notes: ["Kopi", "Karamel", "Tonka"], description: "Manis dan hangat seperti kopi sore hari.", mood: ["hangat", "manis", "cozy"] },
  { id: "p6", name: "Laut Biru", family: "Aquatic", notes: ["Sea Salt", "Bergamot", "Driftwood"], description: "Aroma segar lautan, ringan dan bersih.", mood: ["segar", "santai", "olahraga"] },
  { id: "p7", name: "Oud Royal", family: "Oriental Woody", notes: ["Oud", "Saffron", "Amber"], description: "Mewah dan misterius, signature Timur Tengah.", mood: ["mewah", "intens", "formal"] },
  { id: "p8", name: "Vanilla Hujan", family: "Gourmand Soft", notes: ["Vanila", "Petrichor", "White Musk"], description: "Manis lembut dengan nuansa hujan, nyaman dipakai sehari-hari.", mood: ["nyaman", "manis", "harian"] },
  { id: "p9", name: "Lavender Provence", family: "Aromatic", notes: ["Lavender", "Rosemary", "White Tea"], description: "Tenang dan menenangkan, cocok untuk relaksasi.", mood: ["tenang", "relaksasi", "lembut"] },
  { id: "p10", name: "Bunga Kenanga", family: "Tropical Floral", notes: ["Kenanga", "Frangipani", "Coconut"], description: "Eksotis tropis, mengingatkan pada liburan pantai.", mood: ["eksotis", "tropis", "ceria"] },
  { id: "p11", name: "Ambar Malam", family: "Amber Oriental", notes: ["Amber", "Patchouli", "Vanila"], description: "Sensual dan dalam, sempurna untuk kencan malam.", mood: ["sensual", "malam", "intens"] },
  { id: "p12", name: "Teh Hijau Matcha", family: "Green Fresh", notes: ["Matcha", "Mint", "Bamboo"], description: "Segar herbal, ringan dan modern.", mood: ["segar", "modern", "ringan"] },
];

const SYSTEM = `Kamu adalah Aromatique AI, asisten parfum yang ramah, hangat, dan ceria. Berbahasa Indonesia santai.

Tugasmu: melalui percakapan singkat, pahami preferensi pengguna (suasana, aktivitas, suka aroma manis/segar/floral/woody, waktu pemakaian, dll). Ajukan 2-4 pertanyaan ringkas (satu per giliran), lalu siap merekomendasikan.

Saat pengguna meminta rekomendasi (atau sistem memintamu via tool), gunakan tool "recommend_perfumes" untuk memilih 3 parfum dari katalog yang paling sesuai, dengan alasan singkat per produk.

KATALOG (gunakan id persis seperti ini):
${JSON.stringify(CATALOG.map((p) => ({ id: p.id, name: p.name, family: p.family, notes: p.notes, mood: p.mood })))}

Jangan menjawab pertanyaan di luar topik parfum. Jaga jawaban singkat (2-4 kalimat) dan ramah.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mode } = await req.json();
    const KEY = Deno.env.get("OPENAI_API_KEY");
    if (!KEY) throw new Error("Missing OPENAI_API_KEY");

    const tools = [{
      type: "function",
      function: {
        name: "recommend_perfumes",
        description: "Pilih 3 parfum dari katalog yang paling sesuai preferensi pengguna",
        parameters: {
          type: "object",
          properties: {
            picks: {
              type: "array",
              minItems: 3,
              maxItems: 3,
              items: {
                type: "object",
                properties: {
                  id: { type: "string", description: "id parfum dari katalog (mis. p1)" },
                  reason: { type: "string", description: "alasan singkat 1-2 kalimat mengapa cocok" },
                },
                required: ["id", "reason"],
                additionalProperties: false,
              },
            },
            summary: { type: "string", description: "ringkasan singkat preferensi pengguna" },
          },
          required: ["picks", "summary"],
          additionalProperties: false,
        },
      },
    }];

    const body: Record<string, unknown> = {
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: SYSTEM }, ...messages],
    };

    if (mode === "recommend") {
      body.tools = tools;
      body.tool_choice = { type: "function", function: { name: "recommend_perfumes" } };
    } else {
      body.stream = true;
    }

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("OpenAI error", resp.status, t);
      const message =
        resp.status === 429 ? "Terlalu banyak permintaan. Coba lagi sebentar." :
        resp.status === 402 ? "Kuota AI habis. Mohon top up workspace." :
        "AI gateway error";
      return new Response(JSON.stringify({ error: message }), {
        status: resp.status === 429 ? 429 : resp.status === 402 ? 402 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "recommend") {
      const json = await resp.json();
      const call = json.choices?.[0]?.message?.tool_calls?.[0];
      const args = call ? JSON.parse(call.function.arguments) : { picks: [], summary: "" };
      const products = args.picks
        .map((p: any) => {
          const c = CATALOG.find((x) => x.id === p.id);
          return c ? { ...c, reason: p.reason } : null;
        })
        .filter(Boolean);
      return new Response(JSON.stringify({ products, summary: args.summary }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(resp.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
