import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProfileForm from "../components/ProfileForm";
import EmailPreferences from "../components/EmailPreferences";
import AvatarUploader from "../components/AvatarUploader";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("agw_session")?.value;

  if (!session) redirect("/login");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
  const res = await fetch(`${apiUrl}/api/user/get`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: session }),
    cache: "no-store",
  });

  const user = await res.json();

  return (
    <div className="flex flex-col gap-8 p-6">
      <h1 className="text-3xl font-bold">Il tuo Profilo</h1>

      <AvatarUploader user={user} />

      <ProfileForm user={user} />

      <EmailPreferences prefs={user.mailing.preferences} userId={user.id} />
    
    </div>
    
  );
}
