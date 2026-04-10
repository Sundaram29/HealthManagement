"use client";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  ChevronDown,
  User,
  MapPin,
  Droplets,
  CalendarCheck,
  Brain,
  ArrowRight,
  Clock,
  CheckCircle2,
  Search,
  Sparkles,
  Activity,
} from "lucide-react";
import type { SessionPayload } from "../lib/auth";
import Footer from "./components/footer/page";
import { useRouter } from "next/navigation";


/* ─── tiny keyframe injector ─── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap');

  .slide-down {
    animation: slideDown 0.2s cubic-bezier(0.16,1,0.3,1) forwards;
  }
  @keyframes slideDown {
    from { opacity:0; transform:translateY(-6px) scale(0.98); }
    to   { opacity:1; transform:translateY(0)    scale(1);    }
  }

  .card-hover {
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(109,40,217,0.12);
  }

  .shimmer {
    background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0) 100%);
    background-size: 200% 100%;
    animation: shimmer 2.5s infinite;
  }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }

  .pulse-dot {
    animation: pulseDot 2s ease-in-out infinite;
  }
  @keyframes pulseDot {
    0%,100% { transform: scale(1);   opacity:1;   }
    50%      { transform: scale(1.4); opacity:0.7; }
  }

  .fade-up {
    animation: fadeUp 0.5s ease both;
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0);    }
  }
`;

/* ─── quick nav card data ─── */
const QUICK_CARDS = [
  {
    title: "Find Hospitals",
    subtitle: "Search nearby",
    icon: MapPin,
    img: "hospital.png",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
    route: "/HospitalList",
  },
  {
    title: "Blood Availability",
    subtitle: "Check stock",
    icon: Droplets,
    img: "blood.png",
    color: "from-rose-500 to-red-600",
    bg: "bg-rose-50",
    iconColor: "text-rose-600",
    route: "/BloodAvailable",
  },
  {
    title: "My Bookings",
    subtitle: "View history",
    icon: CalendarCheck,
    img: "appointment.jpg",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    route: "/MyAppointment",
  },
  {
    title: "AI Symptom Checker",
    subtitle: "Instant analysis",
    icon: Brain,
    img: "ai.jpg",
    color: "from-sky-500 to-blue-600",
    bg: "bg-sky-50",
    iconColor: "text-sky-600",
    route: null,
  },
];

const NEARBY = [
  { name: "Care Clinic", dist: "2.3 km", rating: "4.8", wait: "~10 min" },
  { name: "Green Valley Hospital", dist: "3.1 km", rating: "4.6", wait: "~20 min" },
  { name: "Metro Health Center", dist: "2.0 km", rating: "4.9", wait: "~5 min" },
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<SessionPayload | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileWrapperRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0, width: 192 });

  const updateMenuPosition = () => {
    if (!profileButtonRef.current) return;
    const rect = profileButtonRef.current.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 10,
      right: window.innerWidth - rect.right,
      width: 192,
    });
  };

  /* ── auth ── */
  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      const payload = await response.json().catch(() => ({ session: null }));

      if (!isMounted) return;

      const nextUser = payload?.session?.role === "user" ? payload.session : null;
      setUser(nextUser);
      setIsAuthReady(true);
    };
    void loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  /* ── outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedInsideMenu = profileMenuRef.current?.contains(target);
      const clickedInsideTrigger = profileWrapperRef.current?.contains(target);

      if (!clickedInsideMenu && !clickedInsideTrigger) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!isProfileOpen) return;

    updateMenuPosition();

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsProfileOpen(false);
    };

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isProfileOpen]);

  const resolveUser = async () => {
    if (user || isAuthReady) {
      return user;
    }

    const response = await fetch("/api/auth/session", { cache: "no-store" });
    const payload = await response.json().catch(() => ({ session: null }));
    const nextUser = payload?.session?.role === "user" ? payload.session : null;
    setUser(nextUser);
    setIsAuthReady(true);
    return nextUser;
  };

  const handleProfileClick = async () => {
    const currentUser = await resolveUser();

    if (!currentUser) {
      router.push("/auth/login");
      return;
    }

    setIsProfileOpen((p) => !p);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setIsProfileOpen(false);
    window.location.href = "/";
  };

  const handleMyBookings = () => {
    setIsProfileOpen(false);
    if (!user) {
      router.push("/auth/login?redirectTo=/MyAppointment");
      return;
    }
    router.push("/MyAppointment");
  };

  const handleProtectedRoute = async (route: string) => {
    const currentUser = await resolveUser();

    if (!currentUser) {
      router.push(`/auth/login?redirectTo=${encodeURIComponent(route)}`);
      return;
    }

    router.push(route);
  };

  return (
    <>
      <style>{STYLES}</style>

      <div style={{ fontFamily: "'Outfit', sans-serif" }} className="min-h-screen bg-[#f6f5ff]">

        {/* ════════════════ NAVBAR ════════════════ */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-violet-100 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow">
                <Activity size={16} className="text-white" />
              </div>
              <span style={{ fontFamily: "'Instrument Serif', serif" }} className="text-lg font-normal text-gray-900 hidden sm:block">
                MediCare<span className="text-violet-600">+</span>
              </span>
            </div>

            {/* Search */}
            <div
              className={`flex-1 max-w-lg mx-4 flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-200 bg-gray-50 ${
                searchFocused
                  ? "border-violet-400 ring-2 ring-violet-100 bg-white shadow-sm"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Search size={15} className={searchFocused ? "text-violet-500" : "text-gray-400"} />
              <input
                type="text"
                placeholder="Search hospitals, doctors, blood group…"
                className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onClick= {() => router.push('/HospitalList')}
              />
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Bell */}
              <button className="relative w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:border-violet-300 hover:bg-violet-50 transition cursor-pointer">
                <Bell size={16} className="text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 pulse-dot" />
              </button>

              {/* Profile — KEY FIX: overflow-visible on the wrapper */}
              <div ref={profileWrapperRef} className="relative overflow-visible" style={{ zIndex: 9999 }}>
                <button
                  ref={profileButtonRef}
                  type="button"
                  onClick={handleProfileClick}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 hover:border-violet-300 hover:bg-violet-50 transition cursor-pointer"
                  aria-label="Profile menu"
                  aria-expanded={isProfileOpen}
                  aria-haspopup="menu"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <User size={13} className="text-white" />
                  </div>
                  {user && (
                    <ChevronDown
                      size={14}
                      className={`text-gray-500 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
                    />
                  )}
                </button>

              </div>
            </div>
          </div>
        </nav>

        {user && isProfileOpen && typeof document !== "undefined" &&
          createPortal(
            <div
              ref={profileMenuRef}
              className="slide-down fixed rounded-2xl border border-gray-100 bg-white shadow-2xl overflow-hidden"
              style={{
                top: menuPosition.top,
                right: menuPosition.right,
                width: menuPosition.width,
                zIndex: 10000,
              }}
            >
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                <p className="text-sm text-gray-700 font-semibold truncate">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={handleMyBookings}
                className="flex items-center gap-2 w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 cursor-pointer transition-colors"
              >
                <CalendarCheck size={14} />
                My Bookings
              </button>
              <div className="mx-3 h-px bg-gray-100" />
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-3 text-left text-sm text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
              >
                <ArrowRight size={14} />
                Logout
              </button>
            </div>,
            document.body
          )}

        {/* ════════════════ CONTENT ════════════════ */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

          {/* ── Hero Banner ── */}
          <div
            className="relative rounded-3xl overflow-hidden p-8 md:p-10 fade-up"
            style={{
              background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 40%, #059669 100%)",
              boxShadow: "0 24px 60px rgba(109,40,217,0.3)",
            }}
          >
            {/* shimmer strip */}
            <div className="absolute inset-0 shimmer pointer-events-none" />

            {/* decorative blobs */}
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
            <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-emerald-400/20 blur-2xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-medium px-3 py-1 rounded-full mb-3">
                  <Sparkles size={11} />
                  Good morning
                </div>
                <h2 style={{ fontFamily: "'Instrument Serif', serif" }} className="text-3xl md:text-4xl text-white font-normal leading-tight">
                  Hello, {user?.name || "Guest"} 
                </h2>
                <p className="mt-2 text-white/75 text-sm max-w-md">
                  Find hospitals, check blood availability, and manage your health bookings — all in one place.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => router.push("/BloodAvailable")} className="group flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-rose-500/30 transition-all duration-200 cursor-pointer">
                  <Droplets size={15} />
                  Blood Availability
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => router.push("/HospitalList")}
                  className="group flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 px-5 py-2.5 rounded-xl text-sm font-medium backdrop-blur-sm transition-all duration-200 cursor-pointer"
                >
                  <CalendarCheck size={15} />
                  Book Appointment
                </button>
              </div>
            </div>
          </div>

          {/* ── Quick Access Grid ── */}
          <div className="fade-up" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-base font-semibold text-gray-800 mb-4">Quick Access</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {QUICK_CARDS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    onClick={() => item.route && (item.route === "/MyAppointment" ? handleProtectedRoute(item.route) : router.push(item.route))}
                    className={`card-hover bg-white rounded-2xl p-5 border border-gray-100 cursor-pointer group ${!item.route ? "opacity-90" : ""}`}
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon size={20} className={item.iconColor} />
                    </div>
                    <p className="font-semibold text-gray-800 text-sm leading-tight">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.subtitle}</p>
                    <div className={`mt-3 inline-flex items-center gap-1 text-xs font-medium bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                      Open <ArrowRight size={11} className={item.iconColor} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div className="grid grid-cols-3 gap-4 fade-up" style={{ animationDelay: "0.15s" }}>
            {[
              { label: "Hospitals Nearby", value: "24+", color: "text-violet-600", bg: "bg-violet-50" },
              { label: "Blood Units Available", value: "580+", color: "text-rose-600", bg: "bg-rose-50" },
              { label: "Doctors Online", value: "12", color: "text-emerald-600", bg: "bg-emerald-50" },
            ].map((s, i) => (
              <div key={i} className={`${s.bg} rounded-2xl p-4 text-center border border-white`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── Two-col: Appointments + AI ── */}
          <div className="grid md:grid-cols-5 gap-4 fade-up" style={{ animationDelay: "0.2s" }}>

            {/* Upcoming Appointments */}
            <div className="md:col-span-3 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-gray-800">Upcoming Appointments</h3>
                <button
                  onClick={() => handleProtectedRoute("/MyAppointment")}
                  className="text-xs text-violet-600 hover:text-violet-800 font-medium flex items-center gap-1 transition"
                >
                  View all <ArrowRight size={12} />
                </button>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-violet-50/60 border border-violet-100">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow">
                  <CalendarCheck size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-gray-800 text-sm">City Hospital</p>
                    <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium">
                      <CheckCircle2 size={11} /> Confirmed
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Dr. Mehta — General Consultation</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Clock size={11} />
                    Apr 20, 2025 · 10:00 AM
                  </div>
                </div>
              </div>

              <button className="mt-4 w-full py-2.5 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-100 transition cursor-pointer">
                Cancel Appointment
              </button>
            </div>

            {/* AI Checker */}
            <div
              className="md:col-span-2 rounded-2xl p-6 flex flex-col justify-between"
              style={{
                background: "linear-gradient(145deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)",
                boxShadow: "0 12px 32px rgba(49,46,129,0.35)",
              }}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                  <Brain size={20} className="text-white" />
                </div>
                <p style={{ fontFamily: "'Instrument Serif', serif" }} className="text-xl text-white font-normal leading-tight">
                  Not feeling well?
                </p>
                <p className="text-white/60 text-sm mt-2">
                  Check your symptoms instantly with our AI-powered health assistant.
                </p>
              </div>
              <button className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white text-indigo-700 text-sm font-semibold hover:bg-indigo-50 transition cursor-pointer">
                <Sparkles size={14} />
                Start AI Check
              </button>
            </div>
          </div>

          {/* ── Nearby Hospitals ── */}
          <div className="fade-up" style={{ animationDelay: "0.25s" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Nearby Hospitals</h3>
              <button
                onClick={() => router.push("/HospitalList")}
                className="text-xs text-violet-600 hover:text-violet-800 font-medium flex items-center gap-1 transition"
              >
                See all <ArrowRight size={12} />
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {NEARBY.map((h, i) => (
                <div
                  key={i}
                  className="card-hover bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{h.name}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                        <MapPin size={11} /> {h.dist}
                      </div>
                    </div>
                    <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-lg border border-amber-100">
                      ★ {h.rating}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
                    <Clock size={11} className="text-emerald-500" />
                    Wait time: <span className="text-emerald-600 font-medium ml-0.5">{h.wait}</span>
                  </div>
                  <button
                    onClick={() => router.push("/HospitalList")}
                    className="mt-4 w-full py-2 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-xl transition cursor-pointer border border-violet-100"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>

        </main>

        <Footer />
      </div>
    </>
  );
}
