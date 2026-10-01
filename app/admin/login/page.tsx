"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAdmin, subscribeToAuth } from "@/lib/firebase/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeToAuth((user) => {
      if (user) {
        router.replace("/admin");
      }
    });
    return () => unsub();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await loginAdmin(email.trim(), password);
      router.replace("/admin");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid admin credentials";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950 font-sans">
      
      {/* Background Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-rose-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Login Card */}
      <div className="relative w-full max-w-md rounded-3xl cyber-card border border-slate-800 shadow-2xl p-7 sm:p-9">
        
        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-2 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 shadow-lg shadow-slate-950/60">
            <img src="/logo.png" alt="HackinTym'26 2.0 Logo" className="h-14 w-auto object-contain rounded-xl" />
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-white font-display">
            HackinTym'26 2.0 Admin Control
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">
            Restricted access for HackinTym'26 2.0 Technical Organizing Board
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2.5 shadow-md">
            <i className="bi bi-exclamation-triangle-fill text-base shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
              Admin Email
            </label>
            <div className="relative">
              <i className="bi bi-envelope-fill absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yourcollege.edu"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-rose-500/70 shadow-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
              Password
            </label>
            <div className="relative">
              <i className="bi bi-key-fill absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-rose-500/70 font-mono-numbers shadow-sm"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-rose-950/50 disabled:opacity-50 font-display mt-2"
          >
            <span>{isLoading ? "Authenticating..." : "Authorize Sign In"}</span>
            <i className="bi bi-arrow-right text-sm" />
          </button>
        </form>

        <div className="mt-8 pt-5 border-t border-slate-800/80 text-center font-display">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white transition-colors font-sans flex items-center justify-center gap-1.5"
          >
            <i className="bi bi-arrow-left text-xs" />
            <span>Return to Public Live Dashboard</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
