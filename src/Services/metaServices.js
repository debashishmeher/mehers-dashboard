import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken"); // or Cookies.get(...)
    return {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

export const sendMetaAuthCode = async ({ code, sessionData }) => {
    const response = await axios.post(
        `${API_URL}/meta/access-token`,
        {
            code,
            sessionData,
        },
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data;
};
