import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// import AuthCallback from './routes/AuthCallback';
import ProtectedRoutes from './components/ProtectedRoutes';
import AuthFail from './pages/AuthFail';
import { AppHome, Workspace, LandingPage } from './pages';
import theme from './assets/global/theme';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useAuth } from 'react-oidc-context';
import {PatientDetails} from './components/workspace-components';

function App() {

  const auth = useAuth();
  // REMOVE THE LINE BELOW IN PRODUCTION WITHOUT FAIL
  // auth.isAuthenticated = true

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normalizes styles across browsers */}
      <Router>
        <Routes>
          {/* Public route for unauthenticated users */}
           {/* If the user is authenticated, redirect away from the landing page */}
           <Route 
            path="/" 
            element={
              auth.isAuthenticated
                ? <Navigate to="/app" replace /> 
                : <LandingPage />
            } 
          />

          {/* <Route path="/auth/callback" element={<AuthCallback />} /> */}

          {/* <Route path="/authfail" element={<AuthFail />} /> */}

          {/* Protected routes wrapper */}
          <Route element={<ProtectedRoutes />}>
            <Route path="app" element={<AppHome />}/>
            <Route path="app/workspace" element={<Workspace />} />
            <Route path="app/workspace/:patient_id" element={<PatientDetails />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
