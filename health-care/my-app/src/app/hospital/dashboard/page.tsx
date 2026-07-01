"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BLOOD_COMPONENTS, BLOOD_TYPES } from "../../../lib/blood";

type Hospital = {
  id: number;
  name: string;
  code?: string | null;
  slug?: string | null;
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
};

type Doctor = {
  id: number;
  name: string;
  specialty: string;
  department?: string | null;
  contact?: string | null;
  available: string;
  experience: string;
  qualification: string;
};

type Patient = {
  id: number;
  name: string;
  age?: number | null;
  gender?: string | null;
  phone?: string | null;
  bloodGroup?: string | null;
  primaryConcern?: string | null;
  createdAt: string;
};

type BloodBank = {
  id: number;
  hospitalName: string;
  district: string;
  state: string;
  contact: string;
  bloodGroups: { id: number; type: string; component: string; units: number; available: boolean }[];
};

type BloodRequest = {
  id: number;
  patientName?: string | null;
  bloodType: string;
  component: string;
  requestedUnits: number;
  urgency?: string | null;
  reason?: string | null;
  requiredDate?: string | null;
  status: "pending" | "approved" | "rejected" | "delivered";
  createdAt: string;
  bloodBank: { hospitalName: string };
};

type RequestForm = {
  bloodBankId: string;
  patientName: string;
  requesterPhone: string;
  bloodType: string;
  component: string;
  requestedUnits: string;
  urgency: string;
  reason: string;
  requiredDate: string;
};

type Portal = {
  hospital: Hospital;
  doctors: Doctor[];
  patients: Patient[];
  bloodBanks: BloodBank[];
  requests: BloodRequest[];
  stats: {
    doctors: number;
    patients: number;
    bloodRequests: number;
    pending: number;
    approved: number;
    rejected: number;
    delivered: number;
  };
};

const emptyDoctor = {
  id: "",
  name: "",
  department: "",
  specialty: "",
  contact: "",
  available: "Mon-Fri, 10:00 AM - 4:00 PM",
  experience: "",
  qualification: "",
};

const emptyPatient = {
  name: "",
  age: "",
  gender: "",
  phone: "",
  email: "",
  address: "",
  bloodGroup: "",
  primaryConcern: "",
};

const emptyRequest: RequestForm = {
  bloodBankId: "",
  patientName: "",
  requesterPhone: "",
  bloodType: BLOOD_TYPES[0],
  component: BLOOD_COMPONENTS[0],
  requestedUnits: "1",
  urgency: "routine",
  reason: "",
  requiredDate: "",
};

const statusClasses = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  delivered: "bg-sky-50 text-sky-700 ring-sky-200",
};

export default function HospitalDashboardPage() {
  const router = useRouter();
  const [portal, setPortal] = useState<Portal | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState("");
  const [doctorForm, setDoctorForm] = useState(emptyDoctor);
  const [patientForm, setPatientForm] = useState(emptyPatient);
  const [requestForm, setRequestForm] = useState(emptyRequest);
  const [profileForm, setProfileForm] = useState({
    city: "",
    state: "",
    address: "",
    pincode: "",
    phone: "",
    website: "",
    description: "",
    specialties: "",
    isOpen24Hours: false,
  });

  const loadPortal = useCallback(async () => {
    const response = await fetch("/api/portal/hospital", { cache: "no-store", credentials: "include" });

    if (response.status === 401) {
      router.replace("/hospital/login");
      return;
    }

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error || "Unable to load hospital dashboard.");
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
      specialties: payload.hospital.specialties?.join(", ") ?? "",
      isOpen24Hours: Boolean(payload.hospital.isOpen24Hours),
    });
    setRequestForm((current) => ({ ...current, requesterPhone: payload.hospital.phone ?? "" }));
  }, [router]);

  useEffect(() => {
    loadPortal()
      .catch((error) => setMessage(error instanceof Error ? error.message : "Unable to load hospital dashboard."))
      .finally(() => setLoading(false));
  }, [loadPortal]);

  const inventoryMatches = useMemo(() => {
    if (!portal) {
      return [];
    }

    return portal.bloodBanks.flatMap((bank) =>
      bank.bloodGroups.map((row) => ({
        ...row,
        bank: bank.hospitalName,
        place: `${bank.district}, ${bank.state}`,
      })),
    );
  }, [portal]);

  async function mutate(method: "POST" | "PUT" | "DELETE", body: Record<string, unknown>, success: string) {
    setSaving(String(body.action || method));
    setMessage("");

    try {
      const response = await fetch("/api/portal/hospital", {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Request failed.");
      }

      await loadPortal();
      setMessage(success);
      return payload;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Request failed.");
      return null;
    } finally {
      setSaving("");
    }
  }

  if (loading) {
    return <main className="min-h-screen bg-slate-100 p-8 text-slate-700">Loading hospital workspace...</main>;
  }

  if (!portal) {
    return <main className="min-h-screen bg-slate-100 p-8 text-slate-700">{message || "Hospital data is unavailable."}</main>;
  }

  const cards = [
    ["Total doctors", portal.stats.doctors],
    ["Total patients", portal.stats.patients],
    ["Blood requests", portal.stats.bloodRequests],
    ["Pending", portal.stats.pending],
    ["Approved", portal.stats.approved],
    ["Rejected", portal.stats.rejected],
  ];

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="bg-slate-950 px-6 py-7 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">Hospital HMS</p>
          <h1 className="mt-4 text-2xl font-semibold">{portal.hospital.name}</h1>
          <p className="mt-2 text-sm text-slate-300">{portal.hospital.code || `HSP-${portal.hospital.id}`}</p>
          <nav className="mt-8 space-y-2 text-sm text-slate-200">
            {["Overview", "Profile", "Doctors", "Patients", "Blood requests", "Inventory"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replaceAll(" ", "-")}`} className="block rounded-lg px-3 py-2 hover:bg-white/10">
                {item}
              </a>
            ))}
          </nav>
        </aside>

        <section className="px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <p className="text-sm text-slate-500">Tenant dashboard</p>
              <h2 className="text-2xl font-semibold">Operations command center</h2>
            </div>
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
                router.push("/hospital/login");
              }}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Logout
            </button>
          </header>

          {message ? <div className="mt-5 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">{message}</div> : null}

          <section id="overview" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            {cards.map(([label, value]) => (
              <div key={label} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-semibold">{value}</p>
              </div>
            ))}
          </section>

          <section id="profile" className="mt-6 rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Hospital profile</h3>
                <p className="mt-1 text-sm text-slate-500">{portal.hospital.address || "Complete address pending"} {portal.hospital.city ? `, ${portal.hospital.city}` : ""}</p>
                <p className="mt-1 text-sm text-slate-500">Contact: {portal.hospital.phone || "Not set"} | Code: {portal.hospital.code || "Generating"}</p>
              </div>
              <button
                onClick={() => mutate("PUT", { action: "profile", ...profileForm }, "Hospital profile saved.")}
                disabled={saving === "profile"}
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving === "profile" ? "Saving..." : "Save profile"}
              </button>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {(["city", "state", "phone", "pincode", "website", "specialties"] as const).map((key) => (
                <input key={key} value={String(profileForm[key])} onChange={(event) => setProfileForm((current) => ({ ...current, [key]: event.target.value }))} placeholder={key} className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-sky-400" />
              ))}
              <textarea value={profileForm.address} onChange={(event) => setProfileForm((current) => ({ ...current, address: event.target.value }))} placeholder="Address" className="min-h-24 rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-sky-400 md:col-span-2" />
              <textarea value={profileForm.description} onChange={(event) => setProfileForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" className="min-h-24 rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-sky-400 md:col-span-2" />
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <div id="doctors" className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-lg font-semibold">Doctor management</h3>
              <form
                className="mt-4 grid gap-3"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const method = doctorForm.id ? "PUT" : "POST";
                  const payload = await mutate(method, { action: "doctor", ...doctorForm }, doctorForm.id ? "Doctor updated." : "Doctor added.");
                  if (payload) setDoctorForm(emptyDoctor);
                }}
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <input value={doctorForm.name} onChange={(event) => setDoctorForm((current) => ({ ...current, name: event.target.value }))} placeholder="Doctor name" className="rounded-lg border border-slate-200 px-3 py-2" required />
                  <input value={doctorForm.department} onChange={(event) => setDoctorForm((current) => ({ ...current, department: event.target.value }))} placeholder="Department" className="rounded-lg border border-slate-200 px-3 py-2" />
                  <input value={doctorForm.specialty} onChange={(event) => setDoctorForm((current) => ({ ...current, specialty: event.target.value }))} placeholder="Specialization" className="rounded-lg border border-slate-200 px-3 py-2" required />
                  <input value={doctorForm.contact} onChange={(event) => setDoctorForm((current) => ({ ...current, contact: event.target.value }))} placeholder="Contact" className="rounded-lg border border-slate-200 px-3 py-2" />
                  <input value={doctorForm.experience} onChange={(event) => setDoctorForm((current) => ({ ...current, experience: event.target.value }))} placeholder="Experience" className="rounded-lg border border-slate-200 px-3 py-2" />
                  <input value={doctorForm.available} onChange={(event) => setDoctorForm((current) => ({ ...current, available: event.target.value }))} placeholder="Availability" className="rounded-lg border border-slate-200 px-3 py-2" />
                </div>
                <input value={doctorForm.qualification} onChange={(event) => setDoctorForm((current) => ({ ...current, qualification: event.target.value }))} placeholder="Qualification" className="rounded-lg border border-slate-200 px-3 py-2" />
                <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">{doctorForm.id ? "Update doctor" : "Add doctor"}</button>
              </form>
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <tbody>
                    {portal.doctors.map((doctor) => (
                      <tr key={doctor.id} className="border-t border-slate-100">
                        <td className="py-3 pr-3"><b>{doctor.name}</b><br /><span className="text-slate-500">{doctor.department || doctor.specialty}</span></td>
                        <td className="py-3 pr-3">{doctor.available}</td>
                        <td className="py-3 text-right">
                          <button onClick={() => setDoctorForm({ ...emptyDoctor, ...doctor, id: String(doctor.id), department: doctor.department ?? "", contact: doctor.contact ?? "" })} className="mr-3 font-semibold text-sky-700">Edit</button>
                          <button onClick={() => mutate("DELETE", { action: "doctor", id: doctor.id }, "Doctor deleted.")} className="font-semibold text-rose-700">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div id="patients" className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-lg font-semibold">Patient management</h3>
              <form
                className="mt-4 grid gap-3"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const payload = await mutate("POST", { action: "patient", ...patientForm }, "Patient added.");
                  if (payload) setPatientForm(emptyPatient);
                }}
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <input value={patientForm.name} onChange={(event) => setPatientForm((current) => ({ ...current, name: event.target.value }))} placeholder="Patient name" className="rounded-lg border border-slate-200 px-3 py-2" required />
                  <input value={patientForm.age} onChange={(event) => setPatientForm((current) => ({ ...current, age: event.target.value }))} placeholder="Age" type="number" className="rounded-lg border border-slate-200 px-3 py-2" />
                  <input value={patientForm.gender} onChange={(event) => setPatientForm((current) => ({ ...current, gender: event.target.value }))} placeholder="Gender" className="rounded-lg border border-slate-200 px-3 py-2" />
                  <input value={patientForm.phone} onChange={(event) => setPatientForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone" className="rounded-lg border border-slate-200 px-3 py-2" />
                  <select value={patientForm.bloodGroup} onChange={(event) => setPatientForm((current) => ({ ...current, bloodGroup: event.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2">
                    <option value="">Blood group</option>
                    {BLOOD_TYPES.map((type) => <option key={type}>{type}</option>)}
                  </select>
                  <input value={patientForm.primaryConcern} onChange={(event) => setPatientForm((current) => ({ ...current, primaryConcern: event.target.value }))} placeholder="Primary concern" className="rounded-lg border border-slate-200 px-3 py-2" />
                </div>
                <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white">Add patient</button>
              </form>
              <div className="mt-5 space-y-3">
                {portal.patients.slice(0, 8).map((patient) => (
                  <div key={patient.id} className="rounded-lg border border-slate-200 p-3">
                    <p className="font-semibold">{patient.name} {patient.age ? `(${patient.age})` : ""}</p>
                    <p className="text-sm text-slate-500">{patient.bloodGroup || "Blood group not set"} | {patient.phone || "No phone"} | {patient.primaryConcern || "No concern recorded"}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <form
              id="blood-requests"
              className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200"
              onSubmit={async (event) => {
                event.preventDefault();
                const payload = await mutate("POST", { action: "blood-request", ...requestForm }, "Blood request submitted.");
                if (payload) setRequestForm((current) => ({ ...emptyRequest, requesterPhone: current.requesterPhone }));
              }}
            >
              <h3 className="text-lg font-semibold">Request blood</h3>
              <div className="mt-4 grid gap-3">
                <select value={requestForm.bloodBankId} onChange={(event) => setRequestForm((current) => ({ ...current, bloodBankId: event.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2" required>
                  <option value="">Choose blood bank</option>
                  {portal.bloodBanks.map((bank) => <option key={bank.id} value={bank.id}>{bank.hospitalName} - {bank.district}</option>)}
                </select>
                <div className="grid gap-3 md:grid-cols-3">
                  <select value={requestForm.bloodType} onChange={(event) => setRequestForm((current) => ({ ...current, bloodType: event.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2">{BLOOD_TYPES.map((type) => <option key={type}>{type}</option>)}</select>
                  <select value={requestForm.component} onChange={(event) => setRequestForm((current) => ({ ...current, component: event.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2">{BLOOD_COMPONENTS.map((component) => <option key={component}>{component}</option>)}</select>
                  <input value={requestForm.requestedUnits} onChange={(event) => setRequestForm((current) => ({ ...current, requestedUnits: event.target.value }))} min="1" type="number" className="rounded-lg border border-slate-200 px-3 py-2" />
                </div>
                <input value={requestForm.patientName} onChange={(event) => setRequestForm((current) => ({ ...current, patientName: event.target.value }))} placeholder="Patient name" className="rounded-lg border border-slate-200 px-3 py-2" required />
                <input value={requestForm.requesterPhone} onChange={(event) => setRequestForm((current) => ({ ...current, requesterPhone: event.target.value }))} placeholder="Contact phone" className="rounded-lg border border-slate-200 px-3 py-2" required />
                <div className="grid gap-3 md:grid-cols-2">
                  <select value={requestForm.urgency} onChange={(event) => setRequestForm((current) => ({ ...current, urgency: event.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2">
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                    <option value="critical">Critical</option>
                  </select>
                  <input value={requestForm.requiredDate} onChange={(event) => setRequestForm((current) => ({ ...current, requiredDate: event.target.value }))} type="date" className="rounded-lg border border-slate-200 px-3 py-2" />
                </div>
                <textarea value={requestForm.reason} onChange={(event) => setRequestForm((current) => ({ ...current, reason: event.target.value }))} placeholder="Reason / clinical note" className="min-h-24 rounded-lg border border-slate-200 px-3 py-2" />
                <button className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white">Send request</button>
              </div>
            </form>

            <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-lg font-semibold">Request history and alerts</h3>
              <div className="mt-4 space-y-3">
                {portal.requests.map((request) => (
                  <div key={request.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{request.patientName || "Patient"} - {request.bloodType} {request.component}</p>
                        <p className="text-sm text-slate-500">{request.requestedUnits} units from {request.bloodBank.hospitalName} | {request.urgency || "routine"}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClasses[request.status]}`}>{request.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{request.reason || "No reason recorded"}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="inventory" className="mt-6 rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-lg font-semibold">Inventory availability</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {inventoryMatches.map((row, index) => (
                <div key={`${row.id}-${index}`} className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xl font-semibold">{row.type}</p>
                  <p className="text-sm text-slate-500">{row.component}</p>
                  <p className="mt-2 text-sm">{row.units} units at {row.bank}</p>
                  <span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${row.available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{row.available ? "Available" : "Unavailable"}</span>
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
