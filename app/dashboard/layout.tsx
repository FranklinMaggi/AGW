"use client";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function load() {
        const res = await fetch("/api/user/get", { method: "POST" });
        const data = await res.json();
        if (!data.ok) window.location.href = "/login";
        setUser(data.user);
    }
    load();
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar user={user} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
