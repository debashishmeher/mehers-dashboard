// services/api.js
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
        const token = Cookies.get("authToken");

        if (token) {
            config.headers.Authorization = token;
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

        // Unauthorized
        if (error.response?.status === 401) {
            Cookies.remove("authToken");

            // Avoid infinite redirect loops
            if (window.location.pathname !== "/login") {
                window.location.replace("/login");
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