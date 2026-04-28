import { useEffect, useState } from "react";
import { services, timeSlots } from "./constants";

type Appointment = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  make: string;
  model: string;
  year: string;
  date: string;
  timeslot: string;
  service: string;
  notes?: string;
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Appointment>>({});
  const [deleteConfirm, setConfirmation] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    try {
      const now: Date = new Date();
      const futureDate = new Date(now); // Clone current date
      futureDate.setDate(now.getDate() + 14);

      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
      const day = String(now.getDate()).padStart(2, "0");

      const fyear = futureDate.getFullYear();
      const fmonth = String(futureDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based
      const fday = String(futureDate.getDate()).padStart(2, "0");

      const res = await fetch(
        `/api/admin/appointments?from=${year}-${month}-${day}&to=${fyear}-${fmonth}-${fday}`,
        {
          credentials: "include",
        },
      );

      if (!res.ok) throw new Error("Failed to fetch appointments");

      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function startEditing(appt: Appointment) {
    setEditingId(appt.id);
    setEditForm(appt);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveAppointment(id: number) {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(editForm),
      });

      if (!res.ok) throw new Error("Failed to update appointment");

      await fetchAppointments();
      cancelEditing();
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteAppointment(id: number) {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete appointment");

      await fetchAppointments();
      cancelEditing();
    } catch (err) {
      console.error(err);
    }
  }

  function updateField<K extends keyof Appointment>(
    field: K,
    value: Appointment[K],
  ) {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  if (loading) {
    return <p className="p-6">Loading appointments...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--motion-black)] to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-300">
          Upcoming Appointments
        </h1>

        <div className="bg-gray-300 rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Contact</th>
                <th className="p-3 text-left">Vehicle</th>
                <th className="p-3 text-left">Service</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-left">Edit/Delete</th>
              </tr>
            </thead>

            <tbody>
              {appointments.map((appt) => {
                const isEditing = editingId === appt.id;

                return (
                  <tr key={appt.id} className="border-b">
                    <td className="p-3">
                      {appt.first_name + " " + appt.last_name}
                    </td>

                    <td className="p-3">
                      {
                        <div>
                          <p>{appt.email || "No email"}</p>
                          <p className="text-gray-500">{appt.phone || ""}</p>
                        </div>
                      }
                    </td>

                    <td className="p-3">
                      {`${appt.year || ""} ${appt.make || ""} ${
                        appt.model || ""
                      }`}
                    </td>

                    <td className="p-3">
                      {isEditing ? (
                        <select
                          className="border rounded px-2 py-1 w-full"
                          onChange={(e) =>
                            updateField("service", e.target.value)
                          }
                        >
                          <option value="">Change Service</option>
                          {services.map((service) => (
                            <option key={service} value={service}>
                              {service}
                            </option>
                          ))}
                        </select>
                      ) : (
                        appt.service
                      )}
                    </td>

                    <td className="p-3">
                      {isEditing ? (
                        <input
                          type="date"
                          className="border rounded px-2 py-1"
                          value={editForm.date || ""}
                          onChange={(e) => updateField("date", e.target.value)}
                        />
                      ) : (
                        appt.date.substring(5, 8) +
                        appt.date.substring(8, 10) +
                        "-" +
                        appt.date.substring(0, 4)
                      )}
                    </td>

                    <td className="p-3">
                      {isEditing ? (
                        <select
                          className="border rounded px-2 py-1"
                          onChange={(e) =>
                            updateField("timeslot", e.target.value)
                          }
                        >
                          <option value="">Change time</option>
                          {timeSlots.map((slot) => (
                            <option key={slot} value={slot}>
                              {slot}
                            </option>
                          ))}
                        </select>
                      ) : (
                        appt.timeslot
                      )}
                    </td>

                    <td className="p-3">
                      {isEditing && !deleteConfirm ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveAppointment(appt.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setConfirmation(true)}
                            className="bg-red-500 text-white px-3 py-1 rounded"
                          >
                            Delete
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="bg-gray-500 text-white px-3 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : deleteConfirm ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => deleteAppointment(appt.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded"
                          >
                            Are you sure?
                          </button>
                          <button
                            onClick={() => setConfirmation(false)}
                            className="bg-gray-500 text-white px-3 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(appt)}
                          className="bg-blue-600 text-white px-3 py-1 rounded"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {appointments.length === 0 && (
            <p className="p-6 text-gray-700">No appointments found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
