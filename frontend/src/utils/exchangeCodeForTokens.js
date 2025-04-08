async function exchangeCodeForTokens(code) {
    console.log("Calling exchangeCodeForTokens")
    const tokenUrl = "https://us-east-1qagkafshk.auth.us-east-1.amazoncognito.com/oauth2/token";
    const clientId = "1tm8ic8qk1sbamfkc166ja3q2u";
    const redirectUri = "http://localhost:8000/auth/callback";

    console.log("code: "+code);

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      client_id: clientId,
      redirect_uri: redirectUri,
    });
  
    try {
      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });
  
      const tokens = await response.json();
  
      if (tokens.access_token) {
        console.log("Got tokens");
        localStorage.setItem("access_token", tokens.access_token);
        localStorage.setItem("id_token", tokens.id_token);
        localStorage.setItem("refresh_token", tokens.refresh_token);
  
        console.log("Authentication successful dude:", tokens);
        navigate("/app"); // Redirect to dashboard
      } else {
        throw new Error("Token exchange failed man");
      }
    } catch (error) {
      console.error("Authentication failed dudette", error);
      alert("Authentication failed");
      navigate("/authfail");
    }
  
  }

  export default exchangeCodeForTokens;