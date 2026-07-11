import { getCookie } from "../utils/auth";
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import authService from '../Services/authService';
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = useCallback(async () => {
    const authToken = getCookie("authToken");
    if (!authToken) {
      setUser(null);
      setUserData(null);
      setLoading(false);
      return;
    }

    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setUserData({
        status: 'success',
        user: currentUser
      });
    } catch (err) {
      console.error("Session verification failed:", err);
      setError(err.message || "Failed to authenticate");
      setUser(null);
      setUserData(null);
      Cookies.remove("authToken");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const sendOtp = async (email) => {
    setError(null);
    try {
      return await authService.sendOtp(email);
    } catch (err) {
      setError(err.message || "Failed to send verification code");
      throw err;
    }
  };

  const verifyOtp = async (email, otp) => {
    setError(null);
    try {
      const response = await authService.verifyOtp(email, otp);
      await checkAuth();
      return response;
    } catch (err) {
      setError(err.message || "Failed to verify code");
      throw err;
    }
  };

  const loginWithGoogle = async (credential) => {
    setError(null);
    try {
      const response = await authService.loginWithGoogle(credential);
      await checkAuth();
      return response;
    } catch (err) {
      setError(err.message || "Google Authentication failed");
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout request error:", err);
    } finally {
      setUser(null);
      setUserData(null);
      window.location.replace("/login");
    }
  };

  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => {
      if (!prev) return null;
      const nextUser = { ...prev, ...updatedFields };
      nextUser.name = `${nextUser.f_name || ""} ${nextUser.l_name || ""}`.trim();
      return nextUser;
    });

    setUserData((prev) => {
      if (!prev || !prev.user) return null;
      const nextUser = { ...prev.user, ...updatedFields };
      nextUser.name = `${nextUser.f_name || ""} ${nextUser.l_name || ""}`.trim();
      return {
        ...prev,
        user: nextUser
      };
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      userData,
      setUserData,
      updateUser,
      loading,
      error,
      sendOtp,
      verifyOtp,
      loginWithGoogle,
      logout,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const UserProvider = AuthProvider;
export const useUser = useAuth;
