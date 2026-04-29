import React from "react";
import { Theme } from "@radix-ui/themes";
import { ToastContainer } from "react-toastify";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./src/pages/Home";
import Appointments from "./src/pages/Appointments.tsx";
import Auth from "./src/pages/Auth.tsx";
import Admin from "./src/pages/Admin.tsx";
import NotFound from "./src/pages/NotFound";
import ManageAppointment from "./src/pages/Manage";

const App: React.FC = () => {
  return (
    <Theme appearance="inherit" radius="large" scaling="100%">
      <Router>
        <main className="min-h-screen font-sans">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book-appointment" element={<Appointments />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/appointments/:id" element={<ManageAppointment />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            newestOnTop
            closeOnClick
            pauseOnHover
          />
        </main>
      </Router>
    </Theme>
  );
};

export default App;
