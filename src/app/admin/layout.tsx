import type { ReactNode } from "react";

import { requireAdmin } from "@/lib/auth/permissions";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

import {
  getStoreSettings,
} from "@/repositories/store-settings.repository";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const [
    admin,
    settings,
  ] = await Promise.all([
    requireAdmin(),
    getStoreSettings(),
  ]);

  const storeName =
    settings?.storeName?.trim() ||
    "Furniture Store";

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <AdminSidebar
          storeName={storeName}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader
            adminName={admin.name}
          />

          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}