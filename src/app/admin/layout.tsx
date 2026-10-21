
import type { ReactNode } from "react";

import { requireAdmin } from "@/lib/auth/permissions";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { getStoreSettings } from "@/repositories/store-settings.repository";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const [admin, settings] = await Promise.all([
    requireAdmin(),
    getStoreSettings(),
  ]);

  const storeName =
    settings?.storeName?.trim() || "Furniture Store";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* Persistent admin navigation */}
        <AdminSidebar storeName={storeName} />

        {/* Main admin workspace */}
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader adminName={admin.name} />

          <main className="relative min-w-0 flex-1">
            {/* Subtle digital background accents */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-cyan-100/30 blur-3xl" />
              <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-blue-100/20 blur-3xl" />
            </div>

            {/* Page content stays above the background */}
            <div className="relative z-0 min-h-full">
              {children}
            </div>
          </main>

          {/* Consistent admin footer */}
          <footer className="border-t border-slate-200 bg-white/90 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>
                © {new Date().getFullYear()} {storeName}. Admin Panel.
              </p>

              <p className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Store management workspace
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
