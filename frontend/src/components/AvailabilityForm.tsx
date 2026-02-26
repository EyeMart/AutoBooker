import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

const timeSlots = [
    '08:00 AM - 09:30 AM',
    '10:00 AM - 11:30 AM',
    '12:00 PM - 01:30 PM',
    '02:00 PM - 03:30 PM',
    '04:00 PM - 05:30 PM'
  ];


const availabilitySchema = z.object({
  dates: z.array(z.date()).min(1, "Select at least one date"),
  start_time: z.string().min(1, 'Please select a start time'),
  end_time: z.string().min(1, 'Please select an end time')
})
.superRefine((data, ctx) => {
    // Only compare if both exist

    if (!data.start_time || !data.end_time || !data.dates) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const allAfter = data.dates.every((d) => {
      const dd = new Date(d);
      dd.setHours(0, 0, 0, 0);
      return dd >= today
    });

    if (!allAfter){
      ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["dates"],
      message: "Dates cannot be in the past",
      });
    }

    const start = data.start_time.substring(data.start_time.length - 2) == "PM" && parseInt(data.start_time.substring(0, 2)) < 12? parseInt(data.start_time.substring(0, 2)) + 12: parseInt(data.start_time.substring(0, 2));
    const end = data.end_time.substring(data.end_time.length - 2) == "PM" && parseInt(data.end_time.substring(0, 2)) < 12 ? parseInt(data.end_time.substring(0, 2)) + 12: parseInt(data.end_time.substring(0, 2));

    // Guard invalid parsing
    if (!start || !end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_time"],
        message: "Invalid date/time",
      });
      return;
    }

    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_time"],
        message: "End time must be after start time",
      });
    }
    
  });

type AvailabilityFormData = z.infer<typeof availabilitySchema>;

const AppointmentForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors }
  } = useForm<AvailabilityFormData>({
    resolver: zodResolver(availabilitySchema),
    mode: "onChange"
  });

  const startTime = watch("start_time");

  const { trigger } = useForm();


  React.useEffect(() => {
    if (startTime) trigger("end_time");
  }, [startTime, trigger]);

  const onSubmit = async (data: AvailabilityFormData) => {
    setIsSubmitting(true);
    const start = data.start_time.substring(0, data.start_time.length - 3) + ":00";
    const end = data.end_time.substring(0, data.start_time.length - 3) + ":00";

    const dates: string[] = [];
    for (let i = 0; i < data.dates.length; i++){
        dates.push(`${data.dates[i].getFullYear()}-${data.dates[i].getUTCMonth() + 1}-${data.dates[i].getDate()}`);
    }
    try {
      for (let i = 0; i < dates.length; i++){
        const requestOptions = {
          method: 'POST',
          credentials: 'include' as RequestCredentials,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: dates[i],
            start_time:  start,
            end_time: end
          })
        };
        const response = await fetch('/api/admin/availability', requestOptions);
        if (!response.ok){
          throw new Error;
        }
      
      }
      toast.success('Availability added successfully!');
      reset()
      
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Start Time */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
          <div className="relative">
            <select
              {...register('start_time')}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a time</option>
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
          {errors.start_time && <p className="text-red-500 text-sm mt-1">{errors.start_time.message}</p>}
        </div>

        {/* End Time */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
          <div className="relative">
            <select
              {...register('end_time')}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a time</option>
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
          {errors.end_time && <p className="text-red-500 text-sm mt-1">{errors.end_time.message}</p>}
        </div>
      </div>

      {/* Date*/}
      <div className='grid flex justify-center gap-6 mb-6'>
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Dates</label>
          <Controller
            name="dates"
            control={control}
            render={({ field }) => (
              <DayPicker
                mode="multiple"
                selected={field.value}
                onSelect={(selected) => field.onChange(selected ?? [])}
              />
            )}
          />
        </div>
        {errors.dates && <p className="text-red-500 text-sm mt-1">{errors.dates.message}</p>}
      </div>

      <div className='flex justify-center'>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-40 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        {isSubmitting ? 'Booking...' : 'Create Availability'}
      </button>
      </div>
    </motion.form>
  );
};

export default AppointmentForm;