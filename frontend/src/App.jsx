import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthenticatedRoutes from "./routes/AuthenticatedRoutes";
// import { isAuthenticated } from "./utils/auth"; // Helper to check auth state
import AuthCallback from './routes/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import AuthFail from './pages/AuthFail';

function App() {

  return (
    <Router>
      <Routes>
        {/* Public route for unauthenticated users */}
        <Route path="/" element={<LandingPage />} />

        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route path="/authfail" element={<AuthFail/>}/>
        
        <Route path="/*" 
          element={ 
            <ProtectedRoute> 
              <AuthenticatedRoutes /> 
            </ProtectedRoute> 
          } 
        />
      </Routes>
    </Router>
  )
}

export default App
