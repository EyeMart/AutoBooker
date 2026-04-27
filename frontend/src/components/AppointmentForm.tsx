import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";

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
    notes: optionalString(z.string()),
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

const AppointmentForm: React.FC = () => {
  const [carModels, setModels] = useState<string[]>([]);
  const [carMakes, setMakes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormInput, any, AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  });

  const selectedYear = watch("year");
  const selectedMake = watch("make");
  const selectedModel = watch("model");
  const selectedVin = watch("vin");

  const excludeSet = new Set([
    "1955 CUSTOM BELAIR",
    "A & O",
    "AAS",
    "ABI",
    "AC PROPULSION",
    "ALEXANDER DENNIS LIMITED",
    "ALFA ROMEO",
    "ALKANE",
    "ALLARD MOTOR WORKS",
    "ALLIANZ SWEEPER COMPANY",
    "AM GENERAL",
    "AMD",
    "AMERICAN LAFRANCE",
    "AMERICAN MOTORS",
    "AMERICAN TRUCK COMPANY",
    "AMERITECH CORPORATION",
    "AMPHI-RANGER",
    "ANHUI ANKAI",
    "APS SYSTEMS",
    "ARBOC",
    "ARMBRUSTER STAGEWAY",
    "ASTON MARTIN",
    "ASUNA",
    "ATLANTA FABRICATING & EQUIPMENT CO",
    "AUTOCAR",
    "AUTOCAR INDUSTRIES",
    "AUTOCAR LTD",
    "AUTODELTA USA INC",
    "AUTOKAD",
    "AUTOMOBILI PININFARINA",
    "AVANTI",
    "AVERA MOTORS",
    "AZURE DYNAMIC INC.",
    "AZURE DYNAMICS",
    "BACKDRAFT",
    "BADGER EQUIPMENT",
    "BAKKURA MOBILITY",
    "BALLARD POWER SYSTEMS INC.",
    "BALLISTIC",
    "BBC",
    "BEIQI FOTON MOTOR / BEIJING BUS BRANCH",
    "BENTLEY",
    "BERTONE",
    "BEYOND ROADS",
    "BISON MOTORS",
    "BLACKWATER",
    "BLUE ARC",
    "BLUE BIRD",
    "BLUECAR",
    "BORAH",
    "BOULDER ELECTRIC VEHICLE",
    "BRAIN UNLIMITED",
    "BREMACH",
    "BRIGHTDROP",
    "BTL",
    "BUG MOTORS",
    "BUGATTI",
    "BUSSCAR",
    "BXR",
    "BYD",
    "C-R CHEETAH RACE CARS",
    "CALAVERAS MFG. INC.",
    "CALIFORNIA",
    "CALMOTORS",
    "CAMELOT",
    "CAMI",
    "CANOO",
    "CAPACITY TRUCKS",
    "CARBODIES",
    "CARE INDUSTRIES LTD",
    "CARROCERIAS AYATS",
    "CATERPILLAR",
    "CCC",
    "CENNTRO",
    "CHANCE COACH",
    "CHANJE",
    "CHECKER",
    "CLASSIC ROADSTERS",
    "CLASSIC SPORTS CARS",
    "CLASSIC TROLLEY",
    "CLENET",
    "CLENET COACHWORKS",
    "COACHWORKS",
    "COAST AUTONOMOUS",
    "COBRA CARS",
    "CODA",
    "COLLINS",
    "CONSULIER",
    "CONSULIER GTP",
    "CONTEMPORARY CLASSIC CARS (CCC)",
    "COSTIN SPORTS CAR",
    "COUNTRY COACH",
    "CRANE CARRIER COMPANY (CCC)",
    "CREATIVE COACHWORKS",
    "CREATIVE COACHWORKS INC.",
    "CRISMON MOBILE CLASSICS",
    "CROSS LANDER OF NORTH AMERICA INC.",
    "CROWN COACH CORPORATION",
    "CROWN ENERGY TECHNOLOGIES",
    "CRUISE",
    "CX AUTOMOTIVE",
    "CZINGER",
    "DAEWOO",
    "DAIHATSU",
    "DAIMLER",
    "DAYTONA COACH BUILDERS",
    "DELOREAN",
    "DENNIS",
    "DENNIS EAGLE",
    "DESERT POWER WAGON",
    "DESIGNLINE",
    "DESIGNLINE INTERNATIONAL HOLDINGS",
    "DESIGNLINE USA",
    "DESOTO MOTORS",
    "DIAMOND HEAVY VEHICLE SOLUTIONS",
    "DIAMOND REO",
    "DINA AUTOBUSES",
    "DONGFENG",
    "DUTCHER",
    "E-ONE",
    "EAGLE",
    "EAGLE COACH CORPORATION",
    "EBUSCO",
    "ECOCAR",
    "EFFICIENT DRIVETRAINS, INC.",
    "ELDORADO NATIONAL",
    "ELECTRIC CAR COMPANY",
    "ELECTRIC MOBILE CARS",
    "ELECTRIC VEHICLES INTERNATIONAL",
    "ELGIN SWEEPER CO",
    "ELITE MOTOR SALES",
    "ELKINGTON",
    "ELMS",
    "EMA",
    "ENGINE CONNECTION",
    "ENVIROTECH DRIVE SYSTEMS INCORPORATED",
    "ENVIROTECH DRIVE SYSTEMS INCORPORATED (EVT)",
    "EPV CORPORATION",
    "EQUUS AUTOMOTIVE",
    "ESCORT",
    "ETI ELECTRIC TRANSIT INC",
    "EV AMERICA",
    "EV INNOVATIONS",
    "EV PORTABLE",
    "EVOBUS",
    "EXCALIBUR AUTOMOBILE CORPORATION",
    "EXECUCOACH INC",
    "EXPRESS SHUTTLE SERVICE",
    "FALCON",
    "FALCON MOTORS",
    "FAW JIAXING HAPPY MESSENGER",
    "FEATHERLITE VOGUE",
    "FEDERAL MOTORS INC",
    "FERRARI",
    "FF",
    "FIAT",
    "FISKER",
    "FLXIBLE",
    "FORETRAVEL",
    "FORMULA 1 STREET COM",
    "FORTUNESPORT VES",
    "FREIGHTLINER",
    "FRONTLINE",
    "FWD",
    "GEMILANG",
    "GENERAL PURPOSE VEHICLES",
    "GENESIS",
    "GEO",
    "GILLIG",
    "GLICKENHAUS",
    "GLOBAL ENVIRONMENTAL PRODUCTS INC",
    "GLOBAL FABRICATORS",
    "GRANDE WEST",
    "GREEN MACHINES",
    "GREENKRAFT",
    "GREENPOWER",
    "GRUMMAN",
    "GRUPPE B",
    "GULLWING INTERNATIONAL MOTORS, LTD.",
    "HBC GROUP LLC",
    "HEDLEY STUDIOS",
    "HERCULES",
    "HERITAGE",
    "HINO",
    "HMC",
    "HOLDEN",
    "HOMETOWN MFG",
    "HUMMER",
    "HUMMINGBIRDEV",
    "HUMVEE",
    "HUNTER AUTOMOTIVE GROUP, INC",
    "HUNTER DESIGN GROUP, LLC",
    "IC BUS",
    "IEV",
    "IEV CORPORATION / IEV",
    "IKARUS USA",
    "INDIANA PHOENIX INC",
    "INEOS",
    "INFINITI",
    "INTERNATIONAL",
    "INTERNATIONAL TRANSIT SYSTEM",
    "INVADER COACH MANUFACTURING INC.",
    "INZURO",
    "IRISBUS FRANCE",
    "IRIZAR",
    "IRON GURU CUSTOMS",
    "ISUZU",
    "IVES MOTORS CORPORATION (IMC)",
    "JAC 427",
    "JAGUAR",
    "JASPER'S HOT RODS LLC",
    "JBT",
    "JEEP",
    "JERR-DAN",
    "JIANGXI KAMA BUSINESS BUS CO.",
    "JINMAYI",
    "JLG",
    "KALMAR INDUSTRIES LLC",
    "KANDI",
    "KARMA",
    "KARSAN",
    "KENWORTH",
    "KEPLER MOTORS",
    "KEYU",
    "KIA",
    "KIEPE",
    "KIMBLE",
    "KIMBLE CHASSIS",
    "KINDIG",
    "KME",
    "KOENIGSEGG",
    "KONDOR COACH BUILDERS",
    "KORANDO",
    "KOVATCH MOBILE EQUIPMENT",
    "KSM INC.",
    "KUBVAN",
    "KUNKE",
    "LA EXOTICS",
    "LAFORZA",
    "LAMBORGHINI",
    "LANCIA",
    "LAND ROVER",
    "LAND ROVER SANTANA",
    "LEBER COACH MANUFACTURING",
    "LIMOS BY TIFFANY",
    "LIMOUSINE MANUFACTURING",
    "LINCOLN",
    "LION",
    "LION ELECTRIC MANUFACTURING USA INC.",
    "LITE CAR",
    "LODAL",
    "LONDON",
    "LONDONCOACH INC",
    "LONESTAR SPECIALTY VEHICLES",
    "LORDSTOWN",
    "LOTUS",
    "LUCID",
    "LUMEN",
    "M-B COMPANIES, INC.",
    "MACK",
    "MAGNUM",
    "MAHINDRA",
    "MAKING YOU MOBILE",
    "MANA",
    "MARMON MOTOR CO",
    "MASERATI",
    "MATRIX MOTOR COMPANY",
    "MAUCK SPECIAL VEHICLES",
    "MAXIM INC.",
    "MAYBACH",
    "MAYHEM AUTOWORKZ",
    "MCLAREN",
    "MCNEILUS",
    "MERCEDES-BENZ",
    "MERCURY",
    "MERKUR",
    "METRO TRAM",
    "METROLINA",
    "MEYERS MANX",
    "MGS GRAND SPORT (MARDIKIAN)",
    "MILLENNIUM TRANSIT SERVICES",
    "MINI",
    "MINI BIG TRUCKS",
    "MINICARS",
    "MITSUBISHI FUSO",
    "MK SPORTSCARS",
    "MOBILE ARMOURED VEHICLE",
    "MOBILE ENERGY SOLUTIONS",
    "MOKE",
    "MOSLER",
    "MOTOR COACH INDUSTRIES",
    "MULLEN AUTOMOTIVE INC.",
    "MYCAR",
    "NABI",
    "NAFFCO",
    "NATIONAL OILWELL VARCO",
    "NAVISTAR",
    "NAVYA INC.",
    "ND",
    "NEIRA INDUSTRIES INC.",
    "NEOPLAN",
    "NEW AUTOS INC.",
    "NEW FLYER",
    "NEWELL",
    "NIKOLA",
    "NJD AUTOMOTIVE LLC",
    "NOVABUS",
    "NUENERGY",
    "OLDSMOBILE",
    "OPEL",
    "OPTIMA",
    "ORANGE EV LLC",
    "ORION BUS",
    "OSHKOSH",
    "OSPREY CUSTOM 4X4",
    "OTTAWA BRIMONT CORPORATION",
    "OUTABOUT",
    "PAGANI",
    "PANOZ",
    "PANTHER",
    "PAS",
    "PATRIOT ENERGY SERVICES",
    "PENSKE",
    "PETERBILT",
    "PEUGEOT",
    "PHEONIX",
    "PHOENIX",
    "PHOENIX CRUISER",
    "PHOENIX MOTORCARS",
    "PHOENIX SPORTS CARS, INC.",
    "PHOENIX TRX",
    "PIERCE MANUFACTURING",
    "PININFARINA",
    "PLYMOUTH",
    "POLESTAR",
    "PONTIAC",
    "PORSCHE",
    "PRECEDENT",
    "PRECISION COACH INC.",
    "PREVOST",
    "PROTECTED VEHICLES",
    "PROTERRA",
    "QUICKLOADZ",
    "RAGE",
    "RAINIER TRUCK AND CHASSIS",
    "RALLY SPORT",
    "RAM",
    "RENAISSANCE",
    "RENAULT",
    "REVOLOGY",
    "RIDE",
    "RIG WORKS",
    "RIMAC",
    "RIVIAN",
    "ROCKET SLED MOTORS",
    "ROCKLAND COACH WORKS",
    "ROLLS-ROYCE",
    "ROSENBAUER",
    "RPM",
    "RS SPIDER",
    "RTDI",
    "RUF",
    "S.T.I",
    "SAAB",
    "SABRE BUS & COACH CORPORATION",
    "SABRE LUXURY COACH INC.",
    "SALEEN",
    "SANTANA",
    "SANY",
    "SATURN",
    "SAW",
    "SCAMMELL",
    "SCANIA",
    "SCOUT",
    "SCUDERIA CAMERON GLICKENHAUS (SCG)",
    "SEAGRAVE",
    "SERVICE KING MANUFACTURING",
    "SETRA",
    "SF MOTORS INC.",
    "SHAOLIN BUS",
    "SHAY REPRODUCTION",
    "SHELBY",
    "SILVER EAGLE BUS MANUFACTURING",
    "SILVER MOTOR COACH",
    "SIMON-DUPLEX",
    "SLATE",
    "SMART",
    "SMIT",
    "SMITH ELECTRIC VEHICLES",
    "SNOWBLAST-SICARD, INC.",
    "SOLECTRIA",
    "SOUTHFIELD CLASSICS",
    "SPARTAN FIRE",
    "SPARTAN MOTORS",
    "SPRINTER (DODGE OR FREIGHTLINER)",
    "SPV",
    "SPYKER",
    "SSC NORTH AMERICA",
    "STANFORD CUSTOMS",
    "STERLING MOTOR CAR",
    "STERLING TRUCK",
    "STOUTBILT",
    "SUPERCAR SYSTEM",
    "SUPERIOR COACHES",
    "SUTPHEN",
    "T SERIES LLC",
    "TATSA",
    "TELO",
    "TEMSA",
    "TENCO",
    "TERBERG BENSCHOP B.V.",
    "TERBERG TAYLOR",
    "TEREX ADVANCE MIXER",
    "TERN",
    "TERRAFUGIA",
    "TESLA",
    "TH!NK",
    "THE VEHICLE PRODUCTION GROUP",
    "THOMAS BUILT",
    "THUNDERVOLT",
    "TICO MANUFACTURING DIVISION",
    "TIGER TRUCK",
    "TMC",
    "TOTAL ELECTRIC VEHICLES",
    "TOYOTA",
    "TRANSMARK",
    "TRANSPORTATION TECHNIQUES",
    "TRANSPOWER",
    "TRIDENT MOTOR",
    "TRIUMPH",
    "TROLLEY BOATS",
    "TRUCK EQUIPMENT CORPORATION(TEC)",
    "UCC",
    "UD",
    "UKEYCHEYMA",
    "US SPECIALTY VEHICLES LLC",
    "USA MOTOR CORPORATION",
    "USA MPV CO",
    "UTILIMASTER MOTOR CORPORATION",
    "VAN HOOL",
    "VECTOR AEROMOTIVE CORPORATION",
    "VECTOR MIXER",
    "VEOLECTRA",
    "VIA MOTORS, INC.",
    "VICINITY",
    "VINFAST",
    "VINTAGE AUTO",
    "VINTAGE CRUISER",
    "VINTAGE MICROBUS",
    "VINTAGE ROVER",
    "VIRONEX",
    "VISION INDUSTRIES",
    "VOLKSWAGEN",
    "VOLTZ",
    "VOLVO TRUCK",
    "VOSSLOH",
    "WARHAWK PERFORMANCE",
    "WAUSAU EQUIPMENT COMPANY",
    "WAYNE WHEELED VEHICLES",
    "WESTERN STAR",
    "WESTFALL MOTORS CORP.",
    "WHEATRIDGE",
    "WHITE",
    "WHITEGMC",
    "WINDROSE TECHNOLOGY",
    "WINNEBAGO",
    "WORKHORSE",
    "WORLD TRANSPORT AUTHORITY",
    "WRIGHTBUS",
    "XOS",
    "YANGTSE RIVER",
    "YESTER YEAR AUTO",
    "YUGO",
    "ZEEKR",
    "ZELIGSON",
    "ZM TRUCKS",
    "ZOOX",
    "ZZKNOWN",
  ]);

  const services = [
    "General Repairs",
    "Oil Change",
    "Electrical Systems",
    "Brake Service",
    "Tire Service",
    "Diagnostics",
    "Other",
  ];

  const timeSlots = [
    "08:00 AM - 09:30 AM",
    "10:00 AM - 11:30 AM",
    "12:00 PM - 01:30 PM",
    "02:00 PM - 03:30 PM",
    "04:00 PM - 05:30 PM",
  ];

  // getting all makes
  useEffect(() => {
    const fetchOptions = async () => {
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

    fetchOptions();
  }, []);

  // gettings models from selected make and year
  useEffect(() => {
    const controller = new AbortController();

    const fetchOptions = async () => {
      if (!selectedMake || !selectedYear) {
        setModels([]);
        return;
      }

      setLoadingModels(true);
      setModels([]);

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

    fetchOptions();

    return () => controller.abort();
  }, [selectedMake, selectedYear]);

  const onSubmit = async (data: AppointmentFormData) => {
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
          notes: data.notes,
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
      const response = await fetch("/api/appointments", appointmentOptions);
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
      className="bg-gray-600 rounded-2xl shadow-xl text-gray-300 p-8 md:p-12"
    >
      <h2 className="text-3xl font-bold text-gray-300 mb-4">
        Book Your Appointment
      </h2>

      <h3 className="text-lg font-bold text-gray-300">Basic information</h3>
      <hr className="mt-2 mb-4 border-2" />

      <div className="grid grid-cols-1 md:grid-cols-2 text-gray-300 gap-6 mt-2 mb-6">
        {/* First Name */}
        <div>
          <label className="block text-sm font-semibold mb-2">First Name</label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="John"
              {...register("first_name")}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <label className="block text-sm font-semibold text-gray-300 mb-2">
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
          <label className="block text-sm font-semibold text-gray-300 mb-2">
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
          <label className="block text-sm font-semibold text-gray-300 mb-2">
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
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Preferred Date
          </label>
          <div className="relative">
            <input
              type="date"
              {...register("date")}
              className="w-full px-4 py-3 border text-gray-400 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
          )}
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Preferred Time
          </label>
          <div className="relative">
            <select
              {...register("timeslot")}
              className="w-full px-4 py-3 border text-gray-400 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a time</option>
              {timeSlots.map((slot) => (
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

      <h3 className="text-lg font-bold text-gray-300">
        Vin or Year, Make, & Model
      </h3>
      <hr className="mt-2 mb-4 bg-neutral-quaternary border-2" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 mb-6">
        {/* Vin */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Vin Number
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Vin number"
              {...register("vin")}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {errors.vin && (
            <p className="text-red-500 text-sm mt-1">{errors.vin.message}</p>
          )}
        </div>

        <div>
          {/* Make */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Make
            </label>
            <div className="relative">
              <select
                {...register("make")}
                className="w-full px-4 py-3 h-12 border text-gray-400 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Car Make</option>
                {carMakes.map((make) => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>

              {selectedMake === "Other" && (
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          {/* Year */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2 mt-2">
              Year
            </label>
            <div className="relative">
              <select
                {...register("year")}
                className="w-full px-4 py-3 h-12 border text-gray-400 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          {/* Model */}
          {
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 mt-2">
                Model
              </label>
              <div className="relative">
                <select
                  {...register("model")}
                  disabled={loadingModels || !selectedYear || !selectedMake}
                  className="w-full px-4 py-3 h-12 border text-gray-400 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">
                    {" "}
                    {loadingModels ? "Loading models..." : "Select a model"}
                  </option>
                  {carModels.map((model) => (
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

      <h3 className="text-lg font-bold text-gray-300">
        Mileage, Service, and Notes
      </h3>
      <hr className="mt-2 mb-4 bg-neutral-quaternary border-2" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 mb-6">
        {/* Mileage */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Mileage (Optional)
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Car Mileage"
              {...register("mileage")}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Service Type
          </label>
          <select
            {...register("service")}
            className="w-full px-4 py-3 border border-gray-300 text-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Additional Notes (Optional)
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              placeholder="Tell us more about your vehicle or service needs..."
              {...register("notes")}
              rows={4}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-[var(--motion-blue)] text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        {isSubmitting ? "Booking..." : "Book Appointment"}
      </button>
    </motion.form>
  );
};

export default AppointmentForm;
