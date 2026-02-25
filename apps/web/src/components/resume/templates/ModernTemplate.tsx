import type { IResume } from '@job-platform/shared-types';

interface ModernTemplateProps {
  resume: IResume;
}

export default function ModernTemplate({ resume }: ModernTemplateProps) {
  const { personalInfo, summary, experience, education, skills, languages, certifications, projects } = resume;

  return (
    <div className="mx-auto max-w-[800px] bg-white font-sans text-gray-900">
      {/* Header */}
      <div className="bg-blue-700 px-8 py-6 text-white">
        <h1 className="text-3xl font-bold">{personalInfo.fullName}</h1>
        {personalInfo.headline && (
          <p className="mt-1 text-lg text-blue-100">{personalInfo.headline}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-blue-100">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
        <div className="mt-1 flex flex-wrap gap-4 text-sm text-blue-200">
          {personalInfo.linkedin && <a href={personalInfo.linkedin}>LinkedIn</a>}
          {personalInfo.github && <a href={personalInfo.github}>GitHub</a>}
          {personalInfo.website && <a href={personalInfo.website}>Website</a>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-0">
        {/* Left sidebar */}
        <div className="col-span-1 bg-gray-50 p-6">
          {/* Skills */}
          {skills.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-blue-700">
                Skills
              </h2>
              <div className="space-y-2">
                {skills.map((skill, i) => (
                  <div key={i}>
                    <p className="text-sm font-medium">{skill.name}</p>
                    {skill.proficiency && (
                      <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
                        <div
                          className="h-1.5 rounded-full bg-blue-600"
                          style={{
                            width:
                              skill.proficiency === 'expert' ? '100%' :
                              skill.proficiency === 'advanced' ? '80%' :
                              skill.proficiency === 'intermediate' ? '60%' : '40%',
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-blue-700">
                Languages
              </h2>
              <div className="space-y-1">
                {languages.map((lang, i) => (
                  <p key={i} className="text-sm">
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-gray-500"> - {lang.proficiency}</span>
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-blue-700">
                Certifications
              </h2>
              <div className="space-y-2">
                {certifications.map((cert, i) => (
                  <div key={i} className="text-sm">
                    <p className="font-medium">{cert.name}</p>
                    {cert.issuer && <p className="text-gray-500">{cert.issuer}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="col-span-2 p-6">
          {/* Summary */}
          {summary && (
            <div className="mb-6">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-blue-700">
                Profile
              </h2>
              <p className="text-sm leading-relaxed text-gray-700">{summary}</p>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-blue-700">
                Experience
              </h2>
              {experience.map((exp, i) => (
                <div key={i} className="mb-4 border-l-2 border-blue-200 pl-4">
                  <h3 className="font-bold">{exp.position}</h3>
                  <p className="text-sm text-blue-600">{exp.company}</p>
                  <p className="text-xs text-gray-500">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </p>
                  {exp.description && (
                    <p className="mt-2 whitespace-pre-line text-sm text-gray-700">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-blue-700">
                Education
              </h2>
              {education.map((edu, i) => (
                <div key={i} className="mb-4 border-l-2 border-blue-200 pl-4">
                  <h3 className="font-bold">{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</h3>
                  <p className="text-sm text-blue-600">{edu.institution}</p>
                  <p className="text-xs text-gray-500">
                    {edu.startDate} - {edu.endDate || 'Present'}
                  </p>
                  {edu.grade && <p className="text-xs text-gray-500">Grade: {edu.grade}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-blue-700">
                Projects
              </h2>
              {projects.map((proj, i) => (
                <div key={i} className="mb-3">
                  <h3 className="text-sm font-bold">
                    {proj.name}
                    {proj.url && (
                      <a href={proj.url} className="ml-2 font-normal text-blue-600">
                        Link
                      </a>
                    )}
                  </h3>
                  {proj.description && (
                    <p className="text-sm text-gray-700">{proj.description}</p>
                  )}
                  {proj.technologies && proj.technologies.length > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      {proj.technologies.join(' • ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
