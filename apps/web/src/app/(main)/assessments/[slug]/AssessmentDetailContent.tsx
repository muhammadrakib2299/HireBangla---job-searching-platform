'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAssessmentBySlug, useStartAssessment, useSubmitAssessment } from '@/hooks/useAssessments';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  Clock,
  Target,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  ArrowLeft,
  Code,
  Timer,
} from 'lucide-react';

const difficultyColors: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'danger',
};

type QuizState = 'info' | 'playing' | 'results';

interface QuizQuestion {
  questionText: string;
  questionType: string;
  options: { text: string }[];
  points: number;
  codeSnippet?: string;
}

interface QuizResult {
  score: number;
  pointsEarned: number;
  totalPoints: number;
  passed: boolean;
  timeTaken: number;
  passingScore: number;
  answers: Array<{
    questionIndex: number;
    selectedOption: number;
    isCorrect: boolean;
    pointsEarned: number;
    questionText?: string;
    correctOption?: number;
    explanation?: string;
  }>;
}

export default function AssessmentDetailContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { data: assessment, isLoading } = useAssessmentBySlug(slug);
  const startMutation = useStartAssessment();
  const submitMutation = useSubmitAssessment();

  const [quizState, setQuizState] = useState<QuizState>('info');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [startedAt, setStartedAt] = useState('');
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [assessmentId, setAssessmentId] = useState('');

  // Timer countdown
  useEffect(() => {
    if (quizState !== 'playing' || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quizState, timeLeft]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (quizState === 'playing' && timeLeft === 0 && assessmentId) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, quizState]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    if (!assessment?._id) return;
    try {
      const result = await startMutation.mutateAsync(assessment._id);
      setAssessmentId(result._id);
      setQuestions(result.questions);
      setTimeLeft(result.duration * 60);
      setStartedAt(new Date().toISOString());
      setSelectedAnswers({});
      setCurrentQuestion(0);
      setQuizState('playing');
    } catch {
      // Error handled by hook
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!assessmentId || submitMutation.isPending) return;

    const now = Date.now();
    const start = new Date(startedAt).getTime();
    const timeTaken = Math.round((now - start) / 1000);

    const answers = Object.entries(selectedAnswers).map(([qi, opt]) => ({
      questionIndex: parseInt(qi),
      selectedOption: opt,
    }));

    try {
      const result = await submitMutation.mutateAsync({
        assessmentId,
        answers,
        timeTaken,
        startedAt,
      });
      setQuizResult(result);
      setQuizState('results');
    } catch {
      // Error handled by hook
    }
  }, [assessmentId, selectedAnswers, startedAt, submitMutation]);

  const selectAnswer = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion]: optionIndex,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <p className="text-gray-500">Assessment not found.</p>
        <Link href="/assessments" className="mt-4 inline-block text-blue-600 hover:underline">
          Back to assessments
        </Link>
      </div>
    );
  }

  // ─── Info Screen ─────────────────────────────────────────────────────────
  if (quizState === 'info') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/assessments" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Back to assessments
        </Link>

        <Card>
          <CardContent className="p-8">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <Badge variant={difficultyColors[assessment.difficulty]}>
                  {assessment.difficulty}
                </Badge>
                <h1 className="mt-3 text-2xl font-bold text-gray-900">{assessment.title}</h1>
                <p className="mt-1 text-lg text-blue-600">{assessment.skillName}</p>
              </div>
              <Award className="h-10 w-10 text-blue-500" />
            </div>

            {assessment.description && (
              <p className="mb-6 text-gray-600">{assessment.description}</p>
            )}

            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <Clock className="mx-auto mb-2 h-6 w-6 text-blue-500" />
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-lg font-semibold">{assessment.duration} min</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <Target className="mx-auto mb-2 h-6 w-6 text-green-500" />
                <p className="text-sm text-gray-500">Passing Score</p>
                <p className="text-lg font-semibold">{assessment.passingScore}%</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <BookOpen className="mx-auto mb-2 h-6 w-6 text-purple-500" />
                <p className="text-sm text-gray-500">Questions</p>
                <p className="text-lg font-semibold">{assessment.questions?.length || 0}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <Award className="mx-auto mb-2 h-6 w-6 text-yellow-500" />
                <p className="text-sm text-gray-500">Total Points</p>
                <p className="text-lg font-semibold">
                  {assessment.questions?.reduce((s: number, q: any) => s + q.points, 0) || 0}
                </p>
              </div>
            </div>

            <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Before you start:</p>
                  <ul className="mt-2 list-disc pl-5 text-sm text-yellow-700">
                    <li>You have {assessment.duration} minutes to complete the assessment</li>
                    <li>The quiz will auto-submit when time runs out</li>
                    <li>You can retake this assessment after 24 hours</li>
                    <li>Score {assessment.passingScore}% or higher to earn a verified skill badge</li>
                  </ul>
                </div>
              </div>
            </div>

            {!user ? (
              <div className="text-center">
                <p className="mb-4 text-gray-600">You need to be logged in to take assessments.</p>
                <Link href="/login">
                  <Button>Log in to start</Button>
                </Link>
              </div>
            ) : (
              <Button
                onClick={handleStart}
                disabled={startMutation.isPending}
                className="w-full"
                size="lg"
              >
                {startMutation.isPending ? 'Starting...' : 'Start Assessment'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Quiz Player ─────────────────────────────────────────────────────────
  if (quizState === 'playing') {
    const question = questions[currentQuestion];
    const totalQuestions = questions.length;
    const answeredCount = Object.keys(selectedAnswers).length;

    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* Top bar: timer + progress */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className={`h-5 w-5 ${timeLeft < 60 ? 'text-red-500' : 'text-gray-500'}`} />
            <span className={`text-lg font-mono font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-gray-700'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {answeredCount}/{totalQuestions} answered
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-6 h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Question */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Question {currentQuestion + 1} of {totalQuestions}
              </span>
              <Badge variant="default">{question.points} pt{question.points > 1 ? 's' : ''}</Badge>
            </div>

            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              {question.questionText}
            </h2>

            {question.codeSnippet && (
              <div className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4">
                <div className="mb-1 flex items-center gap-1 text-xs text-gray-400">
                  <Code className="h-3 w-3" />
                  Code
                </div>
                <pre className="text-sm text-green-400">
                  <code>{question.codeSnippet}</code>
                </pre>
              </div>
            )}

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => selectAnswer(i)}
                  className={`w-full rounded-lg border-2 p-4 text-left transition ${
                    selectedAnswers[currentQuestion] === i
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium ${
                        selectedAnswers[currentQuestion] === i
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 text-gray-500'
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-gray-700">{option.text}</span>
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>

          {/* Question dots */}
          <div className="hidden flex-wrap justify-center gap-1 sm:flex">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQuestion(i)}
                className={`h-3 w-3 rounded-full transition ${
                  i === currentQuestion
                    ? 'bg-blue-600'
                    : selectedAnswers[i] !== undefined
                      ? 'bg-blue-300'
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentQuestion < totalQuestions - 1 ? (
            <Button
              onClick={() => setCurrentQuestion((prev) => Math.min(totalQuestions - 1, prev + 1))}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit'}
            </Button>
          )}
        </div>

        {/* Unanswered warning */}
        {answeredCount < totalQuestions && currentQuestion === totalQuestions - 1 && (
          <p className="mt-3 text-center text-sm text-yellow-600">
            You have {totalQuestions - answeredCount} unanswered question(s)
          </p>
        )}
      </div>
    );
  }

  // ─── Results Screen ──────────────────────────────────────────────────────
  if (quizState === 'results' && quizResult) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Score Card */}
        <Card className="mb-6 overflow-hidden">
          <div className={`p-8 text-center ${quizResult.passed ? 'bg-green-50' : 'bg-red-50'}`}>
            {quizResult.passed ? (
              <CheckCircle2 className="mx-auto mb-3 h-16 w-16 text-green-500" />
            ) : (
              <XCircle className="mx-auto mb-3 h-16 w-16 text-red-500" />
            )}
            <h2 className="text-2xl font-bold text-gray-900">
              {quizResult.passed ? 'Congratulations! You passed!' : 'Not quite there yet'}
            </h2>
            <p className="mt-1 text-gray-600">
              {quizResult.passed
                ? `You've earned a verified ${assessment.skillName} badge!`
                : `You need ${quizResult.passingScore}% to pass. Keep practicing!`}
            </p>

            <div className="mx-auto mt-6 flex max-w-sm items-center justify-center gap-8">
              <div>
                <p className="text-4xl font-bold text-gray-900">{quizResult.score}%</p>
                <p className="text-sm text-gray-500">Your Score</p>
              </div>
              <div className="h-12 w-px bg-gray-300" />
              <div>
                <p className="text-4xl font-bold text-gray-900">
                  {quizResult.pointsEarned}/{quizResult.totalPoints}
                </p>
                <p className="text-sm text-gray-500">Points</p>
              </div>
              <div className="h-12 w-px bg-gray-300" />
              <div>
                <p className="text-4xl font-bold text-gray-900">
                  {Math.floor(quizResult.timeTaken / 60)}m {quizResult.timeTaken % 60}s
                </p>
                <p className="text-sm text-gray-500">Time</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Answer Review */}
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Answer Review</h3>
        <div className="space-y-4">
          {quizResult.answers.map((answer, i) => (
            <Card key={i} className={answer.isCorrect ? 'border-green-200' : 'border-red-200'}>
              <CardContent className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <span className="text-sm font-medium text-gray-500">Question {i + 1}</span>
                  {answer.isCorrect ? (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Correct (+{answer.pointsEarned}pt)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm text-red-600">
                      <XCircle className="h-4 w-4" />
                      Incorrect
                    </span>
                  )}
                </div>
                <p className="mb-2 text-gray-800">{answer.questionText}</p>
                {answer.explanation && (
                  <p className="rounded bg-gray-50 p-2 text-sm text-gray-600">
                    {answer.explanation}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <Link href="/assessments" className="flex-1">
            <Button variant="outline" className="w-full">
              Browse Assessments
            </Button>
          </Link>
          <Link href="/dashboard/jobseeker/assessments" className="flex-1">
            <Button className="w-full">
              View My Skills
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
