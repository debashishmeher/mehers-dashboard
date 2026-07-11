import api from "./api";
import Cookies from "js-cookie";

export const authService = {
  sendOtp: async (email) => {
    const response = await api.post("/api/v1/auth/send-otp", { email });
    return response;
  },

  verifyOtp: async (email, otp) => {
    const response = await api.post("/api/v1/auth/verify-otp", { email, otp });
    if (response?.accessToken) {
      Cookies.set("authToken", response.accessToken, { expires: 30 });
    }
    return response;
  },

  loginWithGoogle: async (credential) => {
    const response = await api.post("/api/v1/auth/google/callback", { token: credential });
    if (response?.accessToken) {
      Cookies.set("authToken", response.accessToken, { expires: 30 });
    }
    return response;
  },

  logout: async () => {
    try {
      await api.post("/api/v1/auth/logout");
    } catch (err) {
      console.error("Logout request error:", err);
    } finally {
      Cookies.remove("authToken");
      Cookies.remove("refreshToken");
    }
  },

  getCurrentUser: async () => {
    const response = await api.get("/api/v1/user");
    if (response.status === "success" && response.data?.user) {
      const user = response.data.user;
      user.name = `${user.f_name || ""} ${user.l_name || ""}`.trim();
      return user;
    }
    throw new Error("Invalid response from user endpoint");
  }
};

export default authService;
