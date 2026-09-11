import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useSendOtp,
  useVerifyOtp,
  useLoginWithGoogle,
  useCompleteOnboarding,
  useLogout
} from '../Services/authService';
import { useCurrentUser } from '../Services/userService';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { data, isLoading: loading, error, refetch } = useCurrentUser();
  const [adminError, setAdminError] = useState(null);

  const user = data?.user || null;
  const auth = data?.auth || null;
  const userData = data ? { status: 'success', user: data.user, auth: data.auth } : null;
  const isAdmin = auth?.role === 'admin';

  const checkAuth = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const sendOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();
  const loginWithGoogleMutation = useLoginWithGoogle();
  const completeOnboardingMutation = useCompleteOnboarding();
  const logoutMutation = useLogout();

  const sendOtp = async (email) => {
    return await sendOtpMutation.mutateAsync(email);
  };

  const verifyOtp = async (email, otp) => {
    const response = await verifyOtpMutation.mutateAsync({ email, otp });
    const { data: userProfile } = await refetch();
    if (userProfile?.auth?.role !== 'admin') {
      await logout();
      throw new Error("Access Denied: Only administrators can access this panel.");
    }
    return response;
  };

  const loginWithGoogle = async (credential) => {
    const response = await loginWithGoogleMutation.mutateAsync(credential);
    const { data: userProfile } = await refetch();
    if (userProfile?.auth?.role !== 'admin') {
      await logout();
      throw new Error("Access Denied: Only administrators can access this panel.");
    }
    return response;
  };

  const completeOnboarding = async () => {
    return await completeOnboardingMutation.mutateAsync();
  };

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  // Enforce admin-only access control
  useEffect(() => {
    if (auth && auth.role !== 'admin') {
      setAdminError("Access Denied: Only administrators can access this panel.");
      logout();
    } else if (auth && auth.role === 'admin') {
      setAdminError(null);
    }
  }, [auth, logout]);

  const updateUser = useCallback((updatedFields) => {
    queryClient.setQueryData(["currentUser"], (prev) => {
      if (!prev) return prev;
      const nextUser = { ...prev.user, ...updatedFields };
      nextUser.name = `${nextUser.f_name || ""} ${nextUser.l_name || ""}`.trim();
      return {
        ...prev,
        user: nextUser
      };
    });
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{
      user,
      auth,
      userData,
      updateUser,
      loading,
      error: adminError || error?.message || null,
      sendOtp,
      verifyOtp,
      loginWithGoogle,
      logout,
      checkAuth,
      completeOnboarding,
      isAdmin
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
