"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import RoleLoginShell from "../../components/auth/RoleLoginShell";

export default function BloodBankLoginPage() {
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
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "blood-bank",
          email,
          password,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(payload?.error || "Invalid login credentials.");
        return;
      }

      toast.success("Blood bank login successful");
      router.push("/blood-bank/dashboard");
    } catch (error) {
      console.error("Blood bank login failed:", error);
      toast.error("Unable to sign in right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <RoleLoginShell
      roleLabel="Blood Bank Portal"
      heading="Blood bank login"
      description="Sign in to continue to the blood bank workspace."
      accent={{
        pill: "bg-rose-400/20 text-rose-100",
        focusRing: "[&_*:focus]:ring-rose-200/70",
        surfaceGlow:
          "before:absolute before:-right-10 before:top-0 before:h-32 before:w-32 before:rounded-full before:bg-rose-300/20 before:blur-3xl before:content-['']",
      }}
      backgroundImage="/blood_bank_login_assets/166_generated.jpg"
      imagePosition="center"
      roleLinks={[
        { href: "/auth/login", label: "User" },
        { href: "/hospital/login", label: "Hospital" },
        { href: "/doctor/login", label: "Doctor" },
        { href: "/blood-bank/login", label: "Blood Bank", active: true },
      ]}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-slate-100/85">Need a blood bank account?</span>
          <Link href="/blood-bank/register" className="font-semibold text-rose-100 underline decoration-rose-200 underline-offset-4">
            Register Blood Bank
          </Link>
        </div>
      }
    >
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          className="w-full rounded-2xl border border-white/20 bg-white/92 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
          type="email"
          placeholder="Blood bank email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          className="w-full rounded-2xl border border-white/20 bg-white/92 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full rounded-2xl bg-rose-600 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </RoleLoginShell>
  );
}
