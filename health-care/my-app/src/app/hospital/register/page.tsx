"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import RoleLoginShell from "../../components/auth/RoleLoginShell";

export default function HospitalRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [licenseId, setLicenseId] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name || !email || !password || !licenseId) {
      toast.error("All fields are required");
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
          role: "hospital",
          name,
          email,
          password,
          extra: licenseId,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(payload?.error || "Unable to create account.");
        return;
      }

      toast.success("Hospital registered successfully");
      router.push("/hospital/login");
    } catch (error) {
      console.error("Hospital registration failed:", error);
      toast.error("Unable to register right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <RoleLoginShell
      roleLabel="Hospital Register"
      heading="Register hospital"
      description="Create your hospital account."
      accent={{
        pill: "bg-sky-400/20 text-sky-100",
        focusRing: "[&_*:focus]:ring-sky-200/70",
        surfaceGlow:
          "before:absolute before:-right-10 before:top-0 before:h-32 before:w-32 before:rounded-full before:bg-sky-300/20 before:blur-3xl before:content-['']",
      }}
      backgroundImage="/hospital_login_assets/vecteezy_hospital-corridor-interior-with-reception-desk_20060927.jpg"
      imagePosition="center"
      roleLinks={[
        { href: "/auth/register", label: "User" },
        { href: "/hospital/register", label: "Hospital", active: true },
        { href: "/doctor/register", label: "Doctor" },
        { href: "/blood-bank/register", label: "Blood Bank" },
      ]}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-slate-100/85">Already registered?</span>
          <Link href="/hospital/login" className="font-semibold text-sky-100 underline decoration-sky-200 underline-offset-4">
            Hospital Login
          </Link>
        </div>
      }
    >
      <form onSubmit={handleRegister} className="space-y-4">
        <input className="w-full rounded-2xl border border-white/20 bg-white/92 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100" type="text" placeholder="Hospital name" value={name} onChange={(event) => setName(event.target.value)} required />
        <input className="w-full rounded-2xl border border-white/20 bg-white/92 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100" type="email" placeholder="Hospital email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <input className="w-full rounded-2xl border border-white/20 bg-white/92 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100" type="text" placeholder="Hospital license or registration ID" value={licenseId} onChange={(event) => setLicenseId(event.target.value)} required />
        <input className="w-full rounded-2xl border border-white/20 bg-white/92 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100" type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        <button type="submit" className="w-full rounded-2xl bg-sky-600 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </RoleLoginShell>
  );
}
