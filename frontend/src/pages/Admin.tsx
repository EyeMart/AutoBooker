import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AdminAppointments from "../components/Admin.tsx";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <AdminAppointments />
      <Footer />
    </div>
  );
}
