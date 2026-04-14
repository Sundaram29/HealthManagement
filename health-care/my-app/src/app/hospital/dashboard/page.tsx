"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BLOOD_COMPONENTS, BLOOD_TYPES } from "../../../lib/blood";

type SessionPayload = {
  name: string;
  email: string;
};

type HospitalRecord = {
  id: number;
  name: string;
  email: string;
  city?: string | null;
  state?: string | null;
  address?: string | null;
  pincode?: string | null;
  phone?: string | null;
  website?: string | null;
  description?: string | null;
  specialties: string[];
  isOpen24Hours: boolean;
  profileCompleted: boolean;
};

type DoctorRecord = {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  qualification: string;
  available: string;
};

type AppointmentRecord = {
  id: number;
  name: string;
  phone: string;
  problem: string;
  status: string;
  appointmentDate: string;
  appointmentTime: string;
  doctor: {
    name: string;
  };
  user?: {
    email?: string | null;
  } | null;
};

type BloodInventoryRecord = {
  id: number;
  type: string;
  component: string;
  units: number;
  available: boolean;
};

type BloodBankRecord = {
  id: number;
  hospitalName: string;
  district: string;
  state: string;
  address: string;
  contact: string;
  bloodGroups: BloodInventoryRecord[];
};

type BloodRequestRecord = {
  id: number;
  patientName?: string | null;
  bloodType: string;
  component: string;
  requestedUnits: number;
  requesterPhone?: string | null;
  message?: string | null;
  status: string;
  createdAt: string;
  bloodBank: {
    hospitalName: string;
  };
};

type HospitalPortalPayload = {
  session: SessionPayload;
  hospital: HospitalRecord;
  doctors: DoctorRecord[];
  appointments: AppointmentRecord[];
  bloodBanks: BloodBankRecord[];
  requests: BloodRequestRecord[];
  stats: {
    doctors: number;
    appointments: number;
    pendingAppointments: number;
    bloodRequests: number;
  };
};

type RequestForm = {
  bloodBankId: string;
  bloodType: string;
  component: string;
  requestedUnits: string;
  patientName: string;
  requesterPhone: string;
  message: string;
};

const statusClasses: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-sky-100 text-sky-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-700",
  approved: "bg-sky-100 text-sky-800",
  rejected: "bg-rose-100 text-rose-700",
};

const emptyProfile = {
  city: "",
  state: "",
  address: "",
  pincode: "",
  phone: "",
  website: "",
  description: "",
  specialtiesText: "",
  isOpen24Hours: false,
};

const emptyRequest: RequestForm = {
  bloodBankId: "",
  bloodType: BLOOD_TYPES[0],
  component: BLOOD_COMPONENTS[0],
  requestedUnits: "1",
  patientName: "",
  requesterPhone: "",
  message: "",
};

export default function HospitalDashboardPage() {
  const router = useRouter();
  const [portal, setPortal] = useState<HospitalPortalPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [profileForm, setProfileForm] = useState(emptyProfile);
  const [requestForm, setRequestForm] = useState<RequestForm>(emptyRequest);

  useEffect(() => {
    const loadPortal = async () => {
      try {
        const response = await fetch("/api/portal/hospital", {
          cache: "no-store",
          credentials: "include",
        });

        if (response.status === 401) {
          router.replace("/hospital/login");
          return;
        }

        const payload = await response.json().catch(() => ({ error: "Unable to load hospital portal." }));

        if (!response.ok) {
          throw new Error(payload?.error || "Unable to load hospital portal.");
        }

        setPortal(payload);
        setProfileForm({
          city: payload.hospital.city ?? "",
          state: payload.hospital.state ?? "",
          address: payload.hospital.address ?? "",
          pincode: payload.hospital.pincode ?? "",
          phone: payload.hospital.phone ?? "",
          website: payload.hospital.website ?? "",
          description: payload.hospital.description ?? "",
          specialtiesText: payload.hospital.specialties.join(", "),
          isOpen24Hours: Boolean(payload.hospital.isOpen24Hours),
        });
        setRequestForm((current) => ({
          ...current,
          requesterPhone: payload.hospital.phone ?? "",
        }));
      } catch (error) {
        console.error(error);
        setMessage(error instanceof Error ? error.message : "Unable to load hospital portal.");
      } finally {
        setLoading(false);
      }
    };

    void loadPortal();
  }, [router]);

  const handleProfileSave = async () => {
    setSavingProfile(true);
    setMessage("");

    try {
      const response = await fetch("/api/portal/hospital", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...profileForm,
          specialties: profileForm.specialtiesText,
        }),
      });
      const payload = await response.json().catch(() => ({ error: "Unable to save profile." }));

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to save profile.");
      }

      setPortal((current) =>
        current
          ? {
              ...current,
              hospital: payload.hospital,
            }
          : current,
      );
      setMessage("Hospital profile updated.");
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Unable to save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRequestSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittingRequest(true);
    setMessage("");

    try {
      const response = await fetch("/api/portal/hospital", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...requestForm,
          requestedUnits: Number(requestForm.requestedUnits),
        }),
      });
      const payload = await response.json().catch(() => ({ error: "Unable to create request." }));

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to create request.");
      }

      setPortal((current) =>
        current
          ? {
              ...current,
              requests: [payload.request, ...current.requests],
              stats: {
                ...current.stats,
                bloodRequests: current.stats.bloodRequests + 1,
              },
            }
          : current,
      );
      setRequestForm((current) => ({
        ...emptyRequest,
        requesterPhone: current.requesterPhone,
      }));
      setMessage("Blood request sent to the selected blood bank.");
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Unable to create request.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-6xl rounded-[32px] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-600">Hospital Portal</p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">Loading your workspace...</h1>
        </div>
      </main>
    );
  }

  if (!portal) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-[32px] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-600">Hospital Portal</p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">Hospital data is unavailable.</h1>
          <p className="mt-3 text-slate-600">{message || "Please sign in again."}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#f8fafc_35%,#ffffff_100%)] px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[32px] bg-[linear-gradient(135deg,#082f49_0%,#0f766e_42%,#0ea5e9_100%)] px-8 py-8 text-white shadow-2xl shadow-sky-100">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-100">Unified Hospital Workspace</p>
              <h1 className="mt-3 text-3xl font-semibold">{portal.hospital.name}</h1>
              <p className="mt-3 max-w-3xl text-sm text-sky-50/90">
                Manage your public profile, keep appointments visible, and coordinate blood-bank requests from the same merged healthcare app.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/HospitalList"
                className="rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                View public listing
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
                  router.push("/hospital/login");
                }}
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-sky-900 transition hover:bg-sky-50"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-sky-100">Doctors</p>
              <p className="mt-2 text-2xl font-semibold">{portal.stats.doctors}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-sky-100">Appointments</p>
              <p className="mt-2 text-2xl font-semibold">{portal.stats.appointments}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-sky-100">Pending</p>
              <p className="mt-2 text-2xl font-semibold">{portal.stats.pendingAppointments}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-sky-100">Blood Requests</p>
              <p className="mt-2 text-2xl font-semibold">{portal.stats.bloodRequests}</p>
            </div>
          </div>
        </section>

        {message ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
            {message}
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">Profile</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Hospital profile</h2>
              </div>
              <button
                type="button"
                onClick={handleProfileSave}
                disabled={savingProfile}
                className="rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {savingProfile ? "Saving..." : "Save Profile"}
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Registered Name</span>
                <input value={portal.hospital.name} readOnly className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 outline-none" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Registered Email</span>
                <input value={portal.session.email} readOnly className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 outline-none" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">City</span>
                <input value={profileForm.city} onChange={(event) => setProfileForm((current) => ({ ...current, city: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100" placeholder="City" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">State</span>
                <input value={profileForm.state} onChange={(event) => setProfileForm((current) => ({ ...current, state: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100" placeholder="State" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Phone</span>
                <input value={profileForm.phone} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100" placeholder="Helpline or reception phone" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Pincode</span>
                <input value={profileForm.pincode} onChange={(event) => setProfileForm((current) => ({ ...current, pincode: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100" placeholder="Pincode" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">Website</span>
                <input value={profileForm.website} onChange={(event) => setProfileForm((current) => ({ ...current, website: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100" placeholder="https://yourhospital.example" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">Address</span>
                <textarea value={profileForm.address} onChange={(event) => setProfileForm((current) => ({ ...current, address: event.target.value }))} className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100" placeholder="Full hospital address" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">Specialties</span>
                <input value={profileForm.specialtiesText} onChange={(event) => setProfileForm((current) => ({ ...current, specialtiesText: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100" placeholder="Cardiology, Emergency Care, Neurology" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">Description</span>
                <textarea value={profileForm.description} onChange={(event) => setProfileForm((current) => ({ ...current, description: event.target.value }))} className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100" placeholder="Describe your hospital, services, and strengths." />
              </label>
            </div>

            <label className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <input type="checkbox" checked={profileForm.isOpen24Hours} onChange={(event) => setProfileForm((current) => ({ ...current, isOpen24Hours: event.target.checked }))} className="h-4 w-4 accent-sky-600" />
              Open 24 hours
            </label>
          </div>

          <form onSubmit={handleRequestSubmit} className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-500">Blood Request</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Request units from a blood bank</h2>
            <p className="mt-3 text-sm text-slate-600">
              These requests go directly into the connected blood bank dashboards in the same merged application.
            </p>

            <div className="mt-6 grid gap-4">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Blood Bank</span>
                <select value={requestForm.bloodBankId} onChange={(event) => setRequestForm((current) => ({ ...current, bloodBankId: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100" required>
                  <option value="">Select blood bank</option>
                  {portal.bloodBanks.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.hospitalName} - {bank.district}, {bank.state}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Blood Type</span>
                  <select value={requestForm.bloodType} onChange={(event) => setRequestForm((current) => ({ ...current, bloodType: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100">
                    {BLOOD_TYPES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Component</span>
                  <select value={requestForm.component} onChange={(event) => setRequestForm((current) => ({ ...current, component: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100">
                    {BLOOD_COMPONENTS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Units</span>
                  <input type="number" min="1" value={requestForm.requestedUnits} onChange={(event) => setRequestForm((current) => ({ ...current, requestedUnits: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100" />
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Patient Name</span>
                <input value={requestForm.patientName} onChange={(event) => setRequestForm((current) => ({ ...current, patientName: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100" placeholder="Patient or case name" required />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Contact Phone</span>
                <input value={requestForm.requesterPhone} onChange={(event) => setRequestForm((current) => ({ ...current, requesterPhone: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100" placeholder="Emergency contact number" required />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Clinical Notes</span>
                <textarea value={requestForm.message} onChange={(event) => setRequestForm((current) => ({ ...current, message: event.target.value }))} className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100" placeholder="Add urgency or transfusion notes for the blood bank team." />
              </label>
            </div>

            <button type="submit" disabled={submittingRequest} className="mt-6 w-full rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-70">
              {submittingRequest ? "Sending request..." : "Send Blood Request"}
            </button>
          </form>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Doctors</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Linked doctor roster</h2>
              </div>
              <Link href="/doctor/register" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Register doctor
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {portal.doctors.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                  No doctors are linked yet. Use doctor registration to add the first doctor to this hospital.
                </div>
              ) : (
                portal.doctors.map((doctor) => (
                  <div key={doctor.id} className="rounded-3xl border border-slate-200 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{doctor.name}</p>
                        <p className="mt-1 text-sm font-medium text-sky-700">{doctor.specialty}</p>
                      </div>
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                        {doctor.experience}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{doctor.qualification}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">Availability</p>
                    <p className="mt-1 text-sm text-slate-600">{doctor.available}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-600">Appointments</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Upcoming consultations</h2>

              <div className="mt-6 space-y-4">
                {portal.appointments.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                    No appointments have been booked for this hospital yet.
                  </div>
                ) : (
                  portal.appointments.slice(0, 8).map((appointment) => (
                    <div key={appointment.id} className="rounded-3xl border border-slate-200 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-slate-900">{appointment.name}</p>
                          <p className="mt-1 text-sm text-slate-600">{appointment.doctor.name}</p>
                          <p className="mt-1 text-sm text-slate-500">{new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[appointment.status] || "bg-slate-100 text-slate-700"}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">{appointment.problem}</p>
                      <p className="mt-2 text-xs text-slate-400">{appointment.phone}{appointment.user?.email ? ` - ${appointment.user.email}` : ""}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-500">Requests</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Blood request history</h2>

              <div className="mt-6 space-y-4">
                {portal.requests.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                    No blood requests sent yet.
                  </div>
                ) : (
                  portal.requests.map((request) => (
                    <div key={request.id} className="rounded-3xl border border-slate-200 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-slate-900">{request.patientName || "Patient not specified"}</p>
                          <p className="mt-1 text-sm text-slate-600">
                            {request.bloodType} - {request.component} - {request.requestedUnits} unit{request.requestedUnits > 1 ? "s" : ""}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">{request.bloodBank.hospitalName}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[request.status] || "bg-slate-100 text-slate-700"}`}>
                          {request.status}
                        </span>
                      </div>
                      {request.message ? <p className="mt-3 text-sm text-slate-600">{request.message}</p> : null}
                      <p className="mt-2 text-xs text-slate-400">Created {new Date(request.createdAt).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Connected Blood Banks</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Live inventory snapshot</h2>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {portal.bloodBanks.map((bank) => (
              <div key={bank.id} className="rounded-3xl border border-slate-200 p-5">
                <p className="text-lg font-semibold text-slate-900">{bank.hospitalName}</p>
                <p className="mt-1 text-sm text-slate-500">{bank.district}, {bank.state}</p>
                <p className="mt-1 text-sm text-slate-500">{bank.contact}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {bank.bloodGroups.slice(0, 4).map((group) => (
                    <span key={group.id} className={`rounded-full px-3 py-1 text-xs font-semibold ${group.available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {group.type} {group.component} ({group.units})
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
