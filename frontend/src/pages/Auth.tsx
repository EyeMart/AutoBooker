import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthForm from "../components/AuthForm";
import { motion } from "framer-motion";

export default function Auth() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gradient-to-b from-[var(--motion-black)] to-gray-900 py-12 md:py-20">
        <div className="max-w-md mx-auto px-4 sm:px-6  lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <AuthForm initialMode="signin" />
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
