import React from 'react';
import { Wrench, Zap, Droplet, Gauge, Shield, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface Service {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ServicesSection: React.FC = () => {
  const services: Service[] = [
    {
      icon: <Wrench className="w-8 h-8" />,
      title: 'General Repairs',
      description: 'From brake pads to engine diagnostics, we handle all general automotive repairs.'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Electrical Systems',
      description: 'Battery replacement, alternator repair, and complete electrical diagnostics.'
    },
    {
      icon: <Droplet className="w-8 h-8" />,
      title: 'Oil & Fluid Changes',
      description: 'Regular maintenance including oil, coolant, and transmission fluid services.'
    },
    {
      icon: <Gauge className="w-8 h-8" />,
      title: 'Diagnostics',
      description: 'Advanced computer diagnostics to identify and fix issues quickly.'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Preventive Maintenance',
      description: 'Keep your vehicle running smoothly with our maintenance packages.'
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: 'Local Service',
      description: 'Don\'t worry about making it to a shop, we go to you with equipment on hand.'
    }
  ];

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive automotive services tailored to keep your vehicle in peak condition.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-8 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="text-blue-500 mb-4 group-hover:text-blue-600 transition-colors">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;