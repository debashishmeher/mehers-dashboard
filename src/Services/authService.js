import api from "./api";
import Cookies from "js-cookie";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const authService = {
  sendOtp: async (email) => {
    const response = await api.post("/api/auth/send-otp", { email });
    return response;
  },

  verifyOtp: async (email, otp) => {
    const response = await api.post("/api/auth/verify-otp", { email, otp });
    if (response?.accessToken) {
      Cookies.set("authToken", response.accessToken, { expires: 30 });
    }
    return response;
  },

  loginWithGoogle: async (credential) => {
    const response = await api.post("/api/auth/google/callback", { token: credential });
    if (response?.accessToken) {
      Cookies.set("authToken", response.accessToken, { expires: 30 });
    }
    return response;
  },

  completeOnboarding: async () => {
    const response = await api.post("/api/auth/complete-onboarding");
    return response;
  },

  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (err) {
      console.error("Logout request error:", err);
    } finally {
      Cookies.remove("authToken");
      Cookies.remove("refreshToken");
    }
  },

  getCurrentUser: async () => {
    const response = await api.get("/api/user");
    if (response.status === "success" && response.data?.user) {
      const user = response.data.user;
      user.name = `${user.f_name || ""} ${user.l_name || ""}`.trim();
      return user;
    }
    throw new Error("Invalid response from user endpoint");
  }
};

export const useSendOtp = () => {
  return useMutation({
    mutationFn: (email) => authService.sendOtp(email),
  });
};

export const useVerifyOtp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, otp }) => authService.verifyOtp(email, otp),
    onSuccess: () => {
      queryClient.invalidateQueries(["currentUser"]);
    },
  });
};

export const useLoginWithGoogle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credential) => authService.loginWithGoogle(credential),
    onSuccess: () => {
      queryClient.invalidateQueries(["currentUser"]);
    },
  });
};

export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.completeOnboarding(),
    onSuccess: () => {
      queryClient.invalidateQueries(["currentUser"]);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

export default authService;
