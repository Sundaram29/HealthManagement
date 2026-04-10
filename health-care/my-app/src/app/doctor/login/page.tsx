"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import RoleLoginShell from "../../components/auth/RoleLoginShell";

export default function DoctorLoginPage() {
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
          role: "doctor",
          email,
          password,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(payload?.error || "Invalid login credentials.");
        return;
      }

      toast.success("Doctor login successful");
      router.push("/doctor/dashboard");
    } catch (error) {
      console.error("Doctor login failed:", error);
      toast.error("Unable to sign in right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <RoleLoginShell
      roleLabel="Doctor Portal"
      heading="Doctor login"
      description="Sign in to continue to your doctor dashboard."
      accent={{
        pill: "bg-emerald-400/20 text-emerald-100",
        focusRing: "[&_*:focus]:ring-emerald-200/70",
        surfaceGlow:
          "before:absolute before:-right-10 before:top-0 before:h-32 before:w-32 before:rounded-full before:bg-emerald-300/20 before:blur-3xl before:content-['']",
      }}
      backgroundImage="/doctor_login.jpg"
      imagePosition="center"
      roleLinks={[
        { href: "/auth/login", label: "User" },
        { href: "/hospital/login", label: "Hospital" },
        { href: "/doctor/login", label: "Doctor", active: true },
        { href: "/blood-bank/login", label: "Blood Bank" },
      ]}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-slate-100/85">New doctor account?</span>
          <Link href="/doctor/register" className="font-semibold text-emerald-100 underline decoration-emerald-200 underline-offset-4">
            Register Doctor
          </Link>
        </div>
      }
    >
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          className="w-full rounded-2xl border border-white/20 bg-white/92 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
          type="email"
          placeholder="Doctor email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          className="w-full rounded-2xl border border-white/20 bg-white/92 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </RoleLoginShell>
  );
}
