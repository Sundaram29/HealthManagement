"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Hospital = {
  id: number;
  name: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  rating: number;
  isOpen24Hours: boolean;
  specialties: string[];
  doctorCount: number;
};

const SearchIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const PinIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.22 1.18 2 2 0 012.22 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.56-.56a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
  </svg>
);

const ClockIcon = ({ size = 11 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const StarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="#f59e0b">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

function HospitalCard({ hospital, index }: { hospital: Hospital; index: number }) {
  const delay = `${index * 60}ms`;
  const router = useRouter();
  const fullAddress = `${hospital.address}, ${hospital.city}, ${hospital.state}`;

  return (
    <div
      className="hospital-card"
      style={{
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #e5e7eb",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 11,
        boxShadow: "0 1px 3px rgba(0,0,0,.07), 0 6px 20px rgba(0,0,0,.04)",
        animation: `fadeUp .4s ease ${delay} both`,
        transition: "transform .2s, box-shadow .2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.12), 0 16px 40px rgba(0,0,0,.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,.07), 0 6px 20px rgba(0,0,0,.04)";
      }}
    >
      <div className="hospital-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: "#111827", lineHeight: 1.3 }}>
          {hospital.name}
        </span>
        {hospital.isOpen24Hours && (
          <span className="hospital-pill" style={{ display: "flex", alignItems: "center", gap: 4, background: "#dcfce7", color: "#16a34a", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap", marginLeft: 8 }}>
            <ClockIcon />&nbsp;24/7
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <StarIcon />
        <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{hospital.rating.toFixed(1)}</span>
        <span style={{ color: "#9ca3af", fontSize: 12 }}>/5</span>
        <span style={{ marginLeft: "auto", color: "#6b7280", fontSize: 12 }}>{hospital.doctorCount} doctors</span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 7, color: "#6b7280", fontSize: 12.5, lineHeight: 1.5 }}>
        <span style={{ marginTop: 1, flexShrink: 0 }}><PinIcon /></span>
        {fullAddress}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5 }}>
        <PhoneIcon />
        <a href={`tel:${hospital.phone}`} style={{ color: "#1a56db", textDecoration: "none", fontWeight: 500 }}>
          {hospital.phone}
        </a>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {hospital.specialties.map((specialty) => (
          <span key={specialty} style={{ padding: "4px 10px", background: "#eff6ff", color: "#1d4ed8", borderRadius: 6, fontSize: 11.5, fontWeight: 500 }}>
            {specialty}
          </span>
        ))}
      </div>

      <button
        className="hospital-cta"
        style={{
          marginTop: "auto",
          width: "100%",
          padding: "11px",
          background: "#1a56db",
          color: "#fff",
          border: "none",
          borderRadius: 9,
          fontFamily: "'Sora',sans-serif",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          letterSpacing: ".02em",
          transition: "background .2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#1447c0")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#1a56db")}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(.98)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "")}
        onClick={() => router.push(`/Hospitals?hospitalId=${hospital.id}`)}
      >
        View Details
      </button>
    </div>
  );
}

export default function FindHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [only24, setOnly24] = useState(false);
  const [sort, setSort] = useState("Highest Rated");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const loadHospitals = async () => {
      try {
        const response = await fetch("/api/hospitals", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Failed to fetch hospitals");
        }

        setHospitals(payload.hospitals || []);
      } catch (fetchError) {
        console.error(fetchError);
        setError(fetchError instanceof Error ? fetchError.message : "Failed to fetch hospitals");
      } finally {
        setLoading(false);
      }
    };

    loadHospitals();
  }, []);

  const filtered = useMemo(() => {
    let list = hospitals.filter((hospital) => {
      const fullAddress = `${hospital.address} ${hospital.city} ${hospital.state}`.toLowerCase();

      if (nameQuery && !hospital.name.toLowerCase().includes(nameQuery.toLowerCase())) return false;
      if (cityQuery && !fullAddress.includes(cityQuery.toLowerCase())) return false;
      if (hospital.rating < minRating) return false;
      if (only24 && !hospital.isOpen24Hours) return false;
      return true;
    });

    if (sort === "Highest Rated") list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sort === "Name A-Z") list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [cityQuery, hospitals, minRating, nameQuery, only24, sort]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #f0f4f8; }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(14px); }
          to { opacity:1; transform:translateY(0); }
        }
        input::placeholder { color:#9ca3af; }
        input:focus { outline:none; }
        select:focus { outline:none; }
        .hospital-page-shell { min-height: 100vh; background: #f0f4f8; font-family: 'DM Sans', sans-serif; }
        .hospital-header { background: #fff; border-bottom: 1px solid #e5e7eb; padding: 0 32px; height: 64px; display: flex; align-items: center; gap: 12px; position: sticky; top: 0; z-index: 100; }
        .hospital-searchbar { background: #fff; border-bottom: 1px solid #e5e7eb; padding: 10px 32px; display: flex; gap: 10px; }
        .hospital-search-field { display: flex; align-items: center; gap: 8px; background: #f9fafb; border-radius: 9px; padding: 0 12px; min-height: 40px; min-width: 0; transition: border-color .2s, box-shadow .2s; }
        .hospital-search-field.search-main { flex: 1 1 auto; }
        .hospital-search-field.search-city { flex: 0 0 220px; }
        .hospital-page-body { display: grid; grid-template-columns: 240px 1fr; gap: 24px; padding: 24px 32px; max-width: 1280px; margin: 0 auto; }
        .hospital-sidebar { background: #fff; border-radius: 14px; padding: 22px; border: 1px solid #e5e7eb; height: fit-content; position: sticky; top: 88px; }
        .hospital-results-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 18px; }
        .hospital-filter-toggle { display: none; border: 1px solid #dbe3ee; background: #fff; color: #1f2937; border-radius: 10px; padding: 10px 14px; font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06); }
        .hospital-results-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
        @media (max-width: 1024px) {
          .hospital-page-body { grid-template-columns: 1fr; }
          .hospital-sidebar { position: static; }
          .hospital-results-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 768px) {
          .hospital-header { padding: 0 16px; min-height: 64px; height: auto; }
          .hospital-searchbar { padding: 10px 16px; flex-direction: column; gap: 8px; }
          .hospital-search-field { flex: none !important; width: 100%; }
          .hospital-page-body { padding: 20px 16px 28px; gap: 18px; }
          .hospital-sidebar { padding: 18px; display: none; }
          .hospital-sidebar.mobile-open { display: block; }
          .hospital-filter-toggle { display: inline-flex; align-items: center; justify-content: center; }
          .hospital-results-header { flex-direction: column; align-items: stretch; }
          .hospital-results-grid { grid-template-columns: 1fr; }
          .hospital-card { padding: 16px !important; }
          .hospital-card-header { flex-direction: column; gap: 10px; }
          .hospital-pill { margin-left: 0 !important; align-self: flex-start; }
          .hospital-cta { padding: 12px !important; }
        }
      `}</style>

      <div className="hospital-page-shell">
        <header className="hospital-header">
          <span style={{ fontSize: 26 }}></span>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 700, color: "#111827" }}>
            Find Hospitals
          </h1>
        </header>

        <div className="hospital-searchbar">
          {[
            { icon: <SearchIcon />, value: nameQuery, setter: setNameQuery, placeholder: "Search hospital...", fieldClass: "search-main" },
            { icon: <PinIcon />, value: cityQuery, setter: setCityQuery, placeholder: "City...", fieldClass: "search-city" },
          ].map(({ icon, value, setter, placeholder, fieldClass }, index) => (
            <div key={index} className={`hospital-search-field ${fieldClass}`} style={{ background: "#f9fafb", border: `1.5px solid ${value ? "#1a56db" : "#e5e7eb"}`, boxShadow: value ? "0 0 0 3px rgba(26,86,219,.1)" : "none" }}>
              <span style={{ color: "#9ca3af", flexShrink: 0 }}>{icon}</span>
              <input value={value} onChange={(event) => setter(event.target.value)} placeholder={placeholder} style={{ border: "none", background: "transparent", fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#111827", width: "100%", height: 38 }} />
            </div>
          ))}
        </div>

        <div className="hospital-page-body">
          <aside className={`hospital-sidebar ${isMobileFiltersOpen ? "mobile-open" : ""}`}>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 20, color: "#111827" }}>Filters</h2>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 10 }}>
                <StarIcon /> Minimum Rating
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[["4+ Stars", 4], ["3+ Stars", 3], ["2+ Stars", 2], ["Any Rating", 0]].map(([label, value]) => (
                  <label key={value} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "#374151", cursor: "pointer" }}>
                    <input type="radio" name="rating" checked={minRating === value} onChange={() => setMinRating(Number(value))} style={{ accentColor: "#1a56db", width: 15, height: 15, cursor: "pointer" }} />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: "#e5e7eb", marginBottom: 20 }} />

            <label style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "#374151", cursor: "pointer" }}>
              <input type="checkbox" checked={only24} onChange={(event) => setOnly24(event.target.checked)} style={{ accentColor: "#1a56db", width: 15, height: 15, cursor: "pointer" }} />
              <ClockIcon size={14} />
              Open 24 Hours
            </label>
          </aside>

          <main>
            <div className="hospital-results-header">
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 600, color: "#111827" }}>
                {loading ? "Loading..." : filtered.length} <span style={{ color: "#6b7280", fontWeight: 400, fontSize: 14 }}>hospitals found</span>
              </div>
              <button type="button" className="hospital-filter-toggle" onClick={() => setIsMobileFiltersOpen((prev) => !prev)}>
                {isMobileFiltersOpen ? "Hide Filters" : "Show Filters"}
              </button>
              <select value={sort} onChange={(event) => setSort(event.target.value)} style={{ padding: "8px 14px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#111827", background: "#fff", cursor: "pointer", width: "100%", maxWidth: 220 }}>
                <option>Highest Rated</option>
                <option>Name A-Z</option>
              </select>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af", fontSize: 15 }}>Loading hospitals...</div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#dc2626", fontSize: 15 }}>{error}</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af", fontSize: 15 }}>No hospitals match your filters.</div>
            ) : (
              <div className="hospital-results-grid">
                {filtered.map((hospital, index) => <HospitalCard key={hospital.id} hospital={hospital} index={index} />)}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
