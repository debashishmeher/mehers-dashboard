import { getCookie } from "./auth";
import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // important if using httpOnly refresh cookies
});

/* ----------------------------- */
/* Request Interceptor           */
/* ----------------------------- */
api.interceptors.request.use(
    (config) => {
        const token = getCookie("authToken");

        if (token) {
            config.headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/* ----------------------------- */
/* Response Interceptor          */
/* ----------------------------- */
api.interceptors.response.use(
    (response) => response.data, // auto return data only
    async (error) => {
        const originalRequest = error.config;

        // Prevent infinite loops if refresh token endpoint fails
        if (originalRequest && originalRequest.url && originalRequest.url.includes("/refresh-token")) {
            Cookies.remove("authToken");
            if (window.location.pathname !== "/login") {
                window.location.replace("/login");
            }
            return Promise.reject(error);
        }

        // Unauthorized
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const res = await axios.post(`${BASE_URL}/api/user/refresh-token`, {}, {
                    withCredentials: true
                });

                if (res.status === 200 && res.data.status === "success") {
                    const newToken = res.data.token;
                    Cookies.set("authToken", newToken, { expires: 30 });
                    
                    originalRequest.headers.Authorization = newToken.startsWith("Bearer ") ? newToken : `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error("Refresh token failed:", refreshError);
                Cookies.remove("authToken");
                if (window.location.pathname !== "/login") {
                    window.location.replace("/login");
                }
            }
        }

        // Normalize error message
        const normalizedError = {
            message:
                error.response?.data?.message ||
                error.message ||
                "Something went wrong",
            status: error.response?.status,
        };

        return Promise.reject(normalizedError);
    }
);

export default api;