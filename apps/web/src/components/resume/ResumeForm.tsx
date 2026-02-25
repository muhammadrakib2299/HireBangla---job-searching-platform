'use client';

import { useState } from 'react';
import { useForm, useFieldArray, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createResumeSchema, type CreateResumeInput } from '@job-platform/shared-validators';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import ResumePreview from './ResumePreview';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import type { IResume, ResumeTemplate } from '@job-platform/shared-types';

const STEPS = [
  'Template',
  'Personal Info',
  'Experience',
  'Education',
  'Skills',
  'Projects',
  'Preview',
] as const;

interface ResumeFormProps {
  defaultValues?: Partial<CreateResumeInput>;
  onSubmit: (data: CreateResumeInput) => Promise<void>;
  isSubmitting: boolean;
  submitLabel?: string;
}

export default function ResumeForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = 'Save Resume',
}: ResumeFormProps) {
  const [step, setStep] = useState(0);

  const form = useForm<CreateResumeInput>({
    resolver: zodResolver(createResumeSchema),
    defaultValues: {
      title: '',
      template: 'classic',
      personalInfo: { fullName: '', email: '' },
      summary: '',
      experience: [],
      education: [],
      skills: [],
      languages: [],
      certifications: [],
      projects: [],
      ...defaultValues,
    },
  });

  const { handleSubmit, watch } = form;
  const formValues = watch();

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(i)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              i === step
                ? 'bg-blue-600 text-white'
                : i < step
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleFormSubmit}>
        {step === 0 && <TemplateStep form={form} />}
        {step === 1 && <PersonalInfoStep form={form} />}
        {step === 2 && <ExperienceStep form={form} />}
        {step === 3 && <EducationStep form={form} />}
        {step === 4 && <SkillsStep form={form} />}
        {step === 5 && <ProjectsStep form={form} />}
        {step === 6 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Preview</h2>
            <div className="overflow-auto rounded-lg border border-gray-200">
              <ResumePreview resume={formValues as unknown as IResume} />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prev}
            disabled={step === 0}
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" isLoading={isSubmitting}>
              {submitLabel}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

// ── Step Components ──────────────────────────────────────────────────────────

function TemplateStep({ form }: { form: UseFormReturn<CreateResumeInput> }) {
  const { register, watch, setValue, formState: { errors } } = form;
  const selected = watch('template');

  const templates: { id: ResumeTemplate; label: string; desc: string }[] = [
    { id: 'classic', label: 'Classic', desc: 'Traditional layout with serif fonts' },
    { id: 'modern', label: 'Modern', desc: 'Two-column layout with accent colors' },
    { id: 'minimal', label: 'Minimal', desc: 'Clean, simple design with lots of whitespace' },
  ];

  return (
    <div className="space-y-4">
      <Input
        id="title"
        label="Resume Title"
        placeholder="e.g. Software Developer Resume"
        error={errors.title?.message}
        {...register('title')}
      />
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Choose Template
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setValue('template', t.id)}
              className={`rounded-lg border-2 p-4 text-left transition-colors ${
                selected === t.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-semibold">{t.label}</p>
              <p className="mt-1 text-sm text-gray-500">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PersonalInfoStep({ form }: { form: UseFormReturn<CreateResumeInput> }) {
  const { register, formState: { errors } } = form;
  const piErrors = errors.personalInfo;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Personal Information</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="fullName"
          label="Full Name"
          error={piErrors?.fullName?.message}
          {...register('personalInfo.fullName')}
        />
        <Input
          id="email"
          label="Email"
          type="email"
          error={piErrors?.email?.message}
          {...register('personalInfo.email')}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="phone"
          label="Phone"
          error={piErrors?.phone?.message}
          {...register('personalInfo.phone')}
        />
        <Input
          id="location"
          label="Location"
          placeholder="e.g. Dhaka, Bangladesh"
          error={piErrors?.location?.message}
          {...register('personalInfo.location')}
        />
      </div>
      <Input
        id="headline"
        label="Professional Headline"
        placeholder="e.g. Full Stack Developer"
        error={piErrors?.headline?.message}
        {...register('personalInfo.headline')}
      />
      <div className="w-full">
        <label htmlFor="summary" className="mb-1.5 block text-sm font-medium text-gray-700">
          Summary
        </label>
        <textarea
          id="summary"
          rows={4}
          className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          placeholder="Brief professional summary..."
          {...register('summary')}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          id="linkedin"
          label="LinkedIn"
          placeholder="https://linkedin.com/in/..."
          error={piErrors?.linkedin?.message}
          {...register('personalInfo.linkedin')}
        />
        <Input
          id="github"
          label="GitHub"
          placeholder="https://github.com/..."
          error={piErrors?.github?.message}
          {...register('personalInfo.github')}
        />
        <Input
          id="website"
          label="Website"
          placeholder="https://..."
          error={piErrors?.website?.message}
          {...register('personalInfo.website')}
        />
      </div>
    </div>
  );
}

function ExperienceStep({ form }: { form: UseFormReturn<CreateResumeInput> }) {
  const { register, control } = form;
  const { fields, append, remove } = useFieldArray({ control, name: 'experience' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Experience</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({ company: '', position: '', startDate: '', endDate: '', current: false, description: '' })
          }
        >
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-gray-500">No experience added. Click Add to start.</p>
      )}

      {fields.map((field, i) => (
        <Card key={field.id}>
          <CardContent className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Experience {i + 1}</h3>
              <button type="button" onClick={() => remove(i)} className="text-red-500 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Company" {...register(`experience.${i}.company`)} />
              <Input label="Position" {...register(`experience.${i}.position`)} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Start Date" type="month" {...register(`experience.${i}.startDate`)} />
              <Input label="End Date" type="month" {...register(`experience.${i}.endDate`)} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register(`experience.${i}.current`)} className="h-4 w-4 rounded" />
              Currently working here
            </label>
            <div className="w-full">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                {...register(`experience.${i}.description`)}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EducationStep({ form }: { form: UseFormReturn<CreateResumeInput> }) {
  const { register, control } = form;
  const { fields, append, remove } = useFieldArray({ control, name: 'education' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Education</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', grade: '' })
          }
        >
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-gray-500">No education added. Click Add to start.</p>
      )}

      {fields.map((field, i) => (
        <Card key={field.id}>
          <CardContent className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Education {i + 1}</h3>
              <button type="button" onClick={() => remove(i)} className="text-red-500 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Institution" {...register(`education.${i}.institution`)} />
              <Input label="Degree" {...register(`education.${i}.degree`)} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Field of Study" {...register(`education.${i}.fieldOfStudy`)} />
              <Input label="Grade/GPA" {...register(`education.${i}.grade`)} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Start Date" type="month" {...register(`education.${i}.startDate`)} />
              <Input label="End Date" type="month" {...register(`education.${i}.endDate`)} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SkillsStep({ form }: { form: UseFormReturn<CreateResumeInput> }) {
  const { register, control } = form;
  const skills = useFieldArray({ control, name: 'skills' });
  const languages = useFieldArray({ control, name: 'languages' });
  const certifications = useFieldArray({ control, name: 'certifications' });

  return (
    <div className="space-y-6">
      {/* Skills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Skills</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => skills.append({ name: '', proficiency: undefined })}
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        {skills.fields.map((field, i) => (
          <div key={field.id} className="flex items-end gap-2">
            <Input label={i === 0 ? 'Skill' : undefined} {...register(`skills.${i}.name`)} />
            <select
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              {...register(`skills.${i}.proficiency`)}
            >
              <option value="">Proficiency</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
            <button type="button" onClick={() => skills.remove(i)} className="mb-1 text-red-500 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Languages */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Languages</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => languages.append({ name: '', proficiency: '' })}
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        {languages.fields.map((field, i) => (
          <div key={field.id} className="flex items-end gap-2">
            <Input label={i === 0 ? 'Language' : undefined} {...register(`languages.${i}.name`)} />
            <Input label={i === 0 ? 'Proficiency' : undefined} placeholder="e.g. Native, Fluent" {...register(`languages.${i}.proficiency`)} />
            <button type="button" onClick={() => languages.remove(i)} className="mb-1 text-red-500 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Certifications */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Certifications</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => certifications.append({ name: '', issuer: '', date: '', url: '' })}
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        {certifications.fields.map((field, i) => (
          <Card key={field.id}>
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Certification {i + 1}</h3>
                <button type="button" onClick={() => certifications.remove(i)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input label="Name" {...register(`certifications.${i}.name`)} />
                <Input label="Issuer" {...register(`certifications.${i}.issuer`)} />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input label="Date" type="month" {...register(`certifications.${i}.date`)} />
                <Input label="URL" {...register(`certifications.${i}.url`)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProjectsStep({ form }: { form: UseFormReturn<CreateResumeInput> }) {
  const { register, control } = form;
  const { fields, append, remove } = useFieldArray({ control, name: 'projects' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Projects</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ name: '', description: '', url: '', technologies: [] })}
        >
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-gray-500">No projects added. Click Add to start.</p>
      )}

      {fields.map((field, i) => (
        <Card key={field.id}>
          <CardContent className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Project {i + 1}</h3>
              <button type="button" onClick={() => remove(i)} className="text-red-500 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Name" {...register(`projects.${i}.name`)} />
              <Input label="URL" {...register(`projects.${i}.url`)} />
            </div>
            <div className="w-full">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                {...register(`projects.${i}.description`)}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
