import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_QAGkAfsHK",
  client_id: "1tm8ic8qk1sbamfkc166ja3q2u",
  redirect_uri: "http://localhost:8000/",
  response_type: "code",
  scope: "email openid phone",
};

createRoot(document.getElementById('root')).render(
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
)
