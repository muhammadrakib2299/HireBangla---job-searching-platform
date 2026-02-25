import { apiClient } from '@/lib/api-client';
import type { CreateResumeInput, UpdateResumeInput } from '@job-platform/shared-validators';

export async function createResume(data: CreateResumeInput) {
  const { data: res } = await apiClient.post('/resumes', data);
  return res.data;
}

export async function listResumes(page = 1, limit = 20) {
  const { data: res } = await apiClient.get('/resumes', {
    params: { page, limit },
  });
  return res.data;
}

export async function getResume(id: string) {
  const { data: res } = await apiClient.get(`/resumes/${id}`);
  return res.data;
}

export async function updateResume(id: string, data: UpdateResumeInput) {
  const { data: res } = await apiClient.put(`/resumes/${id}`, data);
  return res.data;
}

export async function deleteResume(id: string) {
  const { data: res } = await apiClient.delete(`/resumes/${id}`);
  return res.data;
}

export async function setDefaultResume(id: string) {
  const { data: res } = await apiClient.patch(`/resumes/${id}/default`);
  return res.data;
}
