"use client";

import React from "react";
import Link from "next/link";
import { AdminUser, EventStatus } from "@/types";
import { logoutAdmin } from "@/lib/firebase/auth";

interface AdminHeaderProps {
  adminUser: AdminUser | null;
  status: EventStatus;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  adminUser,
  status,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-16 sm:h-20 py-2.5 sm:py-3 gap-2">
          
          {/* Brand & Admin Badge */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link href="/admin" className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center p-1 sm:p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md shrink-0">
                <img
                  src="/logo.png"
                  alt="HackinTym'26 2.0 Logo"
                  className="h-7 sm:h-9 w-auto object-contain rounded-xl"
                />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="font-extrabold text-sm sm:text-lg tracking-tight text-white font-display whitespace-nowrap">
                  HackinTym'26 2.0
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 font-mono-numbers whitespace-nowrap">
                  ADMIN
                </span>
              </div>
            </Link>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* View Live Public Board */}
            <Link
              href="/"
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 text-slate-200 hover:text-white text-xs sm:text-sm font-bold transition-all font-display shadow-md"
              title="View Public Live Dashboard"
            >
              <i className="bi bi-eye-fill text-cyan-400 text-xs sm:text-sm" />
              <span className="hidden sm:inline">View Public Live Dashboard</span>
              <span className="sm:hidden text-xs">Public</span>
            </Link>

            {/* Admin Profile & Logout */}
            <div className="flex items-center gap-2 border-l border-slate-800/80 pl-2 sm:pl-3">
              <span className="hidden md:inline text-xs font-semibold text-slate-300 font-mono-numbers">
                {adminUser?.email || "Admin User"}
              </span>
              <button
                onClick={() => logoutAdmin()}
                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/40 text-slate-300 hover:text-rose-400 text-xs font-bold transition-all font-display shadow-md"
                title="Logout"
              >
                <i className="bi bi-box-arrow-right text-xs" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
