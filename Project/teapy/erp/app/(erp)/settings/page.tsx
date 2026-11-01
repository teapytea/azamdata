import { FULL, requirePage } from "@/lib/auth";
import { query } from "@/lib/db";
import { getSettings, publicSettings } from "@/lib/settings";
import { SettingsView } from "./view";

export default async function SettingsPage() {
  await requirePage(FULL);
  const [settings, accounts] = await Promise.all([
    getSettings(),
    query("select id, email, name, role, active from users where role <> 'employee' order by role, name"),
  ]);
  return <SettingsView settings={publicSettings(settings)} accounts={accounts as never} />;
}
