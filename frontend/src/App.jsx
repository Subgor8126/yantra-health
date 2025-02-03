import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
// import { isAuthenticated } from "./utils/auth"; // Helper to check auth state
import AuthCallback from './routes/AuthCallback';
import ProtectedRoutes from './components/ProtectedRoutes';
import AuthFail from './pages/AuthFail';
import AppHome from './pages/AppHome';
import Dashboard from './pages/Dashboard';

function App() {

  return (
    <Router>
      <Routes>
        {/* Public route for unauthenticated users */}
        <Route path="/" element={<LandingPage />} />

        {/* <Route path="/auth/callback" element={<AuthCallback />} /> */}

        <Route path="/authfail" element={<AuthFail/>}/>
        
        <Route element={<ProtectedRoutes/>}>
            <Route path="app" element={<AppHome />} />
            <Route path="app/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
