'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useResume } from '@/hooks/useResume';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import ResumePreview from '@/components/resume/ResumePreview';
import { ArrowLeft, Edit } from 'lucide-react';

export default function PreviewResumePage() {
  const { id } = useParams<{ id: string }>();
  const { data: resume, isLoading } = useResume(id);

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

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/jobseeker/resume">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{resume.title}</h1>
        </div>
        <Link href={`/jobseeker/resume/${id}/edit`}>
          <Button variant="outline">
            <Edit className="h-4 w-4" /> Edit
          </Button>
        </Link>
      </div>

      <div className="overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <ResumePreview resume={resume} />
      </div>
    </div>
  );
}
