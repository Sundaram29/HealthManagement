"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import RoleLoginShell from "../../components/auth/RoleLoginShell";

type HospitalOption = {
  id: number;
  name: string;
  city?: string;
  state?: string;
};

export default function DoctorRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const [hospitals, setHospitals] = useState<HospitalOption[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadHospitals = async () => {
      try {
        const response = await fetch("/api/hospitals", { cache: "no-store" });
        const payload = await response.json().catch(() => ({ hospitals: [] }));

        if (!response.ok) {
          throw new Error(payload?.error || "Unable to load hospitals.");
        }

        setHospitals(Array.isArray(payload.hospitals) ? payload.hospitals : []);
      } catch (error) {
        console.error("Doctor registration hospitals failed:", error);
        toast.error("Register a hospital first so doctors can be linked.");
      } finally {
        setLoadingHospitals(false);
      }
    };

    void loadHospitals();
  }, []);

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name || !email || !password || !specialty || !hospitalId) {
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
          role: "doctor",
          name,
          email,
          password,
          extra: specialty,
          hospitalId,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(payload?.error || "Unable to create account.");
        return;
      }

      toast.success("Doctor registered successfully");
      router.push("/doctor/login");
    } catch (error) {
      console.error("Doctor registration failed:", error);
      toast.error("Unable to register right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <RoleLoginShell
      roleLabel="Doctor Register"
      heading="Register doctor"
      description="Create your doctor account."
      accent={{
        pill: "bg-emerald-400/20 text-emerald-100",
        focusRing: "[&_*:focus]:ring-emerald-200/70",
        surfaceGlow:
          "before:absolute before:-right-10 before:top-0 before:h-32 before:w-32 before:rounded-full before:bg-emerald-300/20 before:blur-3xl before:content-['']",
      }}
      backgroundImage="/doctor_login.jpg"
      imagePosition="center"
      roleLinks={[
        { href: "/auth/register", label: "User" },
        { href: "/hospital/register", label: "Hospital" },
        { href: "/doctor/register", label: "Doctor", active: true },
        { href: "/blood-bank/register", label: "Blood Bank" },
      ]}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-slate-100/85">Already registered?</span>
          <Link href="/doctor/login" className="font-semibold text-emerald-100 underline decoration-emerald-200 underline-offset-4">
            Doctor Login
          </Link>
        </div>
      }
    >
      <form onSubmit={handleRegister} className="space-y-4">
        <input className="w-full rounded-2xl border border-white/20 bg-white/92 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100" type="text" placeholder="Doctor name" value={name} onChange={(event) => setName(event.target.value)} required />
        <input className="w-full rounded-2xl border border-white/20 bg-white/92 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100" type="email" placeholder="Doctor email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <select
          className="w-full rounded-2xl border border-white/20 bg-white/92 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
          value={hospitalId}
          onChange={(event) => setHospitalId(event.target.value)}
          required
          disabled={loadingHospitals || hospitals.length === 0}
        >
          <option value="">
            {loadingHospitals
              ? "Loading hospitals..."
              : hospitals.length === 0
                ? "Register a hospital first"
                : "Select linked hospital"}
          </option>
          {hospitals.map((hospital) => (
            <option key={hospital.id} value={hospital.id}>
              {hospital.name}
              {hospital.city || hospital.state ? ` - ${[hospital.city, hospital.state].filter(Boolean).join(", ")}` : ""}
            </option>
          ))}
        </select>
        <input className="w-full rounded-2xl border border-white/20 bg-white/92 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100" type="text" placeholder="Specialty" value={specialty} onChange={(event) => setSpecialty(event.target.value)} required />
        <input className="w-full rounded-2xl border border-white/20 bg-white/92 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100" type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        {hospitals.length === 0 && !loadingHospitals ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            No hospitals are available yet. Create a hospital account first, then register the doctor.
          </p>
        ) : null}
        <button
          type="submit"
          className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading || loadingHospitals || hospitals.length === 0}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </RoleLoginShell>
  );
}
