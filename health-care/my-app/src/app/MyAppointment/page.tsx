"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "../components/footer/page";

type Booking = {
  id: number;
  name: string;
  phone: string;
  problem: string;
  status: string;
  appointmentDate: string;
  appointmentTime: string;
  doctor?: {
    name?: string | null;
  } | null;
  hospital?: {
    name?: string | null;
    city?: string | null;
    address?: string | null;
  } | null;
};

const Page = () => {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
        });
        const payload = await response.json().catch(() => ({ session: null }));

        if (!payload?.session || payload.session.role !== "user") {
          router.replace("/auth/login?redirectTo=/MyAppointment");
          return;
        }

        const res = await fetch("/api/my-appointments", { cache: "no-store" });

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.error || "Failed to fetch appointments");
        }

        const data = await res.json();
        setBookings(data.bookings || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [router]);

  const getStatusStyle = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-amber-100 text-amber-600";
      case "cancelled":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white">
      <main className="flex-1">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#8b5cf6] via-[#6366f1] to-[#10b981] pb-16">
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-purple-300 blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 h-[350px] w-[350px] rounded-full bg-emerald-300 blur-3xl opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-emerald-50 opacity-80"></div>

        <h1 className="relative z-10 mb-8 pt-8 text-center text-3xl font-semibold text-gray-900">
          My Appointments
        </h1>

        {loading && (
          <p className="relative z-10 text-center text-gray-500">
            Loading bookings...
          </p>
        )}

        {!loading && bookings.length === 0 && (
          <div className="relative z-10 mx-auto max-w-2xl px-6">
            <div className="rounded-3xl border border-white/70 bg-white/85 px-8 py-12 text-center shadow-xl backdrop-blur-xl">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-emerald-100 shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-8 w-8 text-purple-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 3v2.25M15.75 3v2.25M3.75 8.25h16.5M6 5.25h12A2.25 2.25 0 0 1 20.25 7.5v10.5A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V7.5A2.25 2.25 0 0 1 6 5.25Z"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900">
                No upcoming bookings
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                You do not have any upcoming appointments right now. Once you
                book a consultation, it will appear here with doctor, hospital,
                date, and time details.
              </p>

              <button
                type="button"
                onClick={() => router.push("/HospitalList")}
                className="cursor-pointer mt-6 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-500 px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:scale-[1.02] hover:shadow-lg"
              >
                Book an Appointment
              </button>
            </div>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-6 px-6">
            {bookings.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-purple-100 bg-white/80 p-5 shadow-md backdrop-blur-xl transition hover:shadow-lg"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {item.hospital?.name}, {item.hospital?.city}
                  </h2>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="mb-3 h-[2px] w-12 rounded-full bg-gradient-to-r from-purple-500 to-emerald-500"></div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="col-span-2 mb-2 flex items-center justify-between border-b pb-3">
                    <p className="text-lg font-semibold text-gray-800">
                      <span className="font-medium text-gray-700">
                        Patient Name:
                      </span>{" "}
                      {item.name}
                    </p>
                    <p className="text-md font-medium text-green-600">
                      <span className="font-medium text-gray-700">Doctor:</span>{" "}
                      {item.doctor?.name}
                    </p>
                  </div>

                  <p>
                    <span className="font-medium text-gray-700">Date:</span>{" "}
                    {new Date(item.appointmentDate).toDateString()}
                  </p>

                  <p>
                    <span className="font-medium text-gray-700">Time:</span>{" "}
                    {item.appointmentTime}
                  </p>

                  <p>
                    <span className="font-medium text-gray-700">Phone:</span>{" "}
                    {item.phone}
                  </p>

                  <p>
                    <span className="font-medium text-gray-700">Symptoms:</span>{" "}
                    {item.problem}
                  </p>

                  <p className="col-span-2">
                    <span className="font-medium text-gray-700">Address:</span>{" "}
                    {item.hospital?.address}
                  </p>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <button className="rounded-lg bg-purple-50 px-3 py-1 text-xs text-purple-600 transition hover:bg-purple-100">
                    View
                  </button>

                  <button className="rounded-lg bg-red-50 px-3 py-1 text-xs text-red-600 transition hover:bg-red-100">
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </main>
      <Footer className="mt-0" />
    </div>
  );
};

export default Page;
