'use client';

import { useRouter } from 'next/navigation';
import { useCreateResume } from '@/hooks/useResume';
import { useAuth } from '@/providers/AuthProvider';
import ResumeForm from '@/components/resume/ResumeForm';
import type { CreateResumeInput } from '@job-platform/shared-validators';

export default function NewResumePage() {
  const router = useRouter();
  const { user } = useAuth();
  const createResume = useCreateResume();

  const userProfile = user as any;

  const handleSubmit = async (data: CreateResumeInput) => {
    await createResume.mutateAsync(data);
    router.push('/jobseeker/resume');
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Create Resume</h1>
      <ResumeForm
        defaultValues={{
          personalInfo: {
            fullName: `${userProfile?.profile?.firstName || ''} ${userProfile?.profile?.lastName || ''}`.trim(),
            email: userProfile?.email || '',
            phone: userProfile?.profile?.phone || '',
          },
        }}
        onSubmit={handleSubmit}
        isSubmitting={createResume.isPending}
        submitLabel="Create Resume"
      />
    </div>
  );
}
