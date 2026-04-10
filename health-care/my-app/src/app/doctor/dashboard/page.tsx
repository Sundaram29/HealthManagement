"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      fetch("/api/auth/session", { cache: "no-store" })
        .then((response) => response.json())
        .then((payload) => {
          if (!payload?.session || payload.session.role !== "doctor") {
            setCheckingSession(false);
            router.replace("/doctor/login");
            return;
          }

          setSession(payload.session);
          setCheckingSession(false);
        });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [router]);

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Doctor Dashboard</p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">Checking login...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Doctor Dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Welcome, Dr. {session?.name}</h1>
        <p className="mt-3 text-slate-600">You are logged in through the doctor route.</p>
        <div className="mt-6 rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
          <p><span className="font-semibold text-slate-900">Doctor:</span> {session?.name}</p>
          <p className="mt-1"><span className="font-semibold text-slate-900">Email:</span> {session?.email}</p>
          <p className="mt-1"><span className="font-semibold text-slate-900">Specialty:</span> {session?.extra || "-"}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/doctor/login");
            }}
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}
