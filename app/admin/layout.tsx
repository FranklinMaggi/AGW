import type { ReactNode } from "react";
import AdminSidebar from "./components/AdminSidebar";
import AdminTopbar from "./components/AdminTopbar";
interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="admin-theme min-h-screen flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Content area */}
      <div className="flex flex-col flex-1 min-h-screen">
        <AdminTopbar />

        <main className="p-6 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
