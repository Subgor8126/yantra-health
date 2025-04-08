import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";
import exchangeCodeForTokens from "../utils/exchangeCodeForTokens";

const AuthCallback = () => {
  const auth = useAuth();
  console.log(auth);
  const navigate = useNavigate();
  useEffect(() => {
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authCode = urlParams.get("code");
  
      if (authCode) {
        await exchangeCodeForTokens(authCode);
      } else {
        console.error("No authorization code found");
        navigate("/authfail");
      }
    };
  
    handleAuthCallback();
  }, [navigate]);
  

  return <div>Authenticating...</div>;
};

export default AuthCallback;