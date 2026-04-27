import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="sticky top-0 z-50 bg-[var(--motion-black)]">
      <nav className="max-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="gap-2 font-bold text-xl text-gray-900 hover:text-gray-700 transition-colors"
          >
            <img src="/motion.png" className="h-auto max-h-12 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex sm:hidden items-center gap-8">
            <Link
              to="/"
              className={`transition-colors ${
                isActive("/")
                  ? "text-[var(--motion-yellow)] font-semibold"
                  : "text-gray-200 hover:text-[var(--motion-yellow)]"
              }`}
            >
              Home
            </Link>
            <Link
              to="/book-appointment"
              className={`transition-colors ${
                isActive("/book-appointment")
                  ? "text-[var(--motion-yellow)] font-semibold"
                  : "text-gray-200 hover:text-[var(--motion-yellow)]"
              }`}
            >
              Book Appointment
            </Link>
          </div>

          {/*Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 rounded-lg"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            <Link
              to="/"
              className={`block py-2 px-4 rounded-lg transition-colors ${
                isActive("/")
                  ? "bg-gray-100 text-gray-900 font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/book-appointment"
              className={`block py-2 px-4 rounded-lg transition-colors ${
                isActive("/book-appointment")
                  ? "bg-gray-100 text-gray-900 font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Book Appointment
            </Link>
            {/* <Link
              to="/auth"
              className="block mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In
            </Link> */}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
