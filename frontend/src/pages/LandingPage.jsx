import React from "react";
import { useAuth } from "react-oidc-context";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import exchangeCodeForTokens from "../utils/exchangeCodeForTokens";

function LandingPage() {

  // const cognitoDomain = "https://us-east-1qagkafshk.auth.us-east-1.amazoncognito.com";
  // const clientId = "1tm8ic8qk1sbamfkc166ja3q2u";
  // const redirectUri = "http://localhost:8000/auth/callback";

  // const handleSignup = () => {
  //   const signupUrl = `${cognitoDomain}/signup?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;
  //   window.location.href = signupUrl;
  // };
  const auth = useAuth();
  console.log(auth);
  console.log("Le auth object^^^^^")
  // const [count, setCount] = useState(0);
  // useEffect(() => {

  //   // Log the count whenever the component re-renders
  //   console.log("from landing page for time: " + count);
  //   console.log("the count:" + count);
  //   // Increment count on each render
  // }, [count]);

  // useEffect(()=> {
  //   setCount(prevCount => prevCount + 1);
  // }, [])
 
  
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated){
      const tokens = JSON.stringify({ 
        access_token: auth.user?.access_token,
        refresh_token: auth.user?.refresh_token,
        id_token: auth.user?.id_token
      });
      console.log("Got them goddamn tokens")
      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("id_token", tokens.id_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);
    
      console.log("Authentication successful dude:", tokens);
      if (!window.location.pathname.startsWith("/app")) {
        navigate("/app"); // Redirect to dashboard only if not already there
      }
    }
  }, [auth.isAuthenticated, navigate]);

  if (auth.error) {
    console.log("_____________error_________________")
    console.log(auth.error);
    console.log("_____________error_________________")
    return <div>Encountering error... {auth.error.message}</div>;
  }

  // useEffect(() => {
  //   const handleAuthCallback = async () => {
  //     const urlParams = new URLSearchParams(window.location.search);
  //     const authCode = urlParams.get("code");
  
  //     if (authCode) {
  //       await exchangeCodeForTokens(authCode);
  //     } else {
  //       console.error("No authorization code found");
  //       navigate("/authfail");
  //     }
  //   };
  
  //   handleAuthCallback();
  // }, [navigate]);

  return (
    <div>
      <h1>Welcome to Yantra!</h1>
      <button onClick={() => auth.signinRedirect()}>Sign Up</button>
    </div>
  );
}

export default LandingPage;
