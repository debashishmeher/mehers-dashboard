import api from "./api";

export const contentService = {
  getHomeContent: async () => {
    // Note: api response interceptor auto-extracts response.data
    const response = await api.get("/api/content");
    return response;
  },

  updateHomeContent: async (payload) => {
    const response = await api.patch("/api/content", payload);
    return response;
  },

  uploadImage: async (formData) => {
    const response = await api.post("/api/content/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response;
  }
};

export default contentService;
