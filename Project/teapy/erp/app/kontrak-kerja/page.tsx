import type { Metadata } from "next";
import { one } from "@/lib/db";
import { mySubmissionId } from "./actions";
import { ContractApp } from "./view";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Kontrak Kerja · Teapy" };

export default async function ContractPage() {
  const [template, draft, id] = await Promise.all([
    one("select id, title, body from contract_templates where status='Diterbitkan' order by version desc limit 1"),
    one("select title, body from contract_templates where status='Draft' order by version desc limit 1"),
    mySubmissionId(),
  ]);
  const submission = id ? await one("select id, title, body, hash, name, email, phone, address, printed_name, signature, signed_at, user_id from contract_submissions where id=$1", [id]) : null;
  return <ContractApp template={template as never} draft={draft as never} submission={submission as never} />;
}
