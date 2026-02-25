import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { JobSearchInput } from '@job-platform/shared-validators';

export function useJobSearch(params: Partial<JobSearchInput>) {
  return useQuery({
    queryKey: ['jobs', 'search', params],
    queryFn: async () => {
      // Filter out undefined values
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== ''),
      );
      const { data } = await apiClient.get('/jobs', { params: cleanParams });
      return data.data;
    },
  });
}

export function useFeaturedJobs(limit = 6) {
  return useQuery({
    queryKey: ['jobs', 'featured', limit],
    queryFn: async () => {
      const { data } = await apiClient.get('/jobs/featured', {
        params: { limit },
      });
      return data.data;
    },
  });
}

export function useRecentJobs(limit = 10) {
  return useQuery({
    queryKey: ['jobs', 'recent', limit],
    queryFn: async () => {
      const { data } = await apiClient.get('/jobs/recent', {
        params: { limit },
      });
      return data.data;
    },
  });
}

export function useJobBySlug(slug: string) {
  return useQuery({
    queryKey: ['jobs', 'detail', slug],
    queryFn: async () => {
      const { data } = await apiClient.get(`/jobs/${slug}`);
      return data.data;
    },
    enabled: !!slug,
  });
}

export function useSimilarJobs(slug: string) {
  return useQuery({
    queryKey: ['jobs', 'similar', slug],
    queryFn: async () => {
      const { data } = await apiClient.get(`/jobs/${slug}/similar`);
      return data.data;
    },
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['jobs', 'categories'],
    queryFn: async () => {
      const { data } = await apiClient.get('/jobs/categories');
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
