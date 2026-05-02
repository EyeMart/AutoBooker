import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { User, Mail, Phone, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { services, excludeSet, timeSlots } from "../lib/constants";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { apiFetch } from "../lib/api";

const optionalString = (schema: z.ZodString) =>
  z.preprocess((val) => (val === "" ? undefined : val), schema.optional());

const appointmentSchema = z
  .object({
    first_name: z.string().min(1, "Please include your first name"),
    last_name: z.string().min(1, "Please include your last name"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
    date: z.string().min(1, "Please select a date"),
    timeslot: z.string().min(1, "Please select a time"),
    service: z.string().min(1, "Please select a service"),
    make: optionalString(z.string().min(1, "Please include your car's make")),
    other_make: optionalString(
      z.string().min(1, "Please include your car's make"),
    ),
    model: optionalString(z.string().min(1, "Please include your car's model")),
    other_model: optionalString(
      z.string().min(1, "Please include your car's model"),
    ),
    year: optionalString(z.string().min(1, "Please include your car's year")),
    mileage: z.preprocess(
      (val) => (val === "" ? undefined : Number(val)),
      z
        .number({ invalid_type_error: "Mileage must be a number" })
        .int("Mileage must be a whole number")
        .nonnegative("Mileage must be positive")
        .optional(),
    ),
    comments: optionalString(z.string()),
    vin: optionalString(
      z.string().length(17, "Please include your car's full vin number"),
    ),
  })
  .refine(
    (data) => {
      const hasVin = !!data.vin;
      const hasManual = data.make && data.model && data.year;

      return hasVin || hasManual;
    },
    {
      message: "Provide either VIN or year, make, and model",
      path: ["vin"], // where error shows
    },
  );

type AppointmentFormData = z.output<typeof appointmentSchema>;

type AppointmentFormInput = z.input<typeof appointmentSchema>;

type AppointmentFormProps = {
  defaultValues?: Partial<AppointmentFormInput>;
  onSubmitOverride?: (data: AppointmentFormData) => Promise<void>;
};

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  defaultValues,
  onSubmitOverride,
}) => {
  const [carModels, setModels] = useState<string[]>([]);
  const [carMakes, setMakes] = useState<string[]>([]);
  const [availableTimes, setTimes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const controller = new AbortController();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AppointmentFormInput, any, AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        year: defaultValues.year ? defaultValues.year.toString() : "2002",
        date: defaultValues.date ? defaultValues.date.split("T")[0] : undefined,
        make: defaultValues.make ?? "",
        model: defaultValues.model ?? "",
        timeslot: defaultValues.timeslot,
      });
    }
  }, [defaultValues, reset]);

  const selectedYear = watch("year");
  const selectedMake = watch("make");
  const selectedModel = watch("model");
  const selectedVin = watch("vin");
  const selectedDate = watch("date");
  const selectedTimeslot = watch("timeslot");

  const makeOptions: string[] = Array.from(
    new Set([...(selectedMake ? [selectedMake] : []), ...carMakes]),
  ).filter((x): x is string => typeof x === "string");

  const modelOptions: string[] = Array.from(
    new Set([...(selectedModel ? [selectedModel] : []), ...carModels]),
  ).filter((x): x is string => typeof x === "string");

  const timeslotOptions: string[] = Array.from(
    new Set([
      ...(selectedTimeslot ? [selectedTimeslot] : []),
      ...availableTimes,
    ]),
  ).filter((x): x is string => typeof x === "string");

  const fetchModels = async () => {
    if (!selectedMake || !selectedYear) {
      setModels([]);
      return;
    }

    setLoadingModels(true);

    try {
      const vehicleTypes = ["car", "truck", "mpv"];

      const requests = vehicleTypes.map((type) => {
        const url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${selectedMake}/modelyear/${selectedYear}/vehicletype/${type}?format=json`;

        return fetch(url, { signal: controller.signal }).then((res) =>
          res.json(),
        );
      });

      const results = await Promise.all(requests);

      const allModels = results.flatMap((data) =>
        data.Results.map((item: any) => String(item.Model_Name).trim()),
      );

      setModels([...new Set(allModels)].sort());
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error fetching models:", error);
      }
    } finally {
      setLoadingModels(false);
    }
  };

  const fetchMakes = async () => {
    try {
      const vehicleTypes = ["car", "truck", "mpv"];

      const requests = vehicleTypes.map((type) =>
        fetch(
          `https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/${type}?format=json`,
        ).then((res) => res.json()),
      );

      const results = await Promise.all(requests);

      const formattedOptions = results.flatMap((data) =>
        data.Results.map((item: any) => String(item.MakeName).trim()).filter(
          (make: string) => !excludeSet.has(make),
        ),
      );

      setMakes([...new Set(formattedOptions)].sort());
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  };

  // getting all makes
  useEffect(() => {
    fetchMakes();
  }, []);

  // gettings models from selected make and year
  useEffect(() => {
    fetchModels();

    return () => controller.abort();
  }, [selectedMake, selectedYear]);

  // get valid timeslots
  useEffect(() => {
    const fetchTimes = async () => {
      if (!selectedDate) {
        setTimes([]);
        return;
      }

      setLoadingTimes(true);

      try {
        const res = await apiFetch(`/api/unavailableslots?on=${selectedDate}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch times");

        const times = await res.json();

        const availableTimes = [...timeSlots, ...times].filter(
          (x, _, all) => all.indexOf(x) === all.lastIndexOf(x),
        );
        setTimes(availableTimes);
      } catch (error: any) {
        console.error("Error fetching times:", error);
      } finally {
        setLoadingTimes(false);
      }
    };
    fetchTimes();
  }, [selectedDate]);

  const onSubmit = async (data: AppointmentFormData) => {
    if (onSubmitOverride) {
      return onSubmitOverride(data);
    }
    setIsSubmitting(true);

    if (selectedVin) {
      try {
        const result = (
          await fetch(
            `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${selectedVin}?format=json`,
          )
        ).json();
        console.log(result);
      } catch (error: any) {
        console.error("Error fetching models:", error);
      }
    }

    const finalMake = data.other_make ? data.other_make : data.make;
    const finalModel = data.other_model ? data.other_model : data.model;

    try {
      const appointmentOptions = {
        method: "POST",
        credentials: "include" as RequestCredentials,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_comments: data.comments,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          make: finalMake,
          model: finalModel,
          year: data.year,
          mileage: data.mileage,
          date: data.date,
          timeslot: data.timeslot,
          service: data.service,
        }),
      };
      const response = await apiFetch("/api/appointments", appointmentOptions);
      if (!response.ok) {
        throw new Error();
      }
      toast.success("Appointment booked successfully! We'll confirm shortly.");
      reset();
    } catch (error) {
      toast.error("Failed to book appointment. Please try again.");
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
      className="bg-gray-300 rounded-xl shadow text-gray-300 p-8 md:p-12"
    >
      <h3 className="text-lg font-bold text-gray-800">Basic information</h3>
      <hr className="border-gray-400 border-2" />
      <div className="grid grid-cols-1 md:grid-cols-2 text-gray-800 gap-6 mt-4 mb-6">
        {/* First Name */}
        <div>
          <label className="block text-sm font-semibold mb-2">First Name</label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-5 h-5 text-gray-800" />
            <input
              type="text"
              placeholder="John"
              {...register("first_name")}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent "
            />
          </div>
          {errors.first_name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.first_name.message}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Last Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Doe"
              {...register("last_name")}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {errors.last_name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.last_name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="john@example.com"
              {...register("email")}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              placeholder="1234567890"
              {...register("phone")}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Preferred Date
          </label>

          <DayPicker
            mode="single"
            selected={
              selectedDate ? new Date(selectedDate + "T00:00:00") : undefined
            }
            onSelect={(date) => {
              if (!date) return;
              const value = date.toLocaleDateString("en-CA");
              setValue("date", value, { shouldValidate: true });
            }}
            disabled={[{ before: new Date() }, { dayOfWeek: [0, 6] }]}
            className="bg-white text-gray-800 rounded-lg border border-gray-300 p-3 text-sm"
            classNames={{
              months: "flex justify-center",
              day: "rounded-md hover:bg-blue-200 transition-colors",
              selected: "bg-blue-600 text-white hover:bg-blue-600",
              today: "text-blue-500 font-bold",
              disabled: "text-gray-300 line-through cursor-not-allowed",
            }}
          />

          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
          )}
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Preferred Time
          </label>
          <div className="relative">
            <select
              {...register("timeslot")}
              disabled={!selectedDate}
              className="w-full px-4 py-3 border text-gray-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">
                {" "}
                {loadingTimes ? "Loading timeslots..." : "Select a time"}
              </option>
              {timeslotOptions.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
          {errors.timeslot && (
            <p className="text-red-500 text-sm mt-1">
              {errors.timeslot.message}
            </p>
          )}
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-800">
        Vin or Year, Make, & Model
      </h3>
      <hr className="border-gray-400 border-2" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 mb-6">
        {/* Vin */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Vin Number
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Vin number"
              {...register("vin")}
              className="w-full px-4 py-3 border text-gray-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {errors.vin && (
            <p className="text-red-500 text-sm mt-1">{errors.vin.message}</p>
          )}
        </div>

        <div>
          {/* Year */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2 ">
              Year
            </label>
            <div className="relative">
              <select
                {...register("year")}
                className="w-full px-4 py-3 h-12 border text-gray-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Car Year</option>
                {[...Array(new Date().getFullYear() - 1984).keys()]
                  .reverse()
                  .map((year) => (
                    <option key={year + 1985} value={year + 1985}>
                      {year + 1985}
                    </option>
                  ))}
                <option value="Other">Other</option>
              </select>
            </div>
            {errors.year && (
              <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>
            )}
          </div>
          {/* Make */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2 mt-2">
              Make
            </label>
            <div className="relative">
              <select
                {...register("make")}
                className="w-full px-4 py-3 h-12 border text-gray-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Car Make</option>
                {makeOptions.map((make) => (
                  <option
                    key={make.substring(0, 1) + make.substring(1).toLowerCase()}
                    value={
                      make.substring(0, 1) + make.substring(1).toLowerCase()
                    }
                  >
                    {make.substring(0, 1) + make.substring(1).toLowerCase()}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>

              {selectedMake === "Other" && (
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  type="text"
                  placeholder="Enter your car's make"
                  {...register("other_make")}
                />
              )}
            </div>

            {errors.make && (
              <p className="text-red-500 text-sm mt-1">{errors.make.message}</p>
            )}
            {errors.other_make && (
              <p className="text-red-500 text-sm mt-1">
                {errors.other_make.message}
              </p>
            )}
          </div>

          {/* Model */}
          {
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2 mt-2">
                Model
              </label>
              <div className="relative">
                <select
                  {...register("model")}
                  disabled={loadingModels || !selectedYear || !selectedMake}
                  className="w-full px-4 py-3 h-12 border text-gray-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">
                    {" "}
                    {loadingModels ? "Loading models..." : "Select a model"}
                  </option>
                  {modelOptions.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>

                {selectedModel === "Other" && (
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="text"
                    placeholder="Enter your car's model"
                    {...register("other_model")}
                  />
                )}
              </div>

              {errors.model && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.model.message}
                </p>
              )}
              {errors.other_model && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.other_model.message}
                </p>
              )}
            </div>
          }
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">
        Mileage, Service, and Comments
      </h3>
      <hr className="border-gray-400 border-2" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 mb-6">
        {/* Mileage */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Mileage (Optional)
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Car Mileage"
              {...register("mileage")}
              className="w-full px-4 py-3 border text-gray-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {errors.mileage && (
            <p className="text-red-500 text-sm mt-1">
              {errors.mileage.message}
            </p>
          )}
        </div>

        {/* Service */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Service Type
          </label>
          <select
            {...register("service")}
            className="w-full px-4 py-3 border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
          {errors.service && (
            <p className="text-red-500 text-sm mt-1">
              {errors.service.message}
            </p>
          )}
        </div>

        {/* Comments */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Additional Comments (Optional)
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              placeholder="Tell us more about your vehicle or service needs..."
              {...register("comments")}
              rows={4}
              className="w-full pl-10 pr-4 py-3 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-[var(--motion-blue)] text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        {isSubmitting && !defaultValues
          ? "Booking..."
          : isSubmitting
            ? "Updating..."
            : !defaultValues
              ? "Book Appointment"
              : "Update Appointment"}
      </button>
    </motion.form>
  );
};

export default AppointmentForm;
