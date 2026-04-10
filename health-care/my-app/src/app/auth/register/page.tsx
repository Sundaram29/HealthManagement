"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import RoleLoginShell from "../../components/auth/RoleLoginShell";

const Page = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and password required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "user",
          name: email.split("@")[0],
          email,
          password,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(payload?.error || "Unable to create account.");
        return;
      }

      toast.success("User registered successfully");
      router.push("/");
    } catch (error) {
      console.error("User registration failed:", error);
      toast.error("Unable to register right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleLoginShell
      roleLabel="User Register"
      heading="Create account"
      description="Create your healthcare account."
      accent={{
        pill: "bg-cyan-400/20 text-cyan-100",
        focusRing: "[&_*:focus]:ring-cyan-200/70",
        surfaceGlow:
          "before:absolute before:-right-10 before:top-0 before:h-32 before:w-32 before:rounded-full before:bg-cyan-300/20 before:blur-3xl before:content-['']",
      }}
      backgroundImage="/user_login.jpg"
      imagePosition="center"
      roleLinks={[
        { href: "/auth/register", label: "User", active: true },
        { href: "/hospital/register", label: "Hospital" },
        { href: "/doctor/register", label: "Doctor" },
        { href: "/blood-bank/register", label: "Blood Bank" },
      ]}
      footer={
        <p className="text-center text-sm text-slate-100/85">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-cyan-100 underline decoration-cyan-200 underline-offset-4">
            Login Now
          </Link>
        </p>
      }
    >
      <form onSubmit={handleRegister} className="space-y-4">
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
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-cyan-600 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Registering..." : "User Register"}
        </button>
      </form>
    </RoleLoginShell>
  );
};

export default Page;
