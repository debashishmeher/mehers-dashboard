import api from "../utils/api";

export const fetchTemplates = {
    getTemplates: async () => {
        const response = await api.get('/meta/my-templates');
        return response.data;
    }
}