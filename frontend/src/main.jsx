import './utils/amplifyConfig.js'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from "react-oidc-context";
import { store } from './redux/store.js';
import { Provider } from 'react-redux';

const cognitoAuthConfig = {
  authority: import.meta.env.VITE_COGNITO_AUTHORITY,
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
