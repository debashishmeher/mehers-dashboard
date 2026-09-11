import api from "./api";
import { useQuery } from "@tanstack/react-query";

export const userService = {
  getCurrentUser: async () => {
    const response = await api.get("/api/user");
    return response.data || null;
  }
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: userService.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

export default userService;
