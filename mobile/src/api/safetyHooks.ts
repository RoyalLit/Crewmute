import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';


export const useReportUserMutation = () => {
  return useMutation({
    mutationFn: async (data: { reportedUserId: string; reason: string }) => {
      const response = await apiClient.post('/safety/report', data);
      return response.data;
    },
  });
};

export const useBlockUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { userIdToBlock: string }) => {
      const response = await apiClient.post('/safety/block', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate chats to remove blocked users from list if necessary
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  });
};

export const useCheckBlockQuery = (targetUserId: string) => {
  return useQuery({
    queryKey: ['checkBlock', targetUserId],
    queryFn: async () => {
      const response = await apiClient.get(`/safety/block-status/${targetUserId}`);
      return response.data;
    },
    enabled: !!targetUserId,
  });
};

