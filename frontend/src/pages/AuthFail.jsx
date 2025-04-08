import React from "react";
import { useNavigate } from "react-router-dom";

function AuthFail() {
  const navigate = useNavigate();
  
  const handleGoHome = () => {
    navigate("/"); // Programmatically navigate to the home page
  };

  return (
    <div>
      Authentication Failed. 
      Please <button onClick={handleGoHome}>go back to the home</button> page and try again.
    </div>
  );
}

export default AuthFail;
