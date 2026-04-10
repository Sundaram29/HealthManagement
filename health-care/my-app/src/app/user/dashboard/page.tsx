"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UserDashboardPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      fetch("/api/auth/session", { cache: "no-store" })
        .then((response) => response.json())
        .then((payload) => {
          if (!payload?.session || payload.session.role !== "user") {
            setCheckingSession(false);
            router.replace("/auth/login");
            return;
          }

          router.replace("/");
        });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [router]);

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">User Dashboard</p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">Redirecting...</h1>
        </div>
      </main>
    );
  }

  return null;
}
