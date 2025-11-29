"use client";

import ProfileStrip from "./components/ProfileStrip";
import LevelCard from "./components/LevelCard";
import StatsRow from "./components/StatsRow";
import DisciplineCard from "./components/DisciplineCard";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/user/get", { method: "POST" , cache: "no-store"});
      const data = await res.json();
      if (!data.ok) window.location.href = "/login";
      setUser(data.user);
    }
    load();
  }, []);

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <ProfileStrip user={user} />
      <LevelCard user={user} />
      <StatsRow user={user} />
      <DisciplineCard user={user} />
    </div>
  );
}
