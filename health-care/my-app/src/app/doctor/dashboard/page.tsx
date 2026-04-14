"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SessionPayload = {
  name: string;
  email: string;
};

type DoctorRecord = {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  qualification: string;
  college: string;
  available: string;
  hospital: {
    id: number;
    name: string;
    city?: string | null;
    state?: string | null;
    address?: string | null;
  };
};

type AppointmentRecord = {
  id: number;
  name: string;
  phone: string;
  problem: string;
  status: string;
  appointmentDate: string;
  appointmentTime: string;
  hospital: {
    name: string;
  };
  user?: {
    email?: string | null;
  } | null;
};

type DoctorPortalPayload = {
  session: SessionPayload;
  doctor: DoctorRecord;
  appointments: AppointmentRecord[];
  stats: {
    totalAppointments: number;
    pendingAppointments: number;
    confirmedAppointments: number;
    completedAppointments: number;
  };
};

const statusClasses: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-sky-100 text-sky-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-700",
};

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [portal, setPortal] = useState<DoctorPortalPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeAppointmentId, setActiveAppointmentId] = useState<number | null>(null);

  useEffect(() => {
    const loadPortal = async () => {
      try {
        const response = await fetch("/api/portal/doctor", {
          cache: "no-store",
          credentials: "include",
        });

        if (response.status === 401) {
          router.replace("/doctor/login");
          return;
        }

        const payload = await response.json().catch(() => ({ error: "Unable to load doctor portal." }));

        if (!response.ok) {
          throw new Error(payload?.error || "Unable to load doctor portal.");
        }

        setPortal(payload);
      } catch (error) {
        console.error(error);
        setMessage(error instanceof Error ? error.message : "Unable to load doctor portal.");
      } finally {
        setLoading(false);
      }
    };

    void loadPortal();
  }, [router]);

  const updateAppointmentStatus = async (
    appointmentId: number,
    status: "confirmed" | "completed" | "cancelled",
  ) => {
    setActiveAppointmentId(appointmentId);
    setMessage("");

    try {
      const response = await fetch(`/api/portal/doctor/appointments/${appointmentId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      const payload = await response.json().catch(() => ({ error: "Unable to update appointment." }));

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to update appointment.");
      }

      setPortal((current) => {
        if (!current) {
          return current;
        }

        const appointments = current.appointments.map((appointment) =>
          appointment.id === appointmentId
            ? {
                ...appointment,
                status: payload.appointment.status,
              }
            : appointment,
        );

        return {
          ...current,
          appointments,
          stats: {
            totalAppointments: appointments.length,
            pendingAppointments: appointments.filter((item) => item.status === "pending").length,
            confirmedAppointments: appointments.filter((item) => item.status === "confirmed").length,
            completedAppointments: appointments.filter((item) => item.status === "completed").length,
          },
        };
      });
      setMessage(`Appointment marked ${status}.`);
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Unable to update appointment.");
    } finally {
      setActiveAppointmentId(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-6xl rounded-[32px] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">Doctor Portal</p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">Loading your dashboard...</h1>
        </div>
      </main>
    );
  }

  if (!portal) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-[32px] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">Doctor Portal</p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">Doctor data is unavailable.</h1>
          <p className="mt-3 text-slate-600">{message || "Please sign in again."}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ecfdf5_0%,#f8fafc_35%,#ffffff_100%)] px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[32px] bg-[linear-gradient(135deg,#052e16_0%,#166534_42%,#059669_100%)] px-8 py-8 text-white shadow-2xl shadow-emerald-100">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-100">Doctor Workspace</p>
              <h1 className="mt-3 text-3xl font-semibold">{portal.doctor.name}</h1>
              <p className="mt-3 max-w-3xl text-sm text-emerald-50/90">
                Review your linked hospital, manage appointment statuses, and keep your doctor presence aligned with the shared healthcare platform.
              </p>
            </div>

            <button
              type="button"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
                router.push("/doctor/login");
              }}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
            >
              Logout
            </button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-100">Appointments</p>
              <p className="mt-2 text-2xl font-semibold">{portal.stats.totalAppointments}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-100">Pending</p>
              <p className="mt-2 text-2xl font-semibold">{portal.stats.pendingAppointments}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-100">Confirmed</p>
              <p className="mt-2 text-2xl font-semibold">{portal.stats.confirmedAppointments}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-100">Completed</p>
              <p className="mt-2 text-2xl font-semibold">{portal.stats.completedAppointments}</p>
            </div>
          </div>
        </section>

        {message ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {message}
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
          <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Profile</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Linked doctor profile</h2>

            <div className="mt-6 space-y-4 text-sm text-slate-600">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Specialty</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{portal.doctor.specialty}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Qualification</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{portal.doctor.qualification}</p>
                <p className="mt-1 text-sm text-slate-500">{portal.doctor.college}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Experience</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{portal.doctor.experience}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Availability</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{portal.doctor.available}</p>
              </div>
              <div className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                Your doctor login is now connected to the shared hospital and appointment data instead of a standalone page.
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">Hospital</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Assigned hospital</h2>

              <div className="mt-6 rounded-3xl border border-slate-200 p-5">
                <p className="text-lg font-semibold text-slate-900">{portal.doctor.hospital.name}</p>
                <p className="mt-2 text-sm text-slate-600">
                  {[portal.doctor.hospital.city, portal.doctor.hospital.state].filter(Boolean).join(", ") || "Location not added yet"}
                </p>
                <p className="mt-2 text-sm text-slate-500">{portal.doctor.hospital.address || "Address not added yet"}</p>
              </div>
            </div>

            <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-600">Appointments</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Patient queue</h2>

              <div className="mt-6 space-y-4">
                {portal.appointments.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                    No appointments are assigned to you yet.
                  </div>
                ) : (
                  portal.appointments.map((appointment) => (
                    <div key={appointment.id} className="rounded-3xl border border-slate-200 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-slate-900">{appointment.name}</p>
                          <p className="mt-1 text-sm text-slate-600">{new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}</p>
                          <p className="mt-1 text-sm text-slate-500">{appointment.phone}{appointment.user?.email ? ` - ${appointment.user.email}` : ""}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[appointment.status] || "bg-slate-100 text-slate-700"}`}>
                          {appointment.status}
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-slate-600">{appointment.problem}</p>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          disabled={activeAppointmentId === appointment.id || appointment.status === "confirmed"}
                          onClick={() => void updateAppointmentStatus(appointment.id, "confirmed")}
                          className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {activeAppointmentId === appointment.id ? "Working..." : "Confirm"}
                        </button>
                        <button
                          type="button"
                          disabled={activeAppointmentId === appointment.id || appointment.status === "completed"}
                          onClick={() => void updateAppointmentStatus(appointment.id, "completed")}
                          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Mark Completed
                        </button>
                        <button
                          type="button"
                          disabled={activeAppointmentId === appointment.id || appointment.status === "cancelled"}
                          onClick={() => void updateAppointmentStatus(appointment.id, "cancelled")}
                          className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
