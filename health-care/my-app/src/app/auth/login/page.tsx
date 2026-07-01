"use client";

import Link from "next/link";
import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import RoleLoginShell from "../../components/auth/RoleLoginShell";

const LoginContent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRedirect = searchParams.get("redirectTo");
  const redirectTo =
    requestedRedirect &&
    requestedRedirect.startsWith("/") &&
    !requestedRedirect.startsWith("/auth/login")
      ? requestedRedirect
      : "/";

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
          role: "user",
          email,
          password,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(payload?.error || "Invalid login credentials.");
        return;
      }

      toast.success("User login successful");
      router.replace(redirectTo);
    } catch (error) {
      console.error("User login failed:", error);
      toast.error("Unable to sign in right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleLoginShell
      roleLabel="User Portal"
      heading="Welcome back"
      description="Sign in to your healthcare account."
      accent={{
        pill: "bg-cyan-400/20 text-cyan-100",
        focusRing: "[&_*:focus]:ring-cyan-200/70",
        surfaceGlow:
          "before:absolute before:-right-10 before:top-0 before:h-32 before:w-32 before:rounded-full before:bg-cyan-300/20 before:blur-3xl before:content-['']",
      }}
      backgroundImage="/user_login.jpg"
      imagePosition="center"
      roleLinks={[
        { href: "/auth/login", label: "User", active: true },
        { href: "/hospital/login", label: "Hospital" },
        { href: "/doctor/login", label: "Doctor" },
        { href: "/blood-bank/login", label: "Blood Bank" },
      ]}
      footer={
        <p className="text-center text-sm text-slate-100/85">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="font-semibold text-cyan-100 underline decoration-cyan-200 underline-offset-4">
            Signup Now
          </Link>
        </p>
      }
    >
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          id="email"
          className="w-full rounded-2xl border border-white/20 bg-white/92 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
          type="email"
          placeholder="Enter your email"
          required
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          id="password"
          className="w-full rounded-2xl border border-white/20 bg-white/92 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
          type="password"
          placeholder="Enter your password"
          required
        />
        <div className="text-right">
          <a className="text-sm font-medium text-cyan-100 underline decoration-cyan-200 underline-offset-4" href="#">
            Forgot Password
          </a>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-cyan-600 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Logging in..." : "User Login"}
        </button>
      </form>
    </RoleLoginShell>
  );
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
