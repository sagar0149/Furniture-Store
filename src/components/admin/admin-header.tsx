"use client";

import { useState } from "react";
import Link from "next/link";

import { logoutAction } from "@/actions/auth/logout";

type AdminHeaderProps = {
  adminName: string;
};

export function AdminHeader({
  adminName,
}: AdminHeaderProps) {
  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      const result = await logoutAction();

      if (result.success) {
        window.location.href = "/login";
      }
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div>
          <p className="text-sm font-medium">
            Admin Dashboard
          </p>

          <p className="hidden text-xs text-muted-foreground sm:block">
            Manage your store
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="hidden text-sm text-muted-foreground hover:text-foreground sm:block"
          >
            View Store
          </Link>

          <div className="hidden h-6 w-px bg-border sm:block" />

          <div className="text-right">
            <p className="text-sm font-medium">
              {adminName}
            </p>

            <p className="text-xs text-muted-foreground">
              Administrator
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoggingOut
              ? "Signing out..."
              : "Sign out"}
          </button>
        </div>
      </div>
    </header>
  );
}