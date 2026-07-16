"use client";
import React, { useState, useCallback } from "react";
import Footer from "../components/footer/page";
import { STATES, getDistrictsForState } from "../../lib/locations";
// ─── Data ──────────────────────────────────────────────────────────────────────



const BLOOD_COMPONENTS = [
  "All Components",
  "Packed Red Blood Cells",
  "Whole Blood",
  "Fresh Frozen Plasma",
  "Platelets",
  "Cryoprecipitate",
];

const BLOOD_TYPES = ["All", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

type ToastMessage = {
  id: number;
  title: string;
  msg: string;
  type: "error" | "success";
};

type SearchRow = {
  hospitalId: number;
  hospitalName: string;
  centreType: string;
  state: string;
  district: string;
  city: string;
  address: string;
  contact: string;
  bloodType: string;
  available: boolean;
  units: number;
  component: string;
  lastUpdated: string;
};

type AvailabilityApiCentre = {
  id: number;
  name: string;
  type: "HOSPITAL" | "STANDALONE_BLOOD_BANK";
  state: string;
  district: string;
  city: string;
  address: string;
  contact: string;
  unitsAvailable: number;
  lastUpdated: string | null;
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --crimson: #8B0000;
    --crimson-light: #b91c1c;
    --crimson-pale: #fff1f1;
    --crimson-mid: #fecaca;
    --slate: #0f172a;
    --slate-mid: #334155;
    --muted: #64748b;
    --border: #e2e8f0;
    --surface: #ffffff;
    --bg: #f8f9fc;
    --green: #065f46;
    --green-bg: #d1fae5;
    --radius: 14px;
    --shadow: 0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.06);
    --shadow-lg: 0 8px 32px rgba(139,0,0,.10);
  }

  body { font-family: 'Sora', sans-serif; background: var(--bg); color: var(--slate); }

  .page { min-height: 100vh; display: flex; flex-direction: column; }

  /* ── Header ── */
  .header {
    background: var(--crimson);
    padding: 0 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    height: 64px;
    position: sticky;
    top: 0;
    z-index: 40;
  }
  .header-drop {
    width: 32px; height: 38px;
    background: rgba(255,255,255,0.18);
    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
    display: flex; align-items: center; justify-content: center;
  }
  .header-drop svg { fill: white; opacity: 0.9; }
  .header-title { font-family: 'Lora', serif; font-size: 1.35rem; color: white; letter-spacing: 0.01em; }
  .header-subtitle { font-size: 0.7rem; color: rgba(255,255,255,0.6); letter-spacing: 0.08em; text-transform: uppercase; }
  .header-pill {
    margin-left: auto;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    color: white;
    font-size: 0.7rem;
    padding: 4px 12px;
    border-radius: 99px;
    font-weight: 500;
    letter-spacing: 0.05em;
  }

  /* ── Filter Panel ── */
  .filter-panel {
    background: white;
    border-bottom: 1px solid var(--border);
    padding: 1.25rem 2rem;
    position: sticky;
    top: 64px;
    z-index: 30;
  }
  .filter-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: flex-end;
  }
  .filter-field { display: flex; flex-direction: column; gap: 5px; }
  .filter-label {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
    font-weight: 600;
  }
  .filter-input, .filter-select {
    height: 40px;
    border: 1.5px solid var(--border);
    border-radius: 8px;
    padding: 0 12px;
    font-size: 0.82rem;
    font-family: 'Sora', sans-serif;
    color: var(--slate);
    background: var(--bg);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    min-width: 140px;
  }
  .filter-input:focus, .filter-select:focus {
    border-color: var(--crimson-light);
    box-shadow: 0 0 0 3px rgba(185,28,28,0.1);
    background: white;
  }
  .filter-input::placeholder { color: #94a3b8; }
  .filter-select:disabled { opacity: 0.45; cursor: not-allowed; }

  .blood-type-bar {
    display: flex; gap: 6px; flex-wrap: wrap; margin-top: 12px;
  }
  .bt-chip {
    height: 34px; min-width: 52px;
    border: 1.5px solid var(--border);
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--muted);
    background: var(--bg);
    cursor: pointer;
    transition: all 0.18s;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Sora', sans-serif;
  }
  .bt-chip:hover { border-color: var(--crimson-light); color: var(--crimson); }
  .bt-chip.active {
    background: var(--crimson);
    border-color: var(--crimson);
    color: white;
  }

  .search-btn {
    height: 40px; padding: 0 24px;
    background: var(--crimson);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.82rem;
    font-weight: 600;
    font-family: 'Sora', sans-serif;
    cursor: pointer;
    display: flex; align-items: center; gap: 8px;
    letter-spacing: 0.03em;
    transition: background 0.2s, transform 0.1s;
  }
  .search-btn:hover { background: var(--crimson-light); }
  .search-btn:active { transform: scale(0.97); }

  /* ── Body ── */
  .body { flex: 1; padding: 1.75rem 2rem; }

  .stats-row { display: flex; gap: 14px; margin-bottom: 1.75rem; flex-wrap: wrap; }
  .stat-card {
    background: white;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 14px 20px;
    display: flex; align-items: center; gap: 14px;
    min-width: 170px;
    animation: fadeUp 0.4s ease both;
  }
  .stat-icon {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .stat-icon.red { background: var(--crimson-pale); }
  .stat-icon.green { background: var(--green-bg); }
  .stat-icon.blue { background: #eff6ff; }
  .stat-label { font-size: 0.68rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 2px; }
  .stat-value { font-size: 1.4rem; font-weight: 700; color: var(--slate); }

  /* ── Table area ── */
  .table-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 12px;
  }
  .table-title { font-size: 0.9rem; font-weight: 600; color: var(--slate-mid); display: flex; align-items: center; gap: 8px; }
  .result-badge {
    font-size: 0.68rem;
    background: var(--crimson-pale);
    color: var(--crimson);
    border: 1px solid var(--crimson-mid);
    padding: 2px 10px; border-radius: 99px; font-weight: 600;
  }
  .search-box {
    display: flex; align-items: center; gap: 8px;
    border: 1.5px solid var(--border);
    border-radius: 8px; padding: 0 12px;
    background: white; height: 36px; width: 220px;
  }
  .search-box input {
    border: none; outline: none; font-size: 0.8rem;
    font-family: 'Sora', sans-serif; color: var(--slate);
    background: transparent; width: 100%;
  }

  .table-wrap {
    background: white;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: var(--shadow);
  }
  .mobile-list {
    display: none;
  }
  table { width: 100%; border-collapse: collapse; }
  thead tr { background: #f8fafc; border-bottom: 1.5px solid var(--border); }
  th {
    padding: 12px 16px;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
    font-weight: 600;
    text-align: left;
  }
  tbody tr {
    border-bottom: 1px solid #f1f5f9;
    transition: background 0.15s;
    animation: fadeUp 0.3s ease both;
  }
  tbody tr:hover { background: #fafbfd; }
  tbody tr:last-child { border-bottom: none; }
  td { padding: 14px 16px; font-size: 0.82rem; color: var(--slate-mid); vertical-align: middle; }

  .hospital-name { font-weight: 600; color: var(--slate); font-size: 0.85rem; }
  .hospital-meta { font-size: 0.72rem; color: var(--muted); margin-top: 2px; }

  .bt-badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 42px; height: 42px; border-radius: 10px;
    background: var(--crimson-pale);
    color: var(--crimson);
    font-weight: 700; font-size: 0.8rem;
    border: 1.5px solid var(--crimson-mid);
  }

  .avail-pill {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.75rem; font-weight: 600;
    padding: 5px 12px; border-radius: 99px;
  }
  .avail-pill.yes { background: var(--green-bg); color: var(--green); }
  .avail-pill.no { background: var(--crimson-pale); color: var(--crimson); }
  .avail-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

  .comp-tag {
    font-size: 0.7rem; color: var(--slate-mid);
    background: #f1f5f9; border-radius: 6px;
    padding: 3px 8px; display: inline-block;
  }

  .contact-btn {
    font-size: 0.72rem; font-weight: 600; font-family: 'Sora', sans-serif;
    padding: 6px 14px; border-radius: 7px;
    background: transparent;
    border: 1.5px solid var(--border);
    color: var(--slate-mid);
    cursor: pointer;
    transition: all 0.18s;
  }
  .contact-btn:hover { border-color: var(--crimson); color: var(--crimson); background: var(--crimson-pale); }

  /* ── Empty state ── */
  .empty-state {
    padding: 5rem 2rem;
    text-align: center;
    color: var(--muted);
  }
  .empty-icon {
    width: 72px; height: 72px; margin: 0 auto 1rem;
    background: var(--bg);
    border: 1.5px dashed var(--border);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 30px;
  }
  .empty-title { font-size: 0.95rem; font-weight: 600; color: var(--slate-mid); margin-bottom: 4px; }
  .empty-sub { font-size: 0.8rem; }

  /* ── Pagination ── */
  .pagination {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 1.25rem; flex-wrap: wrap; gap: 10px;
  }
  .page-info { font-size: 0.78rem; color: var(--muted); }
  .page-controls { display: flex; align-items: center; gap: 8px; }
  .page-btn {
    width: 32px; height: 32px; border-radius: 8px;
    border: 1.5px solid var(--border);
    background: white; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.9rem; color: var(--muted);
    transition: all 0.15s;
  }
  .page-btn:hover:not(:disabled) { border-color: var(--crimson); color: var(--crimson); }
  .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .page-btn.active { background: var(--crimson); border-color: var(--crimson); color: white; }
  .page-size-select {
    height: 32px; border: 1.5px solid var(--border); border-radius: 8px;
    padding: 0 10px; font-size: 0.78rem; font-family: 'Sora', sans-serif;
    color: var(--muted); background: white; cursor: pointer; outline: none;
  }

  @media (max-width: 900px) {
    .filter-panel { padding: 1rem 1rem 1.1rem; }
    .body { padding: 1rem; }
    .table-header { flex-direction: column; align-items: stretch; gap: 10px; }
    .search-box { width: 100%; }
  }

  @media (max-width: 768px) {
    .header { padding: 0 1rem; min-height: 72px; gap: 0.75rem; }
    .header-title { font-size: 1.1rem; }
    .header-subtitle { font-size: 0.65rem; }
    .header-pill { display: none; }
    .filter-panel { padding: 1rem; position: static; }
    .filter-grid { flex-direction: column; align-items: stretch; }
    .filter-field { width: 100%; }
    .filter-input, .filter-select, .search-btn { width: 100%; min-width: 0; }
    .search-btn { justify-content: center; margin-left: 0; }
    .blood-type-bar { margin-top: 0.75rem; gap: 8px; }
    .bt-chip { flex: 1 1 calc(50% - 6px); min-width: 0; }
    .body { padding: 0.9rem; }
    .stats-row { flex-direction: column; }
    .stat-card { min-width: 0; }
    .table-wrap { display: none; }
    .mobile-list { display: flex; flex-direction: column; gap: 12px; }
    .mobile-card {
      background: white;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px;
      box-shadow: var(--shadow);
    }
    .mobile-card-header { display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; margin-bottom: 8px; }
    .mobile-card-title { font-weight: 700; color: var(--slate); font-size: 0.92rem; }
    .mobile-card-sub { font-size: 0.76rem; color: var(--muted); margin-top: 3px; }
    .mobile-card-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    .mobile-card-label { font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.07em; color: var(--muted); margin-bottom: 4px; }
    .mobile-card-value { font-size: 0.8rem; color: var(--slate); font-weight: 600; }
    .mobile-card-actions { display: flex; justify-content: flex-end; margin-top: 10px; }
    .mobile-card-actions .contact-btn { width: 100%; }
  }

  @media (max-width: 480px) {
    .header { padding: 0 0.85rem; }
    .body { padding: 0.85rem; }
    .filter-panel { padding: 0.85rem; }
    .mobile-card-grid { grid-template-columns: 1fr; }
    .pagination { flex-direction: column; align-items: flex-start; }
    .page-controls { width: 100%; justify-content: space-between; flex-wrap: wrap; }
  }

  /* ── Toast ── */
  .toast-container {
    position: fixed; top: 80px; right: 24px; z-index: 999;
    display: flex; flex-direction: column; gap: 10px;
    pointer-events: none;
  }
  .toast {
    pointer-events: all;
    min-width: 280px; max-width: 360px;
    padding: 14px 16px;
    border-radius: 12px;
    display: flex; align-items: flex-start; gap: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease;
    font-size: 0.82rem;
    line-height: 1.45;
  }
  .toast.error { background: #fff; border-left: 4px solid var(--crimson); }
  .toast.success { background: #fff; border-left: 4px solid #059669; }
  .toast-icon { width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; margin-top: 1px; }
  .toast-icon.error { background: var(--crimson-pale); color: var(--crimson); }
  .toast-icon.success { background: var(--green-bg); color: var(--green); }
  .toast-body { flex: 1; }
  .toast-title { font-weight: 600; color: var(--slate); margin-bottom: 2px; }
  .toast-msg { color: var(--muted); }
  .toast-close { color: #94a3b8; cursor: pointer; font-size: 14px; padding: 0 2px; flex-shrink: 0; }
  .toast-close:hover { color: var(--slate); }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

// ─── Toast ─────────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const add = useCallback((title: string, msg: string, type: ToastMessage["type"] = "error") => {
    const id = Date.now();
    setToasts(p => [...p, { id, title, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);
  const remove = useCallback((id: number) => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toasts, add, remove };
}

function Toasts({ toasts, remove }: { toasts: ToastMessage[]; remove: (id: number) => void }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <div className={`toast-icon ${t.type}`}>{t.type === "error" ? "!" : "✓"}</div>
          <div className="toast-body">
            <div className="toast-title">{t.title}</div>
            <div className="toast-msg">{t.msg}</div>
          </div>
          <span className="toast-close" onClick={() => remove(t.id)}>✕</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function BloodAvailability() {
  const { toasts, add: addToast, remove: removeToast } = useToast();

  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [hospitalSearch, setHospitalSearch] = useState("");
  const [selectedBlood, setSelectedBlood] = useState("All");
  const [selectedComponent, setSelectedComponent] = useState("All Components");
  const [tableSearch, setTableSearch] = useState("");
  const [rows, setRows] = useState<SearchRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [loadingResults, setLoadingResults] = useState(false);

  const states = STATES;
  const districts = getDistrictsForState(selectedState);

  const handleSearch = useCallback(async () => {
    if (!selectedState && selectedBlood === "All") {
      addToast("Missing filters", "Please select a State and Blood Group to search.", "error");
      return;
    }
    if (!selectedState) {
      addToast("State required", "Please select a State to continue.", "error");
      return;
    }
    if (selectedBlood === "All") {
      addToast("Blood Group required", "Please select a specific Blood Group.", "error");
      return;
    }

    setLoadingResults(true);

    try {
      const params = new URLSearchParams({
        state: selectedState,
        bloodGroup: selectedBlood,
      });
      if (selectedDistrict) params.set("district", selectedDistrict);
      if (selectedComponent !== "All Components") params.set("component", selectedComponent);

      const response = await fetch(`/api/blood-availability?${params.toString()}`, { cache: "no-store" });
      const payload = await response.json().catch(() => ({ error: "Unable to parse server response." }));

      if (!response.ok) {
        throw new Error(payload?.error || "Blood availability data could not be fetched.");
      }

      const result: SearchRow[] = ((payload.results ?? []) as AvailabilityApiCentre[])
        .filter((centre) =>
          hospitalSearch
            ? String(centre.name ?? "").toLowerCase().includes(hospitalSearch.toLowerCase())
            : true,
        )
        .map((centre) => ({
          hospitalId: centre.id,
          hospitalName: centre.name,
          centreType: centre.type === "HOSPITAL" ? "Hospital" : "Standalone Blood Bank",
          state: centre.state,
          district: centre.district,
          city: centre.city,
          address: centre.address,
          contact: centre.contact,
          bloodType: selectedBlood,
          available: Number(centre.unitsAvailable) > 0,
          units: Number(centre.unitsAvailable) || 0,
          component: selectedComponent === "All Components" ? "All components" : selectedComponent,
          lastUpdated: centre.lastUpdated ? new Date(centre.lastUpdated).toLocaleString() : "Just now",
        }));

      setRows(result);
      setSearched(true);
      setCurrentPage(1);

      if (result.length === 0) {
        addToast("No results", `No blood centres found for ${selectedBlood} in ${selectedState}.`, "error");
      } else {
        addToast("Results found", `${result.length} blood centre record${result.length > 1 ? "s" : ""} found.`, "success");
      }
    } catch (error) {
      console.error("Blood availability search failed:", error);
      addToast("Unable to search", error instanceof Error ? error.message : "Blood availability data could not be fetched.", "error");
    } finally {
      setLoadingResults(false);
    }
  }, [selectedState, selectedDistrict, hospitalSearch, selectedBlood, selectedComponent, addToast]);

  const filteredRows = tableSearch
    ? rows.filter((r) =>
        r.hospitalName.toLowerCase().includes(tableSearch.toLowerCase()) ||
        r.bloodType.toLowerCase().includes(tableSearch.toLowerCase())
      )
    : rows;

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paged = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const availCount = rows.filter((r) => r.available).length;
  const totalUnits = rows.reduce((s, r) => s + r.units, 0);

  return (
    <>
      <style>{STYLES}</style>
      <Toasts toasts={toasts} remove={removeToast} />

      <div className="page">
        {/* ── Header ── */}
        <header className="header">
          <div className="header-drop">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M12 2C12 2 4 10.5 4 15a8 8 0 0016 0C20 10.5 12 2 12 2z"/>
            </svg>
          </div>
          <div>
            <div className="header-title">Blood Availability</div>
            <div className="header-subtitle">National Blood Bank Portal</div>
          </div>
          <div className="header-pill">Live Data · Updated Today</div>
        </header>

        {/* ── Filter Panel ── */}
        <div className="filter-panel">
          <div className="filter-grid">
            {/* State */}
            <div className="filter-field">
              <label className="filter-label">State</label>
              <select className="filter-select" value={selectedState}
                onChange={e => { setSelectedState(e.target.value); setSelectedDistrict(""); setRows([]); setSearched(false); }}>
                <option value="">Select State</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {/* District */}
            <div className="filter-field">
              <label className="filter-label">District</label>
              <select className="filter-select" value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
                disabled={!selectedState}>
                <option value="">{selectedState ? "All Districts" : "Select State First"}</option>
                {districts.map((d, i) => <option key={i}>{d}</option>)}
              </select>
            </div>

            {/* Hospital */}
            <div className="filter-field">
              <label className="filter-label">Blood Center</label>
              <input className="filter-input" type="text" placeholder="Search hospital name..."
                value={hospitalSearch} onChange={e => setHospitalSearch(e.target.value)}
                disabled={!selectedState} style={{ minWidth: 190 }} />
            </div>

            {/* Component */}
            <div className="filter-field">
              <label className="filter-label">Blood Component</label>
              <select className="filter-select" value={selectedComponent}
                onChange={e => setSelectedComponent(e.target.value)} style={{ minWidth: 190 }}>
                {BLOOD_COMPONENTS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Search */}
            <button className="search-btn" onClick={handleSearch} disabled={loadingResults} style={{ marginLeft: "auto", opacity: loadingResults ? 0.7 : 1 }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              {loadingResults ? "Searching..." : "Search"}
            </button>
          </div>

          {/* Blood type chips */}
          <div className="blood-type-bar">
            {BLOOD_TYPES.map(bt => (
              <button key={bt} className={`bt-chip ${selectedBlood === bt ? "active" : ""}`}
                onClick={() => setSelectedBlood(bt)}>
                {bt}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="body">
          {/* Stats row */}
          {searched && rows.length > 0 && (
            <div className="stats-row">
              <div className="stat-card" style={{ animationDelay: "0ms" }}>
                <div className="stat-icon red">🏥</div>
                <div>
                  <div className="stat-label">Blood Banks</div>
                  <div className="stat-value">{[...new Set(rows.map(r => r.hospitalId))].length}</div>
                </div>
              </div>
              <div className="stat-card" style={{ animationDelay: "60ms" }}>
                <div className="stat-icon green">✅</div>
                <div>
                  <div className="stat-label">Available</div>
                  <div className="stat-value">{availCount}</div>
                </div>
              </div>
              <div className="stat-card" style={{ animationDelay: "120ms" }}>
                <div className="stat-icon blue">🩸</div>
                <div>
                  <div className="stat-label">Total Units</div>
                  <div className="stat-value">{totalUnits}</div>
                </div>
              </div>
            </div>
          )}

          {/* Table header */}
          <div className="table-header">
            <div className="table-title">
              Results
              {searched && <span className="result-badge">{filteredRows.length} record{filteredRows.length !== 1 ? "s" : ""}</span>}
            </div>
            <div className="search-box">
              <svg width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input placeholder="Filter results..." value={tableSearch}
                onChange={e => { setTableSearch(e.target.value); setCurrentPage(1); }} />
            </div>
          </div>

          {/* Table */}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Blood Center</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Blood Type</th>
                  <th>Availability</th>
                  <th>Component</th>
                  <th>Last Updated</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paged.length > 0 ? paged.map((row, i) => (
                  <tr key={`${row.hospitalId}-${row.bloodType}-${i}`} style={{ animationDelay: `${i * 40}ms` }}>
                    <td style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                      {(currentPage - 1) * pageSize + i + 1}
                    </td>
                    <td>
                      <div className="hospital-name">{row.hospitalName}</div>
                      <div className="hospital-meta">Contact: {row.contact}</div>
                    </td>
                    <td><span className="comp-tag">{row.centreType}</span></td>
                    <td>
                      <div className="hospital-meta">{row.address}</div>
                      <div className="hospital-meta">{row.city}, {row.district}, {row.state}</div>
                    </td>
                    <td><div className="bt-badge">{row.bloodType}</div></td>
                    <td>
                      <div className={`avail-pill ${row.available ? "yes" : "no"}`}>
                        <span className="avail-dot" />
                        {row.available ? `${row.units} Units` : "Unavailable"}
                      </div>
                    </td>
                    <td><span className="comp-tag">{row.component}</span></td>
                    <td style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{row.lastUpdated}</td>
                    <td>
                      <button className="contact-btn"
                        onClick={() => addToast("Contacting hospital", `Calling ${row.hospitalName}...`, "success")}>
                        Contact
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={9}>
                      <div className="empty-state">
                        <div className="empty-icon">🩸</div>
                        <div className="empty-title">
                          {!searched ? "Search to find blood availability" : "No records found"}
                        </div>
                        <div className="empty-sub">
                          {!searched
                            ? "Select state and blood group, then click Search"
                            : "Try adjusting your filters"}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mobile-list">
            {paged.length > 0 ? paged.map((row, i) => (
              <div key={`mobile-${row.hospitalId}-${row.bloodType}-${i}`} className="mobile-card">
                <div className="mobile-card-header">
                  <div>
                    <div className="mobile-card-title">{row.hospitalName}</div>
                    <div className="mobile-card-sub">{row.centreType}</div>
                  </div>
                  <div className="bt-badge">{row.bloodType}</div>
                </div>
                <div className="mobile-card-grid">
                  <div>
                    <div className="mobile-card-label">Availability</div>
                    <div className={`avail-pill ${row.available ? "yes" : "no"}`}>
                      <span className="avail-dot" />
                      {row.available ? `${row.units} Units` : "Unavailable"}
                    </div>
                  </div>
                  <div>
                    <div className="mobile-card-label">Component</div>
                    <div className="mobile-card-value">{row.component}</div>
                  </div>
                  <div>
                    <div className="mobile-card-label">Location</div>
                    <div className="mobile-card-value">{row.city}, {row.district}</div>
                  </div>
                  <div>
                    <div className="mobile-card-label">Updated</div>
                    <div className="mobile-card-value">{row.lastUpdated}</div>
                  </div>
                </div>
                <div className="mobile-card-actions">
                  <button className="contact-btn"
                    onClick={() => addToast("Contacting hospital", `Calling ${row.hospitalName}...`, "success")}>
                    Contact
                  </button>
                </div>
              </div>
            )) : (
              <div className="empty-state">
                <div className="empty-icon">🩸</div>
                <div className="empty-title">
                  {!searched ? "Search to find blood availability" : "No records found"}
                </div>
                <div className="empty-sub">
                  {!searched
                    ? "Select state and blood group, then click Search"
                    : "Try adjusting your filters"}
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredRows.length > 0 && (
            <div className="pagination">
              <div className="page-info">
                Showing {Math.min((currentPage - 1) * pageSize + 1, filteredRows.length)}–{Math.min(currentPage * pageSize, filteredRows.length)} of {filteredRows.length}
              </div>
              <div className="page-controls">
                <button className="page-btn" disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`page-btn ${p === currentPage ? "active" : ""}`}
                    onClick={() => setCurrentPage(p)}>{p}</button>
                ))}
                <button className="page-btn" disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}>›</button>
                <select className="page-size-select" value={pageSize}
                  onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}>
                  {[5, 10, 20].map(s => <option key={s} value={s}>{s} / page</option>)}
                </select>
              </div>
            </div>
          )}
          
        </div>
        
      </div>
      <Footer/>
    </>
  );
}
