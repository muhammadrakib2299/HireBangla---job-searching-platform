import type { IResume } from '@job-platform/shared-types';

interface MinimalTemplateProps {
  resume: IResume;
}

export default function MinimalTemplate({ resume }: MinimalTemplateProps) {
  const { personalInfo, summary, experience, education, skills, languages, certifications, projects } = resume;

  return (
    <div className="mx-auto max-w-[800px] bg-white p-8 font-sans text-gray-900">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{personalInfo.fullName}</h1>
        {personalInfo.headline && (
          <p className="mt-0.5 text-gray-500">{personalInfo.headline}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedin && <a href={personalInfo.linkedin} className="text-gray-700 underline">LinkedIn</a>}
          {personalInfo.github && <a href={personalInfo.github} className="text-gray-700 underline">GitHub</a>}
          {personalInfo.website && <a href={personalInfo.website} className="text-gray-700 underline">Website</a>}
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Summary */}
      {summary && (
        <div className="my-4">
          <p className="text-sm leading-relaxed text-gray-600">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="my-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Experience
          </h2>
          {experience.map((exp, i) => (
            <div key={i} className="mb-4">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold">
                  {exp.position} <span className="font-normal text-gray-500">at {exp.company}</span>
                </h3>
                <span className="text-xs text-gray-400">
                  {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                </span>
              </div>
              {exp.description && (
                <p className="mt-1 whitespace-pre-line text-sm text-gray-600">{exp.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="my-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Education
          </h2>
          {education.map((edu, i) => (
            <div key={i} className="mb-3">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold">
                  {edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}
                </h3>
                <span className="text-xs text-gray-400">
                  {edu.startDate} — {edu.endDate || 'Present'}
                </span>
              </div>
              <p className="text-sm text-gray-500">{edu.institution}</p>
              {edu.grade && <p className="text-xs text-gray-400">Grade: {edu.grade}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="my-5">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Skills
          </h2>
          <p className="text-sm text-gray-600">
            {skills.map((s) => s.name).join(' • ')}
          </p>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="my-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Projects
          </h2>
          {projects.map((proj, i) => (
            <div key={i} className="mb-3">
              <h3 className="text-sm font-semibold">
                {proj.name}
                {proj.url && (
                  <a href={proj.url} className="ml-1 text-xs font-normal text-gray-400 underline">
                    link
                  </a>
                )}
              </h3>
              {proj.description && (
                <p className="text-sm text-gray-600">{proj.description}</p>
              )}
              {proj.technologies && proj.technologies.length > 0 && (
                <p className="text-xs text-gray-400">{proj.technologies.join(', ')}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="my-5">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Certifications
          </h2>
          <div className="space-y-1">
            {certifications.map((cert, i) => (
              <p key={i} className="text-sm text-gray-600">
                {cert.name}
                {cert.issuer && <span className="text-gray-400"> — {cert.issuer}</span>}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div className="my-5">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Languages
          </h2>
          <p className="text-sm text-gray-600">
            {languages.map((l) => `${l.name} (${l.proficiency})`).join(' • ')}
          </p>
        </div>
      )}
    </div>
  );
}
