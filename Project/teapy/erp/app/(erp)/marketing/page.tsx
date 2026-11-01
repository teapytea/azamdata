import { requirePage } from "@/lib/auth";
import { query } from "@/lib/db";
import { MarketingView } from "./view";

export default async function MarketingPage() {
  await requirePage(["owner", "admin", "marketing"]);
  const [partners, campaigns, deliverables, payments] = await Promise.all([
    query("select * from partners order by name"),
    query("select * from campaigns order by archived, created_at desc"),
    query("select * from deliverables order by deadline nulls last"),
    query("select id, campaign_id, amount, paid_on, ref, note from campaign_payments order by paid_on desc"),
  ]);
  return <MarketingView partners={partners as never} campaigns={campaigns as never} deliverables={deliverables as never} payments={payments as never} />;
}
