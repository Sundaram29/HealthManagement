"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import RoleLoginShell from "../../components/auth/RoleLoginShell";

export default function HospitalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email || !password) {
      toast.error("Email and password required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "hospital",
          email,
          password,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(payload?.error || "Invalid login credentials.");
        return;
      }

      toast.success("Hospital login successful");
      router.push("/hospital/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <RoleLoginShell
      roleLabel="Hospital Portal"
      heading="Hospital login"
      description="Sign in to continue to your hospital dashboard."
      accent={{
        pill: "bg-sky-400/20 text-sky-100",
        focusRing: "[&_*:focus]:ring-sky-200/70",
        surfaceGlow:
          "before:absolute before:-right-10 before:top-0 before:h-32 before:w-32 before:rounded-full before:bg-sky-300/20 before:blur-3xl before:content-['']",
      }}
      backgroundImage="/hospital_login_assets/vecteezy_hospital-corridor-interior-with-reception-desk_20060927.jpg"
      imagePosition="center"
      roleLinks={[
        { href: "/auth/login", label: "User" },
        { href: "/hospital/login", label: "Hospital", active: true },
        { href: "/doctor/login", label: "Doctor" },
        { href: "/blood-bank/login", label: "Blood Bank" },
      ]}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-slate-100/85">Need a hospital account?</span>
          <Link href="/hospital/register" className="font-semibold text-sky-100 underline decoration-sky-200 underline-offset-4">
            Register Hospital
          </Link>
        </div>
      }
    >
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          className="w-full rounded-2xl border border-white/20 bg-white/92 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          type="email"
          placeholder="Hospital email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          className="w-full rounded-2xl border border-white/20 bg-white/92 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full rounded-2xl bg-sky-600 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </RoleLoginShell>
  );
}
