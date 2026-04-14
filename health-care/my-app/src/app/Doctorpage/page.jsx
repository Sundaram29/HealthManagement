"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronDown, Search, Star, Stethoscope } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

const getInitials = (name) =>
  name
    .replace("Dr. ", "")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2);

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={14}
        className={star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}
      />
    ))}
  </div>
);

function DoctorCard({ doctor }) {
  const router = useRouter();

  const handleBookAppointment = async () => {
    const redirectTo = `/BookAppointment?doctorId=${doctor.id}&hospitalId=${doctor.hospitalId}`;
    const response = await fetch("/api/auth/session", { cache: "no-store" });
    const payload = await response.json().catch(() => ({ session: null }));

    if (!payload?.session || payload.session.role !== "user") {
      router.push(`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`);
      return;
    }

    router.push(redirectTo);
  };

  return (
    <div className="group overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-blue-200 text-lg font-bold text-sky-900 shadow-inner">
            {getInitials(doctor.name)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-lg font-semibold text-slate-900">{doctor.name}</h3>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                {doctor.available}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-blue-700">{doctor.specialty}</p>
            <div className="mt-3 flex items-center gap-2">
              <StarRating rating={doctor.rating} />
              <span className="text-xs text-slate-400">({doctor.reviews} reviews)</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">{doctor.experience}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {doctor.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
          {doctor.qualification} - {doctor.college}
        </div>
      </div>

      <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
        <button
          onClick={handleBookAppointment}
          className="w-full rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-blue-800 hover:to-cyan-600 cursor-pointer"
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
}

function DoctorsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const hospitalId = searchParams.get("hospitalId") || "";
  const initialSpecialty = searchParams.get("specialty") || "All Specialties";

  const [allDoctors, setAllDoctors] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setSelectedSpecialty(initialSpecialty);
  }, [initialSpecialty]);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const params = new URLSearchParams();
        if (hospitalId) params.set("hospitalId", hospitalId);

        const response = await fetch(`/api/doctors?${params.toString()}`, {
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Failed to fetch doctors");
        }

        setAllDoctors(payload.doctors || []);
      } catch (fetchError) {
        console.error(fetchError);
        setError(fetchError instanceof Error ? fetchError.message : "Failed to fetch doctors");
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, [hospitalId]);

  const specialtyOptions = useMemo(() => {
    const specialties = Array.from(new Set(allDoctors.map((doctor) => doctor.specialty).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b)
    );
    return ["All Specialties", ...specialties];
  }, [allDoctors]);

  const filteredDoctors = useMemo(() => {
    const normalizedQuery = searchText.trim().toLowerCase();

    return allDoctors.filter((doctor) => {
      const matchesSpecialty =
        selectedSpecialty === "All Specialties" ||
        doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase();

      const matchesSearch =
        !normalizedQuery ||
        doctor.name.toLowerCase().includes(normalizedQuery) ||
        doctor.specialty.toLowerCase().includes(normalizedQuery) ||
        doctor.conditions.some((condition) => condition.toLowerCase().includes(normalizedQuery)) ||
        doctor.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

      return matchesSpecialty && matchesSearch;
    });
  }, [allDoctors, searchText, selectedSpecialty]);

  const hospitalName = allDoctors[0]?.hospital?.name || "Specialty Finder";
  const resultLabel = selectedSpecialty === "All Specialties" ? "All Doctors" : `${selectedSpecialty} Doctors`;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#eef5ff_40%,#ffffff_100%)]">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(14,116,144,0.35),_transparent_35%),linear-gradient(135deg,#0f1f63_0%,#114a8b_48%,#0d9488_100%)] text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url('/AIIMS3.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.72),rgba(29,78,216,0.4),rgba(13,148,136,0.38))]" />

        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-6 md:px-10 md:py-14">
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/95 backdrop-blur cursor-pointer hover:bg-white/15"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="max-w-3xl">
            <p className="text-sm font-medium text-cyan-100/90">Browse By Specialty</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              Find the right doctor for {hospitalName}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-50/85 sm:text-base">
              Search by doctor name, symptom, or choose a specialty from the dropdown to instantly narrow down the doctors available for this hospital.
            </p>
          </div>

          <div className="mt-8 rounded-[30px] border border-white/15 bg-white/10 p-3 shadow-[0_20px_70px_rgba(2,6,23,0.28)] backdrop-blur-xl">
            <div className="grid gap-3 md:grid-cols-[1.2fr_0.9fr_auto]">
              <label className="flex items-center gap-3 rounded-[22px] bg-white px-4 py-3 text-slate-900 shadow-sm">
                <Search size={18} className="text-slate-400" />
                <input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search doctor, specialty, symptom..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </label>

              <label className="relative flex items-center rounded-[22px] bg-white px-4 py-3 text-slate-900 shadow-sm">
                <Stethoscope size={18} className="mr-3 text-sky-600" />
                <select
                  value={selectedSpecialty}
                  onChange={(event) => setSelectedSpecialty(event.target.value)}
                  className="w-full appearance-none bg-transparent pr-8 text-sm font-medium outline-none cursor-pointer"
                >
                  {specialtyOptions.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="pointer-events-none absolute right-4 text-slate-400" />
              </label>

              <button
                type="button"
                onClick={() => {
                  setSearchText("");
                  setSelectedSpecialty("All Specialties");
                }}
                className="rounded-[22px] bg-gradient-to-r from-blue-700 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-blue-800 hover:to-cyan-600 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 md:px-10 md:py-10">
        <div className="rounded-[30px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-cyan-700">{hospitalName}</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900 sm:text-3xl">{resultLabel}</h2>
              <p className="mt-2 text-sm text-slate-500">
                {loading ? "Loading doctors..." : `${filteredDoctors.length} doctors match your current specialty and search filters.`}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {specialtyOptions.slice(1).map((specialty) => (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                    selectedSpecialty === specialty
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400">Loading doctors...</div>
          ) : error ? (
            <div className="py-20 text-center text-red-500">{error}</div>
          ) : filteredDoctors.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center text-slate-500">
              No doctors found for the selected specialty and search text.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredDoctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={null}>
      <DoctorsPageContent />
    </Suspense>
  );
}
