import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

// ─── Jobseeker Hooks ──────────────────────────────────────────────────────────

export function useMyApplications(page = 1, status?: string) {
  return useQuery({
    queryKey: ['applications', 'me', page, status],
    queryFn: async () => {
      const params: Record<string, any> = { page, limit: 20 };
      if (status) params.status = status;
      const { data } = await apiClient.get('/applications/me', { params });
      return data.data;
    },
  });
}

export function useJobseekerStats() {
  return useQuery({
    queryKey: ['applications', 'me', 'stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/applications/me/stats');
      return data.data;
    },
  });
}

export function useApplyToJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      jobId: string;
      coverLetter?: string;
      resume?: string;
    }) => {
      const { data } = await apiClient.post('/applications', input);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Application submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to submit application',
      );
    },
  });
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (applicationId: string) => {
      const { data } = await apiClient.patch(
        `/applications/${applicationId}/withdraw`,
      );
      return data.data;
    },
    onSuccess: () => {
      toast.success('Application withdrawn');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to withdraw application',
      );
    },
  });
}

// ─── Employer Hooks ───────────────────────────────────────────────────────────

export function useJobApplications(jobId: string, page = 1, status?: string) {
  return useQuery({
    queryKey: ['applications', 'job', jobId, page, status],
    queryFn: async () => {
      const params: Record<string, any> = { page, limit: 20 };
      if (status) params.status = status;
      const { data } = await apiClient.get(`/applications/job/${jobId}`, {
        params,
      });
      return data.data;
    },
    enabled: !!jobId,
  });
}

export function useEmployerStats() {
  return useQuery({
    queryKey: ['applications', 'employer', 'stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/applications/employer/stats');
      return data.data;
    },
  });
}

export function useApplication(applicationId: string) {
  return useQuery({
    queryKey: ['applications', 'detail', applicationId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/applications/${applicationId}`);
      return data.data;
    },
    enabled: !!applicationId,
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      applicationId,
      status,
      note,
    }: {
      applicationId: string;
      status: string;
      note?: string;
    }) => {
      const { data } = await apiClient.patch(
        `/applications/${applicationId}/status`,
        { status, note },
      );
      return data.data;
    },
    onSuccess: () => {
      toast.success('Application status updated');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });
}

export function useAddEmployerNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      applicationId,
      notes,
      rating,
    }: {
      applicationId: string;
      notes: string;
      rating?: number;
    }) => {
      const { data } = await apiClient.patch(
        `/applications/${applicationId}/notes`,
        { notes, rating },
      );
      return data.data;
    },
    onSuccess: () => {
      toast.success('Notes saved');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save notes');
    },
  });
}

// ─── Saved Jobs Hooks ─────────────────────────────────────────────────────────

export function useSavedJobs(page = 1) {
  return useQuery({
    queryKey: ['savedJobs', page],
    queryFn: async () => {
      const { data } = await apiClient.get('/applications/saved/list', {
        params: { page, limit: 20 },
      });
      return data.data;
    },
  });
}

export function useIsJobSaved(jobId: string) {
  return useQuery({
    queryKey: ['savedJobs', 'check', jobId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/applications/saved/${jobId}/check`);
      return data.data;
    },
    enabled: !!jobId,
  });
}

export function useSaveJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data } = await apiClient.post(`/applications/saved/${jobId}`);
      return data;
    },
    onSuccess: () => {
      toast.success('Job saved!');
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save job');
    },
  });
}

export function useUnsaveJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data } = await apiClient.delete(`/applications/saved/${jobId}`);
      return data;
    },
    onSuccess: () => {
      toast.success('Job unsaved');
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to unsave job');
    },
  });
}

// ─── Notifications Hooks ──────────────────────────────────────────────────────

export function useNotifications(page = 1) {
  return useQuery({
    queryKey: ['notifications', page],
    queryFn: async () => {
      const { data } = await apiClient.get('/notifications', {
        params: { page, limit: 20 },
      });
      return data.data;
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data } = await apiClient.get('/notifications/unread-count');
      return data.data;
    },
    refetchInterval: 60000, // refetch every minute
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      await apiClient.patch(`/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.patch('/notifications/read-all');
    },
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
