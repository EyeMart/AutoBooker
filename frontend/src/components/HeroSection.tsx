import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import ImageCarousel from "../components/Carousel";

const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[var(--motion-black)] to-gray-900 text-gray-300 py-20 md:py-32">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl md:text-5xl lg:text-7xl text-center font-bold mx-auto mb-8 leading-tight">
            Putting you back in{" "}
            <span className="font-bond text-[var(--motion-red)]">motion.</span>
          </h1>
          <div className="hidden lg:flex text-1xl md:text-1xl lg:text-3xl text-center font-small mx-auto mb-8 flex justify-between">
            <span>(661) 437-2419</span>
            <span>2229 Chester Avenue, Bakersfield CA, 93301</span>
            <span>License #310103</span>
          </div>

          <div className="lg:hidden text-1xl md:text-2xl lg:text-3xl text-center font-small mx-auto mb-8 leading-tight">
            (661) 437-2419
          </div>
          <div className="lg:hidden text-1xl md:text-2xl lg:text-3xl text-center font-small mx-auto mb-8 leading-tight">
            2229 Chester Avenue, Bakersfield CA, 93301
          </div>
          <div className="lg:hidden text-1xl md:text-2xl lg:text-3xl text-center font-small mx-auto mb-8 leading-tight">
            License #310103
          </div>
        </motion.div>

        {/* Right Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <ImageCarousel />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col mt-10 justify-center sm:flex-row gap-4">
            <Link
              to="/book-appointment"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[var(--motion-blue)] text-gray-200 font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Book Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            {/* <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900">
              Learn More
            </button> */}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
