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
  other_make: z.string().min(1, 'Please include your car\'s make').optional(),
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
    watch,
    formState: { errors }
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema)
  });

  const selectedMake = watch("make");

  const excludeSet = new Set([
    "1955 CUSTOM BELAIR",
    "A & O",
    "AAS",
    "ABI",
    "AC PROPULSION",
    "ACURA",
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
    "AUDI",
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
    "BMW",
    "BORAH",
    "BOULDER ELECTRIC VEHICLE",
    "BRAIN UNLIMITED",
    "BREMACH",
    "BRIGHTDROP",
    "BTL",
    "BUG MOTORS",
    "BUGATTI",
    "BUICK",
    "BUSSCAR",
    "BXR",
    "BYD",
    "C-R CHEETAH RACE CARS",
    "CADILLAC",
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
    "CHEVROLET",
    "CHRYSLER",
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
    "DATSUN",
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
    "DODGE",
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
    "FORD",
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
    "GMC",
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
    "HONDA",
    "HUMMER",
    "HUMMINGBIRDEV",
    "HUMVEE",
    "HUNTER AUTOMOTIVE GROUP, INC",
    "HUNTER DESIGN GROUP, LLC",
    "HYUNDAI",
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
    "LEXUS",
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
    "MAZDA",
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
    "MITSUBISHI",
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
    "NISSAN",
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
    "SUBARU",
    "SUPERCAR SYSTEM",
    "SUPERIOR COACHES",
    "SUTPHEN",
    "SUZUKI",
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
    "VOLVO",
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
    "ZZKNOWN"
  ]);
  

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
        let response = await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json');
        let data = await response.json();
        const formattedOptions = data.Results
          .filter(item => !excludeSet.has(String(item.MakeName).trim()))
          .map(item => String(item.MakeName).trim())
        response = await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/truck?format=json');
        data = await response.json();
        formattedOptions.push(...data.Results
          .filter(item => (!excludeSet.has(String(item.MakeName).trim()) && !formattedOptions.includes(String(item.MakeName).trim())))
          .map(item => String(item.MakeName).trim()));
        response = await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/mpv?format=json');
        data = await response.json();
        formattedOptions.push(...data.Results
          .filter(item => (!excludeSet.has(String(item.MakeName).trim()) && !formattedOptions.includes(String(item.MakeName).trim())))
          .map(item => String(item.MakeName).trim()));
        setOptions(formattedOptions.sort());
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, []);

  const onSubmit = async (data: AppointmentFormData) => {
    setIsSubmitting(true);

    const finalMake = data.other_make ? data.other_make : data.make;

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
            make: finalMake,
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
            <option value="Other">Other</option>
          </select>

          {selectedMake === "Other" && (
            <input className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              type="text"
              placeholder="Enter your car's make"
              {...register("other_make")}
            />
          )}

          </div>
          {errors.make && <p className="text-red-500 text-sm mt-1">{errors.make.message}</p>}
          {errors.other_make && <p className="text-red-500 text-sm mt-1">{errors.other_make.message}</p>}
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Model</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Car Model"
              {...register('model')}
              className="w-full pl-3 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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