export enum UserRole {
  JOBSEEKER = 'jobseeker',
  EMPLOYER = 'employer',
  ADMIN = 'admin',
}

export enum JobType {
  FULL_TIME = 'full-time',
  PART_TIME = 'part-time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
  FREELANCE = 'freelance',
  REMOTE = 'remote',
}

export enum ExperienceLevel {
  ENTRY = 'entry',
  MID = 'mid',
  SENIOR = 'senior',
  EXECUTIVE = 'executive',
}

export enum JobSource {
  ORIGINAL = 'original',
  BDJOBS = 'bdjobs',
  SHOMVOB = 'shomvob',
  IMPACTPOOL = 'impactpool',
  CAREERJET = 'careerjet',
  NEXTJOBZ = 'nextjobz',
  SKILLJOBS = 'skilljobs',
  UNJOBS = 'unjobs',
}

export enum JobStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  CLOSED = 'closed',
}

export enum ApplicationStatus {
  APPLIED = 'applied',
  VIEWED = 'viewed',
  SHORTLISTED = 'shortlisted',
  INTERVIEW = 'interview',
  OFFERED = 'offered',
  HIRED = 'hired',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

export enum ApplicationMethod {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
  EMAIL = 'email',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum CompanySize {
  TINY = '1-10',
  SMALL = '11-50',
  MEDIUM = '51-200',
  LARGE = '201-500',
  XLARGE = '501-1000',
  ENTERPRISE = '1000+',
}

export enum AssessmentDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple-choice',
  TRUE_FALSE = 'true-false',
  CODE_SNIPPET = 'code-snippet',
}

export enum SkillProficiency {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum NotificationType {
  APPLICATION_STATUS = 'application_status',
  NEW_MATCH = 'new_match',
  JOB_EXPIRING = 'job_expiring',
  ASSESSMENT_RESULT = 'assessment_result',
  NEW_APPLICATION = 'new_application',
  SYSTEM = 'system',
}

export enum SalaryPeriod {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  HOURLY = 'hourly',
}
