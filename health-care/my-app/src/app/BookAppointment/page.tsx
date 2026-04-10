"use client";

import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock3, Mail, Phone, Stethoscope, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

type Slot = {
  value: string;
  label: string;
  available: boolean;
};

const slots: Slot[] = [
  { value: "9-12", label: "9 AM - 12 PM", available: true },
  { value: "3-5", label: "3 PM - 5 PM", available: false },
  { value: "7-9", label: "7 PM - 9 PM", available: true },
];

const commonSymptoms = ["Fever", "Cough", "Headache", "Fatigue"];

const formatSelectedDate = (date: Date | null) =>
  date
    ? new Intl.DateTimeFormat("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date)
    : "Choose a date";

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorId = searchParams.get("doctorId");
  const hospitalId = searchParams.get("hospitalId");

  const [isAllowed, setIsAllowed] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [symptoms, setSymptoms] = useState("");

  const name = `${firstName.trim()} ${lastName.trim()}`.trim();

  useEffect(() => {
    const validateAccess = async () => {
      if (!doctorId) {
        setIsCheckingAccess(false);
        router.replace("/Hospitals");
        return;
      }

      const response = await fetch("/api/auth/session", { cache: "no-store" });
      const payload = await response.json().catch(() => ({ session: null }));

      if (!payload?.session || payload.session.role !== "user") {
        setIsCheckingAccess(false);
        router.replace("/auth/login?redirectTo=/BookAppointment");
        return;
      }

      setIsAllowed(true);
      setIsCheckingAccess(false);
    };

    validateAccess();
  }, [doctorId, router]);

  const minDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);

  const isDateMissing = attemptedSubmit && !selectedDate;
  const isSlotMissing = attemptedSubmit && !selectedSlot;

  const handleQuickSymptom = (symptom: string) => {
    setSymptoms((prev) => {
      const normalized = prev
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (normalized.includes(symptom)) {
        return prev;
      }

      return [...normalized, symptom].join(", ");
    });
  };

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    if (!selectedDate) {
      toast.error("Please select an appointment date");
      return;
    }

    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/auth/session", { cache: "no-store" });
      const payload = await response.json().catch(() => ({ session: null }));

      if (!payload?.session || payload.session.role !== "user") {
        toast.error("Please login first");
        return;
      }

      await axios.post(
        "/api/mybookings",
        {
          doctorId,
          hospitalId,
          name,
          email: email.trim(),
          phone: phone.trim(),
          selectedDate,
          selectedSlot,
          symptoms: symptoms.trim(),
        },
        {
          withCredentials: true,
        }
      );

      toast.success("Appointment booked successfully");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setSelectedDate(null);
      setSelectedSlot("");
      setSymptoms("");
      setAttemptedSubmit(false);
    } catch (error: unknown) {
      console.log(error);
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || "Something went wrong"
        : "Something went wrong";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingAccess || !isAllowed) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff_0%,_#f8fafc_45%,_#ffffff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <style jsx global>{`
        .appointment-calendar {
          width: 100%;
          border: none;
          background: transparent;
          font-family: inherit;
        }

        .appointment-calendar .react-datepicker__month-container {
          width: 100%;
        }

        .appointment-calendar .react-datepicker__header {
          background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
          border-bottom: 1px solid #dbeafe;
          padding: 1rem 1rem 0.75rem;
        }

        .appointment-calendar .react-datepicker__current-month {
          color: #0f172a;
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .appointment-calendar .react-datepicker__day-name,
        .appointment-calendar .react-datepicker__day {
          width: 2.45rem;
          line-height: 2.45rem;
          margin: 0.18rem;
          border-radius: 9999px;
          font-size: 0.9rem;
        }

        .appointment-calendar .react-datepicker__day-name {
          color: #64748b;
          font-weight: 600;
        }

        .appointment-calendar .react-datepicker__day {
          color: #1e293b;
          transition: all 0.2s ease;
        }

        .appointment-calendar .react-datepicker__day:hover {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .appointment-calendar .react-datepicker__day--keyboard-selected {
          background: #bfdbfe;
          color: #1e3a8a;
        }

        .appointment-calendar .react-datepicker__day--selected,
        .appointment-calendar .react-datepicker__day--selected:hover {
          background: linear-gradient(135deg, #2563eb 0%, #0f766e 100%);
          color: white;
          font-weight: 700;
          box-shadow: 0 10px 24px rgba(37, 99, 235, 0.28);
        }

        .appointment-calendar .react-datepicker__day--disabled {
          color: #cbd5e1;
          background: transparent;
        }

        .appointment-calendar .react-datepicker__navigation {
          top: 1rem;
        }

        .appointment-calendar .react-datepicker__navigation-icon::before {
          border-color: #2563eb;
          border-width: 2px 2px 0 0;
        }
      `}</style>

      <section className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
        <div className="rounded-[32px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
          <div className="mb-8 flex flex-col gap-4 border-b border-slate-100 pb-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
              <CheckCircle2 className="h-4 w-4" />
              Secure Booking
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Book your appointment
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Complete the patient details, choose an available date and slot, and we will save your appointment instantly.
              </p>
            </div>
          </div>

          <form onSubmit={onSubmitHandler} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <UserRound className="h-4 w-4 text-blue-600" />
                  First name
                </span>
                <input
                  type="text"
                  placeholder="Enter first name"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <UserRound className="h-4 w-4 text-blue-600" />
                  Last name
                </span>
                <input
                  type="text"
                  placeholder="Enter last name"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </label>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Mail className="h-4 w-4 text-blue-600" />
                  Email address
                </span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Phone className="h-4 w-4 text-blue-600" />
                  Phone number
                </span>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </label>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 sm:hidden">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <CalendarDays className="h-4 w-4 text-blue-600" />
                  Appointment date
                </span>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  minDate={minDate}
                  placeholderText="Select appointment date"
                  dateFormat="dd MMMM yyyy"
                  className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
                    isDateMissing ? "border-red-300" : "border-slate-200"
                  }`}
                />
              </label>
              {isDateMissing && <p className="mt-2 text-xs font-medium text-red-500">Please choose an appointment date.</p>}
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                <Clock3 className="h-4 w-4 text-blue-600" />
                Select time slot
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {slots.map((item) => (
                  <button
                    type="button"
                    key={item.value}
                    disabled={!item.available}
                    onClick={() => setSelectedSlot(item.value)}
                    className={`rounded-2xl border px-4 py-4 text-left text-sm font-medium transition ${
                      !item.available
                        ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                        : selectedSlot === item.value
                          ? "border-blue-600 bg-blue-600 text-white shadow-[0_18px_36px_rgba(37,99,235,0.22)]"
                          : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-100"
                    }`}
                  >
                    <div>{item.label}</div>
                    <div className={`mt-1 text-xs ${selectedSlot === item.value ? "text-blue-100" : item.available ? "text-emerald-600" : "text-slate-400"}`}>
                      {item.available ? "Available" : "Booked out"}
                    </div>
                  </button>
                ))}
              </div>

              {isSlotMissing && <p className="mt-2 text-xs font-medium text-red-500">Please choose an available time slot.</p>}
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <Stethoscope className="h-4 w-4 text-blue-600" />
                Symptoms
              </div>

              <div className="mb-3 flex flex-wrap gap-2">
                {commonSymptoms.map((symptom) => (
                  <button
                    type="button"
                    key={symptom}
                    onClick={() => handleQuickSymptom(symptom)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {symptom}
                  </button>
                ))}
              </div>

              <textarea
                rows={4}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe your symptoms briefly"
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <input type="checkbox" required className="mt-0.5 h-4 w-4 accent-blue-600" />
              <span>I agree to the terms and privacy policy for storing my appointment details.</span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-[linear-gradient(135deg,_#2563eb_0%,_#0f766e_100%)] px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,118,110,0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Booking appointment..." : "Book Appointment"}
            </button>
          </form>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[32px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Appointment date</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">Choose your day</h2>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>

            <div className="hidden sm:block">
              <DatePicker
                inline
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                minDate={minDate}
                calendarClassName="appointment-calendar"
              />
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Selected schedule</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{formatSelectedDate(selectedDate)}</p>
              <p className="mt-1 text-sm text-slate-600">
                {selectedSlot
                  ? `Preferred slot: ${slots.find((item) => item.value === selectedSlot)?.label}`
                  : "Choose an available slot to complete your booking."}
              </p>
            </div>
          </div>

          <div className="rounded-[32px] border border-emerald-100 bg-[linear-gradient(160deg,_#ecfeff_0%,_#f0fdf4_100%)] p-6 shadow-[0_24px_60px_rgba(16,185,129,0.10)]">
            <h3 className="text-lg font-semibold text-slate-900">Before you confirm</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                Bring any previous prescriptions or reports for a faster consultation.
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                Use the symptoms field to mention duration, severity, and any ongoing medication.
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                Morning and evening slots update independently, so unavailable slots stay locked.
              </li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default Page;
