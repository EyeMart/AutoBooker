import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AppointmentForm from "../components/AppointmentForm.tsx";
import { motion } from "framer-motion";

export default function Appointments() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-[var(--motion-black)] text-gray-300 py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Book Your Service
            </h1>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Schedule a convenient time for our professional mechanics to
              service your vehicle.
            </p>
          </motion.div>
          <AppointmentForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
