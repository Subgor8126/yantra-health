import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthCustom } from '../hooks/useAuthCustom';
import { Box, CircularProgress, Typography } from '@mui/material';

const RedirectGate = () => {
  const auth = useAuthCustom();
  const token = auth.tokens?.access_token
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🎯 useEffect check in RedirectGate triggered", {
        isLoading: auth.isLoading,
        isAuthenticated: auth.isAuthenticated,
        tokens: auth.tokens,
      });
    const doRedirect = async () => {
      if (!auth.isLoading && auth.isAuthenticated && auth.tokens?.access_token) {
        const user_id = auth.userId;
        const email = auth.user?.email;

        console.log(`🎯 RedirectGate: User ID: ${user_id}, Email: ${email}`);

        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/check-user-exists`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          });
          const { exists } = await res.json();
          console.log(`🎯 User exists: ${exists}`);

          // const exists = false;


          if (exists) {
            navigate('/app');
          } else {
            navigate(`/onboarding?user_id=${user_id}&email=${encodeURIComponent(email || '')}`);
          }
        } catch (err) {
          console.error("RedirectGate error:", err);
          navigate('/authfail');
        }
      }
    };

    doRedirect();
  }, [
    auth.isLoading,
    auth.isAuthenticated,
    auth.tokens,
    auth.userId,
    auth.user?.email,
    navigate,
  ]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Checking user status...</Typography>
    </Box>
  );
};

export default RedirectGate;