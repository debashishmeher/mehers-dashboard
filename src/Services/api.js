import { getCookie } from "../utils/auth";
import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

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

api.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config;
        const normalizedError = {
            message: error.response?.data?.message || error.message || "Something went wrong",
            status: error.response?.status,
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await axios.post(
                    `${BASE_URL}/api/user/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                const newAccessToken = response.data?.token;
                if (!newAccessToken) {
                    throw new Error("No access token returned");
                }

                Cookies.set("authToken", newAccessToken, { expires: 30 });
                processQueue(null, newAccessToken);
                isRefreshing = false;

                originalRequest.headers.Authorization = newAccessToken.startsWith("Bearer ") ? newAccessToken : `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;
                Cookies.remove("authToken");
                if (window.location.pathname !== "/login") {
                    window.location.replace("/login");
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(normalizedError);
    }
);

export default api;
