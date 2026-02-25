import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

// ─── Public Hooks ────────────────────────────────────────────────────────────

export function useAssessments(page = 1, difficulty?: string, skillName?: string) {
  return useQuery({
    queryKey: ['assessments', page, difficulty, skillName],
    queryFn: async () => {
      const params: Record<string, any> = { page, limit: 20 };
      if (difficulty) params.difficulty = difficulty;
      if (skillName) params.skillName = skillName;
      const { data } = await apiClient.get('/assessments', { params });
      return data.data;
    },
  });
}

export function useAssessmentBySlug(slug: string) {
  return useQuery({
    queryKey: ['assessments', 'slug', slug],
    queryFn: async () => {
      const { data } = await apiClient.get(`/assessments/slug/${slug}`);
      return data.data;
    },
    enabled: !!slug,
  });
}

// ─── Authenticated Hooks ─────────────────────────────────────────────────────

export function useStartAssessment() {
  return useMutation({
    mutationFn: async (assessmentId: string) => {
      const { data } = await apiClient.post(`/assessments/${assessmentId}/start`);
      return data.data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to start assessment');
    },
  });
}

export function useSubmitAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      assessmentId,
      answers,
      timeTaken,
      startedAt,
    }: {
      assessmentId: string;
      answers: { questionIndex: number; selectedOption: number }[];
      timeTaken: number;
      startedAt: string;
    }) => {
      const { data } = await apiClient.post(`/assessments/${assessmentId}/submit`, {
        answers,
        timeTaken,
        startedAt,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      queryClient.invalidateQueries({ queryKey: ['verified-skills'] });
      queryClient.invalidateQueries({ queryKey: ['attempts'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit assessment');
    },
  });
}

export function useMyAttempts(page = 1) {
  return useQuery({
    queryKey: ['attempts', page],
    queryFn: async () => {
      const { data } = await apiClient.get('/assessments/attempts', {
        params: { page, limit: 20 },
      });
      return data.data;
    },
  });
}

export function useAttemptResult(attemptId: string) {
  return useQuery({
    queryKey: ['attempts', attemptId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/assessments/attempts/${attemptId}`);
      return data.data;
    },
    enabled: !!attemptId,
  });
}

export function useVerifiedSkills() {
  return useQuery({
    queryKey: ['verified-skills'],
    queryFn: async () => {
      const { data } = await apiClient.get('/assessments/verified-skills');
      return data.data;
    },
  });
}

// ─── Matching / Recommendations ──────────────────────────────────────────────

export function useRecommendedJobs(page = 1) {
  return useQuery({
    queryKey: ['recommended-jobs', page],
    queryFn: async () => {
      const { data } = await apiClient.get('/assessments/recommended-jobs', {
        params: { page, limit: 20 },
      });
      return data.data;
    },
  });
}

export function useJobMatchScore(jobId: string) {
  return useQuery({
    queryKey: ['match-score', jobId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/assessments/match/${jobId}`);
      return data.data;
    },
    enabled: !!jobId,
  });
}
