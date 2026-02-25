import type { IResume } from '@job-platform/shared-types';

interface ClassicTemplateProps {
  resume: IResume;
}

export default function ClassicTemplate({ resume }: ClassicTemplateProps) {
  const { personalInfo, summary, experience, education, skills, languages, certifications, projects } = resume;

  return (
    <div className="mx-auto max-w-[800px] bg-white p-8 font-serif text-gray-900">
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-4 text-center">
        <h1 className="text-3xl font-bold uppercase tracking-wide">
          {personalInfo.fullName}
        </h1>
        {personalInfo.headline && (
          <p className="mt-1 text-lg text-gray-600">{personalInfo.headline}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-600">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-3 text-sm text-blue-700">
          {personalInfo.linkedin && <a href={personalInfo.linkedin}>LinkedIn</a>}
          {personalInfo.github && <a href={personalInfo.github}>GitHub</a>}
          {personalInfo.website && <a href={personalInfo.website}>Website</a>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="mt-4">
          <h2 className="mb-2 text-lg font-bold uppercase tracking-wide">Summary</h2>
          <p className="text-sm leading-relaxed text-gray-700">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mt-4">
          <h2 className="mb-2 border-b border-gray-300 pb-1 text-lg font-bold uppercase tracking-wide">
            Experience
          </h2>
          {experience.map((exp, i) => (
            <div key={i} className="mt-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold">{exp.position}</h3>
                  <p className="text-sm text-gray-600">{exp.company}</p>
                </div>
                <p className="text-sm text-gray-500">
                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                </p>
              </div>
              {exp.description && (
                <p className="mt-1 whitespace-pre-line text-sm text-gray-700">{exp.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mt-4">
          <h2 className="mb-2 border-b border-gray-300 pb-1 text-lg font-bold uppercase tracking-wide">
            Education
          </h2>
          {education.map((edu, i) => (
            <div key={i} className="mt-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold">{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</h3>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                </div>
                <p className="text-sm text-gray-500">
                  {edu.startDate} - {edu.endDate || 'Present'}
                </p>
              </div>
              {edu.grade && <p className="mt-1 text-sm text-gray-600">Grade: {edu.grade}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mt-4">
          <h2 className="mb-2 border-b border-gray-300 pb-1 text-lg font-bold uppercase tracking-wide">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span key={i} className="text-sm text-gray-700">
                {skill.name}{skill.proficiency ? ` (${skill.proficiency})` : ''}
                {i < skills.length - 1 ? ' •' : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mt-4">
          <h2 className="mb-2 border-b border-gray-300 pb-1 text-lg font-bold uppercase tracking-wide">
            Projects
          </h2>
          {projects.map((proj, i) => (
            <div key={i} className="mt-3">
              <h3 className="font-bold">
                {proj.name}
                {proj.url && (
                  <a href={proj.url} className="ml-2 text-sm font-normal text-blue-700">
                    Link
                  </a>
                )}
              </h3>
              {proj.description && (
                <p className="mt-1 text-sm text-gray-700">{proj.description}</p>
              )}
              {proj.technologies && proj.technologies.length > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  Technologies: {proj.technologies.join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="mt-4">
          <h2 className="mb-2 border-b border-gray-300 pb-1 text-lg font-bold uppercase tracking-wide">
            Certifications
          </h2>
          {certifications.map((cert, i) => (
            <div key={i} className="mt-2 text-sm">
              <span className="font-semibold">{cert.name}</span>
              {cert.issuer && <span className="text-gray-600"> - {cert.issuer}</span>}
              {cert.date && <span className="text-gray-500"> ({cert.date})</span>}
            </div>
          ))}
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div className="mt-4">
          <h2 className="mb-2 border-b border-gray-300 pb-1 text-lg font-bold uppercase tracking-wide">
            Languages
          </h2>
          <div className="flex flex-wrap gap-4 text-sm">
            {languages.map((lang, i) => (
              <span key={i}>
                {lang.name} - {lang.proficiency}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
