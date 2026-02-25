'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAssessments } from '@/hooks/useAssessments';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  BookOpen,
  Clock,
  Target,
  ChevronLeft,
  ChevronRight,
  Award,
  BarChart3,
  Users,
} from 'lucide-react';

const difficultyColors: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'danger',
};

const difficultyLabels: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export default function AssessmentsPage() {
  const [page, setPage] = useState(1);
  const [difficulty, setDifficulty] = useState('');
  const [skillName, setSkillName] = useState('');
  const { data, isLoading } = useAssessments(page, difficulty || undefined, skillName || undefined);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Skill Assessments</h1>
        <p className="mt-2 text-gray-600">
          Take assessments to verify your skills and stand out to employers.
          Verified skills boost your job match score.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {['', 'beginner', 'intermediate', 'advanced'].map((d) => (
            <button
              key={d}
              onClick={() => { setDifficulty(d); setPage(1); }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                difficulty === d
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {d === '' ? 'All Levels' : difficultyLabels[d]}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by skill..."
          value={skillName}
          onChange={(e) => { setSkillName(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Assessment Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : !data?.assessments?.length ? (
        <div className="py-20 text-center text-gray-500">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p>No assessments found. Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.assessments.map((assessment: any) => (
              <Link key={assessment._id} href={`/assessments/${assessment.slug}`}>
                <Card className="h-full transition hover:shadow-md">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="mb-3 flex items-start justify-between">
                      <Badge variant={difficultyColors[assessment.difficulty]}>
                        {difficultyLabels[assessment.difficulty] || assessment.difficulty}
                      </Badge>
                      <Award className="h-5 w-5 text-blue-500" />
                    </div>

                    <h3 className="mb-1 text-lg font-semibold text-gray-900">
                      {assessment.title}
                    </h3>
                    <p className="mb-1 text-sm font-medium text-blue-600">
                      {assessment.skillName}
                    </p>
                    {assessment.description && (
                      <p className="mb-4 line-clamp-2 text-sm text-gray-500">
                        {assessment.description}
                      </p>
                    )}

                    <div className="mt-auto flex items-center gap-4 border-t border-gray-100 pt-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {assessment.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {assessment.passingScore}% to pass
                      </span>
                      {assessment.attemptCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {assessment.attemptCount}
                        </span>
                      )}
                    </div>
                    {assessment.avgScore > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                        <BarChart3 className="h-4 w-4" />
                        Avg. score: {assessment.avgScore}%
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={!data.hasPrevPage}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {data.page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!data.hasNextPage}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
