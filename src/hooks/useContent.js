import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import contentService from "../Services/contentService";
import { useToast } from "../Context/ToastContext";

export function useGetContent() {
  return useQuery({
    queryKey: ["web-content"],
    queryFn: async () => {
      const res = await contentService.getHomeContent();
      return res || {};
    }
  });
}

export function useUpdateContent() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (updatedPayload) => contentService.updateHomeContent(updatedPayload),
    onSuccess: (data) => {
      if (data.status === "success") {
        toast.success("Storefront content saved and synchronized successfully!");
        queryClient.invalidateQueries({ queryKey: ["web-content"] });
      } else {
        toast.error(data.message || "Failed to save contents.");
      }
    },
    onError: (err) => {
      toast.error(err.message || "An error occurred while saving contents.");
    }
  });
}

export function useUploadContentImage() {
  const toast = useToast();

  return useMutation({
    mutationFn: (formData) => contentService.uploadImage(formData),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success("Image asset uploaded successfully!");
      } else {
        toast.error(res.message || "Upload failed.");
      }
    },
    onError: (err) => {
      toast.error(err.message || "Error occurred during file upload.");
    }
  });
}
