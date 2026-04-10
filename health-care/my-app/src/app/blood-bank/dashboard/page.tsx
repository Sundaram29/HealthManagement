"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BLOOD_COMPONENTS, BLOOD_TYPES, createDefaultInventory } from "../../../lib/blood";

type SessionPayload = {
  name: string;
  email: string;
  extra?: string | null;
};

type InventoryRow = {
  id?: number;
  type: string;
  component: string;
  units: number;
  available?: boolean;
  lastUpdated?: string;
};

type BloodRequest = {
  id: number;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string | null;
  patientName?: string | null;
  bloodType: string;
  component: string;
  requestedUnits: number;
  message?: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

type BloodBankPayload = {
  id: number;
  state: string;
  district: string;
  hospitalName: string;
  address: string;
  contact: string;
  bloodGroups: InventoryRow[];
  requests: BloodRequest[];
};

const emptyProfile = {
  hospitalName: "",
  state: "",
  district: "",
  address: "",
  contact: "",
};

export default function BloodBankDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState(emptyProfile);
  const [inventory, setInventory] = useState<InventoryRow[]>(createDefaultInventory());
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [activeRequestId, setActiveRequestId] = useState<number | null>(null);

  useEffect(() => {
    const loadPortal = async () => {
      try {
        const response = await fetch("/api/blood-bank/manage", {
          cache: "no-store",
          credentials: "include",
        });

        if (response.status === 401) {
          router.replace("/blood-bank/login");
          return;
        }

        const payload = await response.json().catch(() => ({ error: "Unable to parse server response." }));

        if (!response.ok) {
          throw new Error(payload?.error || "Failed to load blood bank portal.");
        }

        setSession(payload.session);

        if (payload.bloodBank) {
          const bank = payload.bloodBank as BloodBankPayload;
          setProfile({
            hospitalName: bank.hospitalName,
            state: bank.state,
            district: bank.district,
            address: bank.address,
            contact: bank.contact,
          });
          setInventory(bank.bloodGroups.length > 0 ? bank.bloodGroups : createDefaultInventory());
          setRequests(bank.requests ?? []);
        } else {
          setProfile({
            ...emptyProfile,
            hospitalName: payload.session?.name ?? "",
          });
          setInventory(createDefaultInventory());
          setRequests([]);
        }
      } catch (error) {
        console.error(error);
        setMessage(error instanceof Error ? error.message : "Failed to load blood bank portal.");
      } finally {
        setLoading(false);
      }
    };

    loadPortal();
  }, [router]);

  const updateInventoryRow = (index: number, key: keyof InventoryRow, value: string | number) => {
    setInventory((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [key]: key === "units" ? Number(value) || 0 : value,
            }
          : row,
      ),
    );
  };

  const saveBloodBank = async () => {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/blood-bank/manage", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profile, inventory }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to save blood bank data.");
      }

      const bloodBank = payload.bloodBank as BloodBankPayload;
      setProfile({
        hospitalName: bloodBank.hospitalName,
        state: bloodBank.state,
        district: bloodBank.district,
        address: bloodBank.address,
        contact: bloodBank.contact,
      });
      setInventory(bloodBank.bloodGroups);
      setRequests(bloodBank.requests ?? []);
      setMessage("Blood bank profile and inventory saved successfully.");
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Failed to save blood bank data.");
    } finally {
      setSaving(false);
    }
  };

  const reviewRequest = async (requestId: number, action: "approved" | "rejected") => {
    setActiveRequestId(requestId);
    setMessage("");
    const matchingRequest = requests.find((request) => request.id === requestId) ?? null;

    try {
      const response = await fetch(`/api/blood-requests/${requestId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to update request.");
      }

      setRequests((current) =>
        current.map((request) =>
          request.id === requestId ? { ...request, status: action } : request,
        ),
      );

      if (action === "approved") {
        setInventory((current) =>
          current.map((row) => {
            if (!matchingRequest || row.type !== matchingRequest.bloodType || row.component !== matchingRequest.component) {
              return row;
            }

            const nextUnits = Math.max(0, row.units - matchingRequest.requestedUnits);
            return {
              ...row,
              units: nextUnits,
              available: nextUnits > 0,
              lastUpdated: new Date().toISOString(),
            };
          }),
        );
      }

      setMessage(`Request ${action} successfully.`);
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Failed to update request.");
    } finally {
      setActiveRequestId(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-600">Blood Bank Portal</p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">Loading blood bank workspace...</h1>
        </div>
      </main>
    );
  }

  const totalUnits = inventory.reduce((sum, row) => sum + (Number(row.units) || 0), 0);
  const pendingRequests = requests.filter((request) => request.status === "pending").length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-slate-100 px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[32px] bg-slate-950 px-8 py-8 text-white shadow-2xl shadow-rose-100">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-300">Blood Bank Control Room</p>
              <h1 className="mt-3 text-3xl font-semibold">{profile.hospitalName || session?.name || "Blood Bank"}</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                Upload your blood bank details, keep unit counts current, and approve incoming blood availability requests from one place.
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
                router.push("/blood-bank/login");
              }}
              className="rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Logout
            </button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Email</p>
              <p className="mt-2 text-lg font-semibold">{session?.email}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Total Units Listed</p>
              <p className="mt-2 text-lg font-semibold">{totalUnits}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Pending Requests</p>
              <p className="mt-2 text-lg font-semibold">{pendingRequests}</p>
            </div>
          </div>
        </section>

        {message ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {message}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-500">Profile</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Blood bank details</h2>
              </div>
              <button
                type="button"
                onClick={saveBloodBank}
                disabled={saving}
                className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save Details"}
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Blood Bank Name</span>
                <input
                  value={profile.hospitalName}
                  onChange={(event) => setProfile((current) => ({ ...current, hospitalName: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                  placeholder="Blood bank name"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Contact Number</span>
                <input
                  value={profile.contact}
                  onChange={(event) => setProfile((current) => ({ ...current, contact: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                  placeholder="Phone or helpline"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">State</span>
                <input
                  value={profile.state}
                  onChange={(event) => setProfile((current) => ({ ...current, state: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                  placeholder="State"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">City / District</span>
                <input
                  value={profile.district}
                  onChange={(event) => setProfile((current) => ({ ...current, district: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                  placeholder="City or district"
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">Address</span>
                <textarea
                  value={profile.address}
                  onChange={(event) => setProfile((current) => ({ ...current, address: event.target.value }))}
                  className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                  placeholder="Complete blood bank address"
                />
              </label>
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-500">Account</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Registration summary</h2>
            <div className="mt-6 space-y-4 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Blood Bank</p>
                <p className="mt-1">{session?.name}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Registered Email</p>
                <p className="mt-1">{session?.email}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">License / ID</p>
                <p className="mt-1">{session?.extra || "Not provided"}</p>
              </div>
              <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50 p-4 text-rose-700">
                Keep this page updated. The public Blood Available page reads from this saved profile and inventory.
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-500">Inventory</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Blood availability upload</h2>
            </div>
            <button
              type="button"
              onClick={() =>
                setInventory((current) => [
                  ...current,
                  { type: BLOOD_TYPES[0], component: BLOOD_COMPONENTS[0], units: 0, available: false },
                ])
              }
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
            >
              Add Row
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr className="border-b border-slate-200">
                  <th className="pb-3 pr-3 font-semibold">Blood Type</th>
                  <th className="pb-3 pr-3 font-semibold">Component</th>
                  <th className="pb-3 pr-3 font-semibold">Units</th>
                  <th className="pb-3 pr-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((row, index) => {
                  const available = Number(row.units) > 0;
                  return (
                    <tr key={`${row.id ?? "new"}-${index}`} className="border-b border-slate-100">
                      <td className="py-4 pr-3">
                        <select
                          value={row.type}
                          onChange={(event) => updateInventoryRow(index, "type", event.target.value)}
                          className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none focus:border-rose-400"
                        >
                          {BLOOD_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 pr-3">
                        <select
                          value={row.component}
                          onChange={(event) => updateInventoryRow(index, "component", event.target.value)}
                          className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none focus:border-rose-400"
                        >
                          {BLOOD_COMPONENTS.map((component) => (
                            <option key={component} value={component}>
                              {component}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 pr-3">
                        <input
                          type="number"
                          min="0"
                          value={row.units}
                          onChange={(event) => updateInventoryRow(index, "units", event.target.value)}
                          className="w-28 rounded-2xl border border-slate-200 px-3 py-2 outline-none focus:border-rose-400"
                        />
                      </td>
                      <td className="py-4 pr-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                          {available ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="py-4">
                        <button
                          type="button"
                          onClick={() => setInventory((current) => current.filter((_, rowIndex) => rowIndex !== index))}
                          className="text-sm font-semibold text-rose-600 transition hover:text-rose-500"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-500">Requests</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Blood availability requests</h2>

          <div className="mt-6 space-y-4">
            {requests.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                No requests yet. Once users request blood from the public Blood Available page, they will appear here.
              </div>
            ) : (
              requests.map((request) => (
                <div key={request.id} className="rounded-3xl border border-slate-200 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{request.requesterName}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {request.bloodType} · {request.component} · {request.requestedUnits} unit{request.requestedUnits > 1 ? "s" : ""}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{request.requesterEmail}</p>
                      {request.requesterPhone ? <p className="mt-1 text-sm text-slate-500">{request.requesterPhone}</p> : null}
                      {request.patientName ? <p className="mt-1 text-sm text-slate-500">Patient: {request.patientName}</p> : null}
                      {request.message ? <p className="mt-3 text-sm text-slate-600">{request.message}</p> : null}
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      request.status === "approved"
                        ? "bg-emerald-50 text-emerald-700"
                        : request.status === "rejected"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-amber-50 text-amber-700"
                    }`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={request.status !== "pending" || activeRequestId === request.id}
                      onClick={() => reviewRequest(request.id, "approved")}
                      className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {activeRequestId === request.id ? "Working..." : "Approve"}
                    </button>
                    <button
                      type="button"
                      disabled={request.status !== "pending" || activeRequestId === request.id}
                      onClick={() => reviewRequest(request.id, "rejected")}
                      className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Reject
                    </button>
                    <p className="self-center text-xs text-slate-400">
                      Requested on {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
