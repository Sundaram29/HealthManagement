"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Activity, ArrowLeft, Clock, Mail, MapPin, Phone, Star, Stethoscope, Users } from "lucide-react";

type Doctor = {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviews: number;
  qualification: string;
  college: string;
  tags: string[];
  available: string;
  hospitalId: number;
};

type Hospital = {
  id: number;
  name: string;
  city: string;
  state: string;
  address: string;
  pincode?: string | null;
  phone: string;
  email: string;
  website?: string | null;
  rating: number;
  specialties: string[];
  isOpen24Hours: boolean;
  doctorCount: number;
  doctors: Doctor[];
};

const getInitials = (name: string) =>
  name
    .replace("Dr. ", "")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2);

function HospitalPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hospitalId = searchParams.get("hospitalId");

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHospital = async () => {
      if (!hospitalId) {
        setError("Hospital not found");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/hospitals?hospitalId=${hospitalId}`, {
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Failed to fetch hospital");
        }

        setHospital(payload.hospital);
      } catch (fetchError) {
        console.error(fetchError);
        setError(fetchError instanceof Error ? fetchError.message : "Failed to fetch hospital");
      } finally {
        setLoading(false);
      }
    };

    loadHospital();
  }, [hospitalId]);

  const featuredDoctors = useMemo(() => hospital?.doctors.slice(0, 6) ?? [], [hospital]);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Loading hospital details...</div>;
  }

  if (error || !hospital) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold text-slate-800">{error || "Hospital not found"}</p>
        <button onClick={() => router.push("/HospitalList")} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white">
          Back to Hospitals
        </button>
      </div>
    );
  }

  const fullAddress = `${hospital.address}, ${hospital.city}, ${hospital.state}${hospital.pincode ? ` - ${hospital.pincode}` : ""}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-950 via-blue-900 to-cyan-800 text-white">
        <div className="absolute inset-0 opacity-15">
          <Image src="/AIIMS3.jpg" alt={hospital.name} fill className="object-cover" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
          <button onClick={() => router.back()} className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur cursor-pointer">
            <ArrowLeft size={16} /> Back
          </button>

          <div className="grid gap-8 md:grid-cols-[1.4fr,0.8fr] md:items-end">
            <div>
              <p className="mb-3 text-sm text-blue-100">Hospitals / {hospital.name}</p>
              <h1 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">{hospital.name}</h1>
              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-blue-50">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5"><Star size={15} className="text-amber-300 fill-amber-300" /> {hospital.rating.toFixed(1)} rating</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5"><Users size={15} /> {hospital.doctorCount} doctors</span>
                {hospital.isOpen24Hours && <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/20 px-3 py-1.5 text-emerald-100"><Clock size={15} /> Open 24/7</span>}
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <div className="space-y-3 text-sm text-blue-50">
                <div className="flex items-start gap-3"><MapPin size={16} className="mt-0.5 shrink-0" /> <span>{fullAddress}</span></div>
                <div className="flex items-center gap-3"><Phone size={16} className="shrink-0" /> <a href={`tel:${hospital.phone}`} className="hover:underline">{hospital.phone}</a></div>
                <div className="flex items-center gap-3"><Mail size={16} className="shrink-0" /> <a href={`mailto:${hospital.email}`} className="hover:underline">{hospital.email}</a></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-10 px-6 py-10 md:px-10">
        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-3 text-slate-800"><Stethoscope className="text-blue-600" size={20} /><h2 className="text-lg font-semibold">Specialties</h2></div>
            <div className="flex flex-wrap gap-2">
              {hospital.specialties.map((specialty) => (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => router.push(`/Doctorpage?hospitalId=${hospital.id}&specialty=${encodeURIComponent(specialty)}`)}
                  className="rounded-full bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 cursor-pointer"
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-3 text-slate-800"><Activity className="text-emerald-600" size={20} /><h2 className="text-lg font-semibold">Quick Actions</h2></div>
            <div className="space-y-3">
              <button onClick={() => router.push(`/Doctorpage?hospitalId=${hospital.id}`)} className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 cursor-pointer">Browse All Doctors</button>
              <button onClick={() => router.push(`/Doctorpage?hospitalId=${hospital.id}&specialty=${encodeURIComponent(hospital.specialties[0] || "")}`)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 cursor-pointer">Find by Specialty</button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Doctors at {hospital.name}</h2>
              <p className="text-sm text-slate-500">Choose a specialty or browse the doctors currently available at this hospital.</p>
            </div>
            <button onClick={() => router.push(`/Doctorpage?hospitalId=${hospital.id}`)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 cursor-pointer">View all doctors</button>
          </div>

          {featuredDoctors.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-slate-500">No doctors found for this hospital yet.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {featuredDoctors.map((doctor) => (
                <div key={doctor.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-4 flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-800">{getInitials(doctor.name)}</div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold text-slate-900">{doctor.name}</h3>
                      <p className="text-sm font-medium text-blue-700">{doctor.specialty}</p>
                      <p className="mt-1 text-xs text-slate-500">{doctor.experience}</p>
                    </div>
                  </div>
                  <div className="mb-3 flex items-center gap-2 text-sm text-slate-600">
                    <Star size={14} className="text-amber-400 fill-amber-400" /> {doctor.rating}/5 <span className="text-slate-400">({doctor.reviews} reviews)</span>
                  </div>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {doctor.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200">{tag}</span>
                    ))}
                  </div>
                  <button onClick={() => router.push(`/Doctorpage?hospitalId=${hospital.id}&specialty=${encodeURIComponent(doctor.specialty)}`)} className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 cursor-pointer">View {doctor.specialty} doctors</button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function HospitalPage() {
  return (
    <Suspense fallback={null}>
      <HospitalPageContent />
    </Suspense>
  );
}
