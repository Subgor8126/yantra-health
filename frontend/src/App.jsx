import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// import AuthCallback from './routes/AuthCallback';
import ProtectedRoutes from './components/ProtectedRoutes';
import AuthFail from './pages/AuthFail';
import { AppHome, Workspace, LandingPage } from './pages';
import theme from './assets/global/theme';
import { ThemeProvider, CssBaseline, Snackbar } from '@mui/material';
import { useAuthCustom } from './hooks/useAuthCustom';
import {PatientDetails} from './components/workspace-components';
import { useSelector, useDispatch } from 'react-redux';
import { setSnackbar } from './redux/slices/snackbarSlice';
import { Alert } from '@mui/material';

function App() {

  const auth = useAuthCustom();
  // REMOVE THE LINE BELOW IN PRODUCTION WITHOUT FAIL
  // auth.isAuthenticated = true
  const snackbar = useSelector((state) => state.snackbar?.snackbarState || { open: false, message: '', severity: 'success' });
  const dispatch = useDispatch();

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
          <Route element={<ProtectedRoutes auth={auth} />}>
            <Route path="app" element={<AppHome />}/>
            <Route path="app/workspace" element={<Workspace />} />
            <Route path="app/workspace/patient/:patient_id" element={<PatientDetails />} />
          </Route>
        </Routes>
      </Router>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => dispatch(setSnackbar({ ...snackbar, open: false }))}>
        <Alert onClose={() => dispatch(setSnackbar({ ...snackbar, open: false }))} severity={snackbar.severity}>
            {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
