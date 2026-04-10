"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import RoleLoginShell from "../../components/auth/RoleLoginShell";

export default function BloodBankRegisterPage() {
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
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "blood-bank",
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

      toast.success("Blood bank registered successfully");
      router.push("/blood-bank/login");
    } catch (error) {
      console.error("Blood bank registration failed:", error);
      toast.error("Unable to register right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <RoleLoginShell
      roleLabel="Blood Bank Register"
      heading="Register blood bank"
      description="Create your blood bank account."
      accent={{
        pill: "bg-rose-400/20 text-rose-100",
        focusRing: "[&_*:focus]:ring-rose-200/70",
        surfaceGlow:
          "before:absolute before:-right-10 before:top-0 before:h-32 before:w-32 before:rounded-full before:bg-rose-300/20 before:blur-3xl before:content-['']",
      }}
      backgroundImage="/blood_bank_login_assets/166_generated.jpg"
      imagePosition="center"
      roleLinks={[
        { href: "/auth/register", label: "User" },
        { href: "/hospital/register", label: "Hospital" },
        { href: "/doctor/register", label: "Doctor" },
        { href: "/blood-bank/register", label: "Blood Bank", active: true },
      ]}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-slate-100/85">Already registered?</span>
          <Link href="/blood-bank/login" className="font-semibold text-rose-100 underline decoration-rose-200 underline-offset-4">
            Blood Bank Login
          </Link>
        </div>
      }
    >
      <form onSubmit={handleRegister} className="space-y-4">
        <input className="w-full rounded-2xl border border-white/20 bg-white/92 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100" type="text" placeholder="Blood bank name" value={name} onChange={(event) => setName(event.target.value)} required />
        <input className="w-full rounded-2xl border border-white/20 bg-white/92 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100" type="email" placeholder="Blood bank email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <input className="w-full rounded-2xl border border-white/20 bg-white/92 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100" type="text" placeholder="License or center ID" value={licenseId} onChange={(event) => setLicenseId(event.target.value)} required />
        <input className="w-full rounded-2xl border border-white/20 bg-white/92 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100" type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        <button type="submit" className="w-full rounded-2xl bg-rose-600 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-70" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </RoleLoginShell>
  );
}
