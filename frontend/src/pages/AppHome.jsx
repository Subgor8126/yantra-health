import React from "react";
import { Link } from "react-router-dom";

function AppHome() {
  return (
    <div>
      <h1>Welcome back!</h1>
      <nav>
        <Link to="/app/dashboard">Dashboard</Link>
        {/* <Link to="/app/files">Files</Link> */}
      </nav>
    </div>
  );
}

export default AppHome;
