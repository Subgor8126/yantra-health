import React from "react";
import { Routes, Route } from "react-router-dom";
import AppHome from "../pages/AppHome";
import Workspace from "../pages/Workspace";
// import Files from "../pages/Files";

function AuthenticatedRoutes() {
  return (
    <Routes>
      <Route path="/app" element={<AppHome />} />
      <Route path="/app/workspace" element={<Workspace />} />
      {/* <Route path="/app/files" element={<Files />} /> */}
    </Routes>
  );
}

export default AuthenticatedRoutes;
