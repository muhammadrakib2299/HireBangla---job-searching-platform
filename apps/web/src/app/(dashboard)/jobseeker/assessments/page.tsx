'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useVerifiedSkills, useMyAttempts, useRecommendedJobs } from '@/hooks/useAssessments';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  Award,
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Briefcase,
  MapPin,
  Building2,
  Star,
  TrendingUp,
  ChevronLeft,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const difficultyColors: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'danger',
};

export default function MyAssessmentsPage() {
  const [attemptsPage, setAttemptsPage] = useState(1);
  const [recPage, setRecPage] = useState(1);
  const { data: verifiedSkills, isLoading: skillsLoading } = useVerifiedSkills();
  const { data: attemptsData, isLoading: attemptsLoading } = useMyAttempts(attemptsPage);
  const { data: recommendedData, isLoading: recLoading } = useRecommendedJobs(recPage);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Skills & Assessments</h1>
          <p className="mt-1 text-gray-500">
            Your verified skills and assessment history
          </p>
        </div>
        <Link href="/assessments">
          <Button>
            <BookOpen className="mr-2 h-4 w-4" />
            Browse Assessments
          </Button>
        </Link>
      </div>

      {/* Verified Skills */}
      <Card>
        <CardHeader>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Award className="h-5 w-5 text-blue-500" />
            Verified Skills
          </h2>
        </CardHeader>
        <CardContent>
          {skillsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : !verifiedSkills?.length ? (
            <div className="py-8 text-center text-gray-500">
              <Award className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p>No verified skills yet.</p>
              <p className="mt-1 text-sm">
                Take assessments to earn skill badges that boost your job matches.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {verifiedSkills.map((skill: any) => (
                <div
                  key={skill.skillName}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">{skill.skillName}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Badge variant={difficultyColors[skill.difficulty]} className="text-[10px]">
                        {skill.difficulty}
                      </Badge>
                      <span>Score: {skill.score}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommended Jobs */}
      <Card>
        <CardHeader>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Recommended Jobs
          </h2>
        </CardHeader>
        <CardContent>
          {recLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : !recommendedData?.jobs?.length ? (
            <div className="py-8 text-center text-gray-500">
              <Briefcase className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p>No recommendations yet.</p>
              <p className="mt-1 text-sm">
                Complete your profile and take assessments to get personalized job recommendations.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {recommendedData.jobs.map((job: any) => (
                  <Link
                    key={job._id}
                    href={`/jobs/${job.slug}`}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-medium text-gray-900">{job.title}</h3>
                        {job.matchScore >= 70 && (
                          <Star className="h-4 w-4 shrink-0 text-yellow-500" />
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        {job.company?.name && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5" />
                            {job.company.name}
                          </span>
                        )}
                        {job.location?.division && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {job.location.division}
                            {job.location.isRemote && ' (Remote)'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex shrink-0 items-center gap-3">
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          job.matchScore >= 70
                            ? 'text-green-600'
                            : job.matchScore >= 40
                              ? 'text-yellow-600'
                              : 'text-gray-500'
                        }`}>
                          {job.matchScore}%
                        </p>
                        <p className="text-xs text-gray-400">match</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>

              {recommendedData.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRecPage((p) => Math.max(1, p - 1))}
                    disabled={!recommendedData.hasPrevPage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-500">
                    {recommendedData.page} / {recommendedData.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRecPage((p) => p + 1)}
                    disabled={!recommendedData.hasNextPage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Attempt History */}
      <Card>
        <CardHeader>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Clock className="h-5 w-5 text-gray-500" />
            Attempt History
          </h2>
        </CardHeader>
        <CardContent>
          {attemptsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : !attemptsData?.attempts?.length ? (
            <div className="py-8 text-center text-gray-500">
              <Clock className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p>No attempts yet. Take your first assessment!</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {attemptsData.attempts.map((attempt: any) => {
                  const assessment = attempt.assessment;
                  return (
                    <div
                      key={attempt._id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          {attempt.passed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <span className="font-medium text-gray-900">
                            {assessment?.title || 'Assessment'}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                          {assessment?.skillName && (
                            <span>{assessment.skillName}</span>
                          )}
                          {assessment?.difficulty && (
                            <Badge
                              variant={difficultyColors[assessment.difficulty]}
                              className="text-[10px]"
                            >
                              {assessment.difficulty}
                            </Badge>
                          )}
                          <span>
                            {formatDistanceToNow(new Date(attempt.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                          {attempt.score}%
                        </p>
                        <p className="text-xs text-gray-400">
                          {attempt.pointsEarned}/{attempt.totalPoints} pts
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {attemptsData.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAttemptsPage((p) => Math.max(1, p - 1))}
                    disabled={!attemptsData.hasPrevPage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-500">
                    {attemptsData.page} / {attemptsData.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAttemptsPage((p) => p + 1)}
                    disabled={!attemptsData.hasNextPage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
