import { Shell } from "@/components/shell";
import { requirePage } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function ErpLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePage(["owner", "admin", "marketing"]);
  const settings = await getSettings();
  return <Shell user={{ name: user.name, role: user.role }} outlet={settings.outlet}>{children}</Shell>;
}
