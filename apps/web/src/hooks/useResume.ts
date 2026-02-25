import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as resumeService from '@/services/resume.service';
import { toast } from 'sonner';
import type { CreateResumeInput, UpdateResumeInput } from '@job-platform/shared-validators';

export function useResumes(page = 1) {
  return useQuery({
    queryKey: ['resumes', page],
    queryFn: () => resumeService.listResumes(page),
  });
}

export function useResume(id: string) {
  return useQuery({
    queryKey: ['resumes', id],
    queryFn: () => resumeService.getResume(id),
    enabled: !!id,
  });
}

export function useCreateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateResumeInput) => resumeService.createResume(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Resume created');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create resume');
    },
  });
}

export function useUpdateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResumeInput }) =>
      resumeService.updateResume(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Resume updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update resume');
    },
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resumeService.deleteResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Resume deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete resume');
    },
  });
}

export function useSetDefaultResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resumeService.setDefaultResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Default resume updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to set default');
    },
  });
}
