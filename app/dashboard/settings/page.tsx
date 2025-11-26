import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SecurityPanel from "./SecurityPanel";
import NotificationSettings from "./NotificationSetting";
import DangerZone from "./DangerZone";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("agw_session")?.value;

  if (!session) redirect("/login");

  return (
    <div className="flex flex-col gap-8 p-6">
      <h1 className="text-3xl font-bold">Impostazioni Account</h1>

      <SecurityPanel />
      <NotificationSettings />
      <DangerZone />
    </div>
  );
}
