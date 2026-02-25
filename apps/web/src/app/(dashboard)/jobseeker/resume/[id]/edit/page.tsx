'use client';

import { useParams, useRouter } from 'next/navigation';
import { useResume, useUpdateResume } from '@/hooks/useResume';
import { Spinner } from '@/components/ui/Spinner';
import ResumeForm from '@/components/resume/ResumeForm';
import type { CreateResumeInput } from '@job-platform/shared-validators';

export default function EditResumePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: resume, isLoading } = useResume(id);
  const updateResume = useUpdateResume();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="py-12 text-center text-gray-500">Resume not found.</div>
    );
  }

  const handleSubmit = async (data: CreateResumeInput) => {
    await updateResume.mutateAsync({ id, data });
    router.push('/jobseeker/resume');
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Resume</h1>
      <ResumeForm
        defaultValues={resume}
        onSubmit={handleSubmit}
        isSubmitting={updateResume.isPending}
        submitLabel="Update Resume"
      />
    </div>
  );
}
