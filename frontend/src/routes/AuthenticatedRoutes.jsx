import React from "react";
import { Routes, Route } from "react-router-dom";
import AppHome from "../pages/AppHome";
import Dashboard from "../pages/Dashboard";
// import Files from "../pages/Files";

function AuthenticatedRoutes() {
  return (
    <Routes>
      <Route path="/app" element={<AppHome />} />
      <Route path="/app/dashboard" element={<Dashboard />} />
      {/* <Route path="/app/files" element={<Files />} /> */}
    </Routes>
  );
}

export default AuthenticatedRoutes;
