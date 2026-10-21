
"use client";

import { useState } from "react";
import Link from "next/link";

import { logoutAction } from "@/actions/auth/logout";

type AdminHeaderProps = {
  adminName: string;
};

export function AdminHeader({ adminName }: AdminHeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const result = await logoutAction();

      if (result.success) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  }

  const initials =
    adminName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "A";

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 shadow-sm shadow-slate-900/[0.03] backdrop-blur-xl">
      <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Workspace identity */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden h-10 w-1 rounded-full bg-gradient-to-b from-cyan-500 to-blue-600 sm:block" />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-sm font-bold tracking-tight text-slate-900 sm:text-base">
                Admin Dashboard
              </h1>

              <span className="hidden rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-800 md:inline-flex">
                Admin
              </span>
            </div>

            <p className="mt-1 hidden text-xs text-slate-500 sm:block">
              Manage your store and business operations
            </p>
          </div>
        </div>

        {/* Header actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          {/* View storefront */}
          <Link
            href="/"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-all hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-500/20 sm:px-4 sm:text-sm"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 10.5 12 3l9 7.5"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.5 9v11h13V9M9 20v-6h6v6"
              />
            </svg>
            <span>View Store</span>
          </Link>

          <div className="hidden h-9 w-px bg-slate-200 sm:block" />

          {/* Administrator identity */}
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-bold text-white shadow-md shadow-cyan-600/20">
              {initials}
            </div>

            <div className="hidden min-w-0 sm:block">
              <p className="max-w-36 truncate text-sm font-bold text-slate-900">
                {adminName}
              </p>

              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Store Administrator
              </p>
            </div>
          </div>

          {/* Sign out */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-3 text-xs font-semibold text-white shadow-sm transition-all hover:from-rose-600 hover:to-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:text-sm"
          >
            {isLoggingOut ? (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="opacity-25"
                  />
                  <path
                    d="M21 12a9 9 0 0 0-9-9"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                <span>Signing out</span>
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 17l5-5-5-5M15 12H3"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"
                  />
                </svg>
                <span>Sign out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
