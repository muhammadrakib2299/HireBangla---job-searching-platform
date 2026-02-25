import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

// ─── Dashboard ───────────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/stats');
      return data.data;
    },
    refetchInterval: 60000, // refresh every minute
  });
}

// ─── User Management ─────────────────────────────────────────────────────────

export function useAdminUsers(page = 1, filters?: { role?: string; search?: string; isActive?: string }) {
  return useQuery({
    queryKey: ['admin', 'users', page, filters],
    queryFn: async () => {
      const params: Record<string, any> = { page, limit: 20 };
      if (filters?.role) params.role = filters.role;
      if (filters?.search) params.search = filters.search;
      if (filters?.isActive) params.isActive = filters.isActive;
      const { data } = await apiClient.get('/admin/users', { params });
      return data.data;
    },
  });
}

export function useToggleUserActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await apiClient.patch(`/admin/users/${userId}/toggle-active`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    },
  });
}

export function useChangeUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { data } = await apiClient.patch(`/admin/users/${userId}/role`, { role });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User role updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to change role');
    },
  });
}

// ─── Job Management ──────────────────────────────────────────────────────────

export function useAdminJobs(page = 1, filters?: { status?: string; source?: string; isApproved?: string; search?: string }) {
  return useQuery({
    queryKey: ['admin', 'jobs', page, filters],
    queryFn: async () => {
      const params: Record<string, any> = { page, limit: 20 };
      if (filters?.status) params.status = filters.status;
      if (filters?.source) params.source = filters.source;
      if (filters?.isApproved) params.isApproved = filters.isApproved;
      if (filters?.search) params.search = filters.search;
      const { data } = await apiClient.get('/admin/jobs', { params });
      return data.data;
    },
  });
}

export function useApproveJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data } = await apiClient.patch(`/admin/jobs/${jobId}/approve`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success('Job approved');
    },
  });
}

export function useRejectJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data } = await apiClient.patch(`/admin/jobs/${jobId}/reject`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success('Job rejected');
    },
  });
}

export function useBulkApproveJobs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobIds: string[]) => {
      const { data } = await apiClient.post('/admin/jobs/bulk-approve', { jobIds });
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success(`${data.modifiedCount} jobs approved`);
    },
  });
}

export function useBulkRejectJobs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobIds: string[]) => {
      const { data } = await apiClient.post('/admin/jobs/bulk-reject', { jobIds });
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success(`${data.modifiedCount} jobs rejected`);
    },
  });
}

export function useToggleJobFeatured() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data } = await apiClient.patch(`/admin/jobs/${jobId}/toggle-featured`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
    },
  });
}

export function useDeleteJobAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data } = await apiClient.delete(`/admin/jobs/${jobId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success('Job deleted');
    },
  });
}

// ─── Company Management ──────────────────────────────────────────────────────

export function useAdminCompanies(page = 1, filters?: { isVerified?: string; search?: string }) {
  return useQuery({
    queryKey: ['admin', 'companies', page, filters],
    queryFn: async () => {
      const params: Record<string, any> = { page, limit: 20 };
      if (filters?.isVerified) params.isVerified = filters.isVerified;
      if (filters?.search) params.search = filters.search;
      const { data } = await apiClient.get('/admin/companies', { params });
      return data.data;
    },
  });
}

export function useVerifyCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (companyId: string) => {
      const { data } = await apiClient.patch(`/admin/companies/${companyId}/verify`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'companies'] });
      toast.success('Company verified');
    },
  });
}

export function useUnverifyCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (companyId: string) => {
      const { data } = await apiClient.patch(`/admin/companies/${companyId}/unverify`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'companies'] });
      toast.success('Company verification removed');
    },
  });
}

// ─── Platform Settings ───────────────────────────────────────────────────────

export function usePlatformSettings() {
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/settings');
      return data.data;
    },
  });
}

export function useUpdatePlatformSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      const { data } = await apiClient.put('/admin/settings', updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      toast.success('Settings updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    },
  });
}
