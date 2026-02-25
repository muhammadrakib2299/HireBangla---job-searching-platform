'use client';

import { JobPostForm } from '@/components/employer/JobPostForm';

export default function PostJobPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Post a New Job</h1>
      <JobPostForm />
    </div>
  );
}
