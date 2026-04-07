import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Calendar, Clock, User, Mail, Phone, MessageSquare, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const appointmentSchema = z.object({
  first_name: z.string().min(1, 'Please include your first name'),
  last_name: z.string().min(1, 'Please include your last name'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  date: z.string().min(1, 'Please select a date'),
  timeslot: z.string().min(1, 'Please select a time'),
  service: z.string().min(1, 'Please select a service'),
  location: z.string().min(5, 'Please provide your location'),
  make: z.string().min(1, 'Please include your car\'s make'),
  model: z.string().min(1, 'Please include your car\'s model'),
  year: z.string().min(1, 'Please include your car\'s year'),
  mileage: z.string().optional(),
  notes: z.string().optional()
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

const AppointmentForm: React.FC = () => {
  const [carMakes, setOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema)
  });

  const services = [
    'General Repairs',
    'Oil Change',
    'Electrical Systems',
    'Brake Service',
    'Tire Service',
    'Diagnostics',
    'Other'
  ];

  const timeSlots = [
    '08:00 AM - 09:30 AM',
    '10:00 AM - 11:30 AM',
    '12:00 PM - 01:30 PM',
    '02:00 PM - 03:30 PM',
    '04:00 PM - 05:30 PM'
  ];

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch('/vehicles/GetAllMakes?format=csv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        // Assuming data is an array of { id, name }
        const formattedOptions = data.map(item => ({
          value: item.id,
          label: item.name,
        }));
        setOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, []);

  const onSubmit = async (data: AppointmentFormData) => {
    setIsSubmitting(true);
    try {
      const appointmentOptions = {
          method: 'POST',
          credentials: 'include' as RequestCredentials,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notes: data.notes,
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            phone: data.phone,
            address: data.location,
            make: data.make,
            model: data.model,
            year: data.year,
            mileage: data.mileage,
            date: data.date,
            timeslot: data.timeslot,
            service: data.service
          })
          
        };
      const roleResponse = await fetch('/api/appointments', appointmentOptions);
      if (!roleResponse.ok){
        throw new Error;  
      }
      const role = await roleResponse.json()
      toast.success('Appointment booked successfully! We\'ll confirm shortly.');
      reset();
    } catch (error) {
      toast.error('Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
    >
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Book Your Appointment</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* First Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="John"
              {...register('first_name')}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Doe"
              {...register('last_name')}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="john@example.com"
              {...register('email')}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              placeholder="1234567890"
              {...register('phone')}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="date"
              {...register('date')}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Service Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="123 Main St, City, State"
              {...register('location')}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
        </div>

        {/* Make */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Make</label>
          <div className="relative">
            <select
            {...register('make')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            <option value="">Car Make</option>
            {
            carMakes.map(make => (
              <option key={make} value={make}>{make}</option>
            ))
            }
          </select>
          </div>
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Model</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Car Model"
              {...register('model')}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Car Year"
              {...register('year')}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
        </div>

        {/* Mileage */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Mileage</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Car Mileage"
              {...register('mileage')}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
        </div>

        {/* Service */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Service Type</label>
          <select
            {...register('service')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a service</option>
            {services.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
          {errors.service && <p className="text-red-500 text-sm mt-1">{errors.service.message}</p>}
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Time</label>
          <div className="relative">
            <select
              {...register('timeslot')}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a time</option>
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
          {errors.timeslot && <p className="text-red-500 text-sm mt-1">{errors.timeslot.message}</p>}
        </div>


        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes (Optional)</label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              placeholder="Tell us more about your vehicle or service needs..."
              {...register('notes')}
              rows={4}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        {isSubmitting ? 'Booking...' : 'Book Appointment'}
      </button>
    </motion.form>
  );
};

export default AppointmentForm;