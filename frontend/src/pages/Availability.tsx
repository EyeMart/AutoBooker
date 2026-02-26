import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import AvailabilityForm from '../components/AvailabilityForm.tsx';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Availability() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    
    const checkAdmin = async () => { 
      try {
        const roleOptions = {
          method: 'GET',
          credentials: 'include' as RequestCredentials,
          headers: { 'Content-Type': 'application/json' }
        };
        const roleResponse = await fetch('/api/role', roleOptions);
        if (!roleResponse.ok){
          throw new Error;  
        }
        const role = await roleResponse.json()
    
        if (role.role == "customer"){
          navigate("/");
        }
      } catch (err) {
        navigate("/signin");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [navigate]);

  if (loading) return <p>Checking permissions...</p>;



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