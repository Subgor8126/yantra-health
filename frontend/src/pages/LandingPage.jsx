import React from "react";
import { useAuth } from "react-oidc-context";

function LandingPage() {

  // const cognitoDomain = "https://us-east-1qagkafshk.auth.us-east-1.amazoncognito.com";
  // const clientId = "1tm8ic8qk1sbamfkc166ja3q2u";
  // const redirectUri = "http://localhost:8000/auth/callback";

  // const handleSignup = () => {
  //   const signupUrl = `${cognitoDomain}/signup?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;
  //   window.location.href = signupUrl;
  // };
  const auth = useAuth();

  return (
    <div>
      <h1>Welcome to Yantra!</h1>
      <button onClick={() => auth.signinRedirect()}>Sign Up</button>
    </div>
  );
}

export default LandingPage;
