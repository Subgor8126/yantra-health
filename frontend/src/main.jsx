import './utils/amplifyConfig.js'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from "react-oidc-context";
import { store } from './redux/store.js';
import { Provider } from 'react-redux';

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_QAGkAfsHK",
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
  response_type: import.meta.env.VITE_COGNITO_RESPONSE_TYPE,
  scope: "email openid phone",
};

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </Provider>
)
