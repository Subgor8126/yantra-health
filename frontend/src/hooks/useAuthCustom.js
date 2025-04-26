// hooks/useAuthCustom.js
import { useAuth } from 'react-oidc-context';
import { useEffect, useState } from 'react';
import {
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  fetchUserAttributes,
} from '@aws-amplify/auth';
import { useDispatch } from 'react-redux';
import { setSnackbar } from '../redux/slices/snackbarSlice';

export const useAuthCustom = () => {
  const oidc = useAuth();

  const [guestUser, setGuestUser] = useState(null);
  const [guestTokens, setGuestTokens] = useState(null);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const dispatch = useDispatch();

  const isGuest = localStorage.getItem('isGuest') === 'true';
  const isOidcUser = oidc.isAuthenticated && !isGuest;
  const isAuthenticated = isOidcUser || (isGuest && guestUser);

  useEffect(() => {
    const loadGuest = async () => {
      if (!isGuest) return;

      setIsGuestLoading(true);
      try {
        const user = await getCurrentUser();
        const session = await fetchAuthSession();
        const attributes = await fetchUserAttributes(user);

        setGuestUser({ ...attributes, isGuest: true });
        setGuestTokens({
          access_token: session.tokens?.accessToken?.toString(),
          id_token: session.tokens?.idToken?.toString(),
          refresh_token: session.tokens?.refreshToken?.toString(),
        });
      } catch (err) {
        console.error("Failed to load guest:", err);
        setAuthError(err);
        localStorage.removeItem("isGuest");
      } finally {
        setIsGuestLoading(false);
      }
    };

    loadGuest();
  }, [isGuest]);

  const login = () => {
    localStorage.removeItem("isGuest");
    oidc.signinRedirect();
  };

  const loginAsGuest = async () => {
    try {
      const username = import.meta.env.VITE_GUEST_USERNAME;
      const password = import.meta.env.VITE_GUEST_PASSWORD;
      console.log("Logging in as guest with username:", username);
      console.log("Logging in as guest with password:", password);

      await signIn({username, password});
      console.log("Guest login successful");
      localStorage.setItem("isGuest", "true");
      window.location.reload(); // reload to trigger auth state re-evaluation
    } catch (err) {
      console.error("Guest login failed:", err);
      setAuthError(err);
    }
  };

  const logout = async () => {
    localStorage.removeItem("isGuest");
    setGuestUser(null);
    setGuestTokens(null);
    await signOut();
    // oidc.signoutRedirect();
    window.location.href = '/';
  };

  const user = isGuest ? guestUser : oidc.user?.profile || null;
  const tokens = isGuest ? guestTokens : {
    access_token: oidc.user?.access_token,
    id_token: oidc.user?.id_token,
    refresh_token: oidc.user?.refresh_token,
  };

  return {
    isGuest,
    isAuthenticated,
    isLoading: isGuestLoading || oidc.isLoading,
    user,
    userId: user?.sub || null,
    tokens,
    login,
    loginAsGuest,
    logout,
    authError,
  };
};