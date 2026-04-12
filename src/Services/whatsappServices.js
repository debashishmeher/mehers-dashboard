import api from "../utils/api";

export const fetchTemplates = async () => api.get("/meta/my-templates");

export const whatsappTemplatesService = {
  getTemplates: fetchTemplates,
};

export default whatsappTemplatesService;
