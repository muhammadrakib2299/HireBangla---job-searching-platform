'use client';

import Link from 'next/link';
import { useResumes, useDeleteResume, useSetDefaultResume } from '@/hooks/useResume';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Plus, Edit, Eye, Trash2, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ResumesPage() {
  const { data, isLoading } = useResumes();
  const deleteResume = useDeleteResume();
  const setDefault = useSetDefaultResume();

  const resumes = data?.resumes || [];

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Resumes</h1>
        <Link href="/jobseeker/resume/new">
          <Button>
            <Plus className="h-4 w-4" /> Create Resume
          </Button>
        </Link>
      </div>

      {resumes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">You haven&apos;t created any resumes yet.</p>
            <Link href="/jobseeker/resume/new" className="mt-4 inline-block">
              <Button>Create Your First Resume</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {resumes.map((resume: any) => (
            <Card key={resume._id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{resume.title}</h3>
                    {resume.isDefault && <Badge variant="success">Default</Badge>}
                    <Badge variant="secondary">{resume.template}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Updated {formatDistanceToNow(new Date(resume.updatedAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!resume.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDefault.mutate(resume._id)}
                      title="Set as default"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Link href={`/jobseeker/resume/${resume._id}/preview`}>
                    <Button variant="ghost" size="sm" title="Preview">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/jobseeker/resume/${resume._id}/edit`}>
                    <Button variant="ghost" size="sm" title="Edit">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Delete this resume?')) {
                        deleteResume.mutate(resume._id);
                      }
                    }}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
