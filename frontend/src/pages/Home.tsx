import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection.tsx";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      <Footer />
    </div>
  );
}
