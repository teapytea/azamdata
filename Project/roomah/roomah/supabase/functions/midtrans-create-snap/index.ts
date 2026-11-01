import { corsHeaders } from "../_shared/cors.ts";

type ReqBody = {
  order_id: string;
  amount: number;
  full_name?: string;
  email?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as ReqBody;
    const serverKey = Deno.env.get("MIDTRANS_SERVER_KEY");
    if (!serverKey) {
      return new Response(
        JSON.stringify({ error: "MIDTRANS_SERVER_KEY not set" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!body?.order_id || !body?.amount) {
      return new Response(
        JSON.stringify({ error: "order_id and amount are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const basicAuth = btoa(`${serverKey}:`);
    const payload = {
      transaction_details: {
        order_id: body.order_id,
        gross_amount: body.amount,
      },
      item_details: [
        {
          id: body.order_id,
          price: body.amount,
          quantity: 1,
          name: "Top Up Koin Roomah",
        },
      ],
      customer_details: {
        first_name: body.full_name ?? "User",
        email: body.email ?? "",
      },
    };

    const res = await fetch(
      "https://app.sandbox.midtrans.com/snap/v1/transactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${basicAuth}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "Midtrans error", detail: data }),
        {
          status: res.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
