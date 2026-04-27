import React from "react";
import { Youtube, Instagram, Phone } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-100 border-t-2 border-[var(--motion-red)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="hidden md:flex lg:flex mb-4 justify-between">
          {/* Company Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">Motion Auto Works</h3>
            <p className="text-gray-400 text-sm">Putting you back in motion.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/book-appointment"
                  className="hover:text-white transition-colors"
                >
                  Booking
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a
                  href="tel:+6614372419"
                  className="hover:text-white transition-colors"
                >
                  (661) 437-2419
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Link to="https://www.instagram.com/andradesmobilemechanic/">
                  <Instagram className="w-4 h-4 mt-0.5" />
                </Link>
                <a
                  href="https://www.instagram.com/motionautoworksinc/"
                  className="hover:text-white transition-colors"
                >
                  @motionautoworksinc
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Link to="https://www.youtube.com/@MotionAutoWorksInc">
                  <Youtube className="w-4 h-4 mt-0.5" />
                </Link>
                <a
                  href="https://www.youtube.com/@MotionAutoWorksInc"
                  className="hover:text-white transition-colors"
                >
                  Motion Auto Works
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="md:hidden lg:hidden mb-4">
          {/* Company Info */}
          <div>
            <h3 className="font-bold text-lg mb-2">Motion Auto Works</h3>
            <p className="text-gray-400 text-sm mb-4">
              Putting you back in motion.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/book-appointment"
                  className="hover:text-white transition-colors"
                >
                  Booking
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-2 mt-6">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a
                  href="tel:+6614372419"
                  className="hover:text-white transition-colors"
                >
                  (661) 437-2419
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Link to="https://www.instagram.com/andradesmobilemechanic/">
                  <Instagram className="w-4 h-4 mt-0.5" />
                </Link>
                <a
                  href="https://www.instagram.com/motionautoworksinc/"
                  className="hover:text-white transition-colors"
                >
                  @motionautoworksinc
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Link to="https://www.youtube.com/@MotionAutoWorksInc">
                  <Youtube className="w-4 h-4 mt-0.5" />
                </Link>
                <a
                  href="https://www.youtube.com/@MotionAutoWorksInc"
                  className="hover:text-white transition-colors"
                >
                  Motion Auto Works
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; 2026 Motion Auto Works. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
