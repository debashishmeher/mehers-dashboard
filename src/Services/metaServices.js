import axios from "axios";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_API_URL;

class MetaService {
    constructor() {
        this.baseURL = `${API_URL}/meta`;
    }

    /* ===============================
       Auth Headers
    =============================== */
    getAuthHeaders() {
        const token = Cookies.get("authToken");

        return {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        };
    }

    /* ===============================
       Send OAuth Code → Backend
    =============================== */
    async sendAuthCode(code, sessionData) {
        if (!code) {
            throw new Error("OAuth code is required");
        }

        if (!sessionData) {
            throw new Error("Session data is required");
        }

        const response = await axios.post(
            `${this.baseURL}/access-token`,
            {
                code,
                sessionData,
            },
            {
                headers: this.getAuthHeaders(),
                withCredentials: true,
            }
        );

        return response.data;
    }

    /* ===============================
       (Future Ready) Get Clients
    =============================== */
    async getWhatsAppClients() {
        const response = await axios.get(
            `${this.baseURL}/clients`,
            {
                headers: this.getAuthHeaders(),
                withCredentials: true,
            }
        );

        return response.data;
    }

    /* ===============================
       (Future Ready) Disconnect
    =============================== */
    async disconnectClient(wabaId) {
        const response = await axios.post(
            `${this.baseURL}/disconnect`,
            { waba_id: wabaId },
            {
                headers: this.getAuthHeaders(),
                withCredentials: true,
            }
        );

        return response.data;
    }
}

export default new MetaService();
