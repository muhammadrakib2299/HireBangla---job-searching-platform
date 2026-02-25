'use client';

import { useState } from 'react';
import { useAssessments } from '@/hooks/useAssessments';
import { apiClient } from '@/lib/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { toast } from 'sonner';
import {
  Plus,
  X,
  Award,
  ToggleLeft,
  ToggleRight,
  BookOpen,
} from 'lucide-react';

const difficultyColors: Record<string, 'success' | 'warning' | 'danger'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'danger',
};

export default function AdminAssessmentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data, isLoading } = useAssessments(page, difficulty || undefined, search || undefined);
  const queryClient = useQueryClient();

  const toggleActiveMutation = useMutation({
    mutationFn: async (assessmentId: string) => {
      const { data } = await apiClient.patch(`/assessments/${assessmentId}/toggle-active`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      toast.success('Assessment status toggled');
    },
  });

  // ─── Create Form State ─────────────────────────────────────────────────────

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skillName: '',
    difficulty: 'beginner' as string,
    duration: 15,
    passingScore: 70,
    questions: [
      {
        questionText: '',
        questionType: 'multiple-choice' as string,
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
        explanation: '',
        points: 1,
        codeSnippet: '',
      },
    ],
  });

  const createMutation = useMutation({
    mutationFn: async (input: typeof formData) => {
      const { data } = await apiClient.post('/assessments', input);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      toast.success('Assessment created');
      setShowCreateForm(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create assessment');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      skillName: '',
      difficulty: 'beginner',
      duration: 15,
      passingScore: 70,
      questions: [
        {
          questionText: '',
          questionType: 'multiple-choice',
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
          ],
          explanation: '',
          points: 1,
          codeSnippet: '',
        },
      ],
    });
  };

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: '',
          questionType: 'multiple-choice',
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
          ],
          explanation: '',
          points: 1,
          codeSnippet: '',
        },
      ],
    }));
  };

  const removeQuestion = (qi: number) => {
    if (formData.questions.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== qi),
    }));
  };

  const updateQuestion = (qi: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === qi ? { ...q, [field]: value } : q,
      ),
    }));
  };

  const addOption = (qi: number) => {
    if (formData.questions[qi].options.length >= 6) return;
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === qi
          ? { ...q, options: [...q.options, { text: '', isCorrect: false }] }
          : q,
      ),
    }));
  };

  const removeOption = (qi: number, oi: number) => {
    if (formData.questions[qi].options.length <= 2) return;
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === qi
          ? { ...q, options: q.options.filter((_, j) => j !== oi) }
          : q,
      ),
    }));
  };

  const updateOption = (qi: number, oi: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === qi
          ? {
              ...q,
              options: q.options.map((o, j) =>
                j === oi ? { ...o, [field]: value } : field === 'isCorrect' && value ? { ...o, isCorrect: false } : o,
              ),
            }
          : q,
      ),
    }));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.skillName) {
      toast.error('Title and skill name are required');
      return;
    }
    const hasEmptyQuestion = formData.questions.some(
      (q) => !q.questionText || q.options.some((o) => !o.text) || !q.options.some((o) => o.isCorrect),
    );
    if (hasEmptyQuestion) {
      toast.error('All questions must have text, options filled, and one correct answer');
      return;
    }
    createMutation.mutate(formData);
  };

  // ─── Table Columns ─────────────────────────────────────────────────────────

  const columns: Column<any>[] = [
    {
      key: 'title',
      header: 'Assessment',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.title}</p>
          <p className="text-xs text-blue-600">{row.skillName}</p>
        </div>
      ),
    },
    {
      key: 'difficulty',
      header: 'Difficulty',
      sortable: true,
      render: (row) => (
        <Badge variant={difficultyColors[row.difficulty]}>
          {row.difficulty}
        </Badge>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      sortable: true,
      render: (row) => <span>{row.duration} min</span>,
    },
    {
      key: 'attemptCount',
      header: 'Attempts',
      sortable: true,
      render: (row) => <span>{row.attemptCount || 0}</span>,
    },
    {
      key: 'avgScore',
      header: 'Avg Score',
      sortable: true,
      render: (row) => (
        <span>{row.avgScore ? `${row.avgScore}%` : '-'}</span>
      ),
    },
    {
      key: 'isActive',
      header: 'Active',
      render: (row) => (
        <button
          onClick={() => toggleActiveMutation.mutate(row._id)}
          className="transition hover:opacity-75"
        >
          {row.isActive ? (
            <ToggleRight className="h-6 w-6 text-green-500" />
          ) : (
            <ToggleLeft className="h-6 w-6 text-gray-400" />
          )}
        </button>
      ),
    },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessment Management</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage skill assessments.</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showCreateForm ? 'Cancel' : 'Create Assessment'}
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">New Assessment</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="JavaScript Fundamentals"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Skill Name *</label>
                <input
                  type="text"
                  value={formData.skillName}
                  onChange={(e) => setFormData((p) => ({ ...p, skillName: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="JavaScript"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData((p) => ({ ...p, difficulty: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Duration (min)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData((p) => ({ ...p, duration: parseInt(e.target.value) || 15 }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  min={1}
                  max={180}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Passing Score (%)</label>
                <input
                  type="number"
                  value={formData.passingScore}
                  onChange={(e) => setFormData((p) => ({ ...p, passingScore: parseInt(e.target.value) || 70 }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  min={1}
                  max={100}
                />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Questions ({formData.questions.length})
                </h3>
                <Button size="sm" variant="outline" onClick={addQuestion}>
                  <Plus className="h-3 w-3" /> Add Question
                </Button>
              </div>

              {formData.questions.map((q, qi) => (
                <div key={qi} className="rounded-lg border border-gray-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Question {qi + 1}</span>
                    {formData.questions.length > 1 && (
                      <button onClick={() => removeQuestion(qi)} className="text-red-400 hover:text-red-600">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={q.questionText}
                    onChange={(e) => updateQuestion(qi, 'questionText', e.target.value)}
                    className="mb-2 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="Question text..."
                  />

                  <div className="mb-3 flex gap-3">
                    <select
                      value={q.questionType}
                      onChange={(e) => updateQuestion(qi, 'questionType', e.target.value)}
                      className="rounded border border-gray-300 px-2 py-1 text-xs"
                    >
                      <option value="multiple-choice">Multiple Choice</option>
                      <option value="true-false">True/False</option>
                      <option value="code-snippet">Code Snippet</option>
                    </select>
                    <input
                      type="number"
                      value={q.points}
                      onChange={(e) => updateQuestion(qi, 'points', parseInt(e.target.value) || 1)}
                      className="w-20 rounded border border-gray-300 px-2 py-1 text-xs"
                      min={1}
                      placeholder="Points"
                    />
                  </div>

                  {q.questionType === 'code-snippet' && (
                    <textarea
                      value={q.codeSnippet}
                      onChange={(e) => updateQuestion(qi, 'codeSnippet', e.target.value)}
                      className="mb-2 w-full rounded border border-gray-300 px-3 py-2 font-mono text-xs focus:border-blue-500 focus:outline-none"
                      rows={3}
                      placeholder="Code snippet..."
                    />
                  )}

                  {/* Options */}
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qi}`}
                          checked={opt.isCorrect}
                          onChange={() => updateOption(qi, oi, 'isCorrect', true)}
                          className="text-blue-600"
                        />
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => updateOption(qi, oi, 'text', e.target.value)}
                          className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                          placeholder={`Option ${oi + 1}`}
                        />
                        {q.options.length > 2 && (
                          <button onClick={() => removeOption(qi, oi)} className="text-gray-400 hover:text-red-500">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    {q.options.length < 6 && (
                      <button
                        onClick={() => addOption(qi)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        + Add option
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={q.explanation}
                    onChange={(e) => updateQuestion(qi, 'explanation', e.target.value)}
                    className="mt-2 w-full rounded border border-gray-200 px-3 py-1.5 text-xs text-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Explanation (shown after answer)"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => { setShowCreateForm(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} isLoading={createMutation.isPending}>
                Create Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={difficulty}
          onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.assessments || []}
        isLoading={isLoading}
        page={data?.page}
        totalPages={data?.totalPages}
        total={data?.total}
        hasNextPage={data?.hasNextPage}
        hasPrevPage={data?.hasPrevPage}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by skill..."
        emptyMessage="No assessments found."
        rowKey={(row) => row._id}
      />
    </div>
  );
}
