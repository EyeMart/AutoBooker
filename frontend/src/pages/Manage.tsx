import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ManageAppointmentPage from "../components/Manage.tsx";

export default function ManageAppointment() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ManageAppointmentPage />
      <Footer />
    </div>
  );
}
