import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppointmentForm from "./AppointmentForm";
import { apiFetch } from "../lib/api";

type Appointment = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  make: string;
  model: string;
  mileage: string;
  year: string;
  date: string;
  timeslot: string;
  service: string;
  customer_comments?: string;
  employee_notes?: string;
};

export default function ManageAppointmentsPage() {
  const [message, setMessage] = useState("");
  const { id } = useParams();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState<Boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointment();
  }, []);

  async function fetchAppointment() {
    const res = await apiFetch(`/api/appointments/${id}`);
    if (res.status === 404 || !res.ok) {
      navigate("/");
      return;
    }

    const data = await res.json();

    setAppointment(data);

    setLoading(false);
  }

  async function deleteAppointment(id: string) {
    const confirmed = confirm(
      "Are you sure you want to delete this appointment?",
    );
    if (!confirmed) return;

    const res = await apiFetch(`/api/appointments/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      setMessage("Failed to delete appointment. Please try again later.");
      return;
    }

    setMessage("Appointment deleted.");

    navigate("/");
  }

  if (loading || !appointment) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--motion-black)] to-gray-900 px-4 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6">
        {message && (
          <p className="mb-4 text-sm font-medium text-blue-600">{message}</p>
        )}

        <div className="flex justify-between">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Manage Your Appointment
          </h1>
          <button
            onClick={() => deleteAppointment(id ? id : "")}
            className="bg-red-500 text-white px-3 h-10  py-1 rounded mb-4"
          >
            Cancel Appointment
          </button>
        </div>
        <AppointmentForm
          defaultValues={appointment}
          onSubmitOverride={async (data) => {
            const payload = {
              ...data,
              year: data.year ? Number(data.year) : undefined,
              mileage: data.mileage ? Number(data.mileage) : undefined,
              employee_notes: appointment.employee_notes,
              customer_comments: data.comments,
            };
            await apiFetch(`/api/appointments/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
          }}
        />
      </div>
    </div>
  );
}
