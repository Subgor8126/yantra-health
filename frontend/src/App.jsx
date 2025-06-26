import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoutes from './components/ProtectedRoutes';
import AuthFail from './pages/AuthFail';
import { AppHome, Workspace, LandingPage, Onboarding, RedirectGate } from './pages'; // 👈 Make sure RedirectHandler and Onboarding are added
import theme from './assets/global/theme';
import { ThemeProvider, CssBaseline, Snackbar } from '@mui/material';
import { useAuthCustom } from './hooks/useAuthCustom';
import { PatientDetails } from './components/workspace-components';
import { useSelector, useDispatch } from 'react-redux';
import { setSnackbar } from './redux/slices/snackbarSlice';
import { Alert } from '@mui/material';
import Layout from './layout/Layout';

function App() {
  const auth = useAuthCustom();

  const snackbar = useSelector((state) => state.snackbar?.snackbarState || { open: false, message: '', severity: 'success' });
  const dispatch = useDispatch();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public route for landing */}
          <Route
            path="/"
            element={
              auth.isAuthenticated
                ? <Navigate to="/app" replace />
                : <LandingPage />
            }
          />

          {/* 👇 Onboarding form page */}
          <Route path="/onboarding" element={<Onboarding />} />

          <Route path="/redirect" element={<RedirectGate />} />

          {/* Optional failure fallback */}
          {/* <Route path="/authfail" element={<AuthFail />} /> */}

          {/* Protected section */}
          <Route element={<ProtectedRoutes auth={auth} />}>
            <Route element={<Layout />}>
              <Route path="app" element={<AppHome />} />
              <Route path="app/workspace" element={<Workspace />} />
              <Route path="app/workspace/patient/:patient_id" element={<PatientDetails />} />
            </Route>
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
