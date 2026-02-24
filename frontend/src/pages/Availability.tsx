import React from 'react';
import Header from '../components/Header';
import AvailabilityForm from '../components/AvailabilityForm.tsx';
import { motion } from 'framer-motion';

export default function Availability() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gradient-to-br from-gray-50 to-gray-100 py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Add Availability</h1>
          </motion.div>
          <AvailabilityForm />
        </div>
      </main>
    </div>
  );
}