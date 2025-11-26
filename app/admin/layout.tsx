"use client";

import "../globals.css";
import "./admin.css";
import AdminSidebar from "./components/AdminSidebar";
import AdminTopbar from "./components/AdminTopbar";
import { useSearchParams } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const params = useSearchParams();
  const token = params.get("token");

  return (
    <div className="admin-theme min-h-screen flex">

      <AdminSidebar token={token} />

      <div className="flex flex-col flex-1 min-h-screen">
        <AdminTopbar token={token} />
        <main className="p-6 flex-1">
          {children}
        </main>
      </div>

    </div>
  );
}
