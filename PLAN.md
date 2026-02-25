# Job Searching Platform - Architecture & Plan

## Overview

A hybrid job searching platform for Bangladesh that **aggregates jobs from 7 external sources** (BDJobs, Shomvob, Impactpool, CareerJet, NextJobz, Skill.jobs, UNjobs) AND allows **employers to post jobs directly**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14+ (App Router), React 18+, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB with Mongoose ODM |
| Queue | BullMQ + Redis (scrapers, email, matching) |
| Auth | JWT (access + refresh tokens) |
| File Storage | Cloudinary (images, resumes) |
| Monorepo | Turborepo + pnpm workspaces |
| Testing | Vitest, Supertest, Testing Library |

---

## Project Structure

```
job-searching-platform/
├── apps/
│   ├── web/                          # Next.js frontend
│   │   ├── public/
│   │   └── src/
│   │       ├── app/
│   │       │   ├── (auth)/           # Login, Register, Forgot Password
│   │       │   │   ├── login/page.tsx
│   │       │   │   ├── register/page.tsx
│   │       │   │   ├── forgot-password/page.tsx
│   │       │   │   └── layout.tsx
│   │       │   ├── (main)/           # Public pages
│   │       │   │   ├── page.tsx              # Homepage
│   │       │   │   ├── jobs/
│   │       │   │   │   ├── page.tsx          # Job search/listing
│   │       │   │   │   └── [slug]/page.tsx   # Job detail
│   │       │   │   ├── companies/
│   │       │   │   │   ├── page.tsx
│   │       │   │   │   └── [slug]/page.tsx
│   │       │   │   └── layout.tsx
│   │       │   ├── (dashboard)/      # Authenticated dashboards
│   │       │   │   ├── jobseeker/
│   │       │   │   │   ├── profile/page.tsx
│   │       │   │   │   ├── resume/page.tsx
│   │       │   │   │   ├── applications/page.tsx
│   │       │   │   │   ├── assessments/page.tsx
│   │       │   │   │   ├── saved-jobs/page.tsx
│   │       │   │   │   └── layout.tsx
│   │       │   │   ├── employer/
│   │       │   │   │   ├── dashboard/page.tsx
│   │       │   │   │   ├── post-job/page.tsx
│   │       │   │   │   ├── manage-jobs/page.tsx
│   │       │   │   │   ├── applications/page.tsx
│   │       │   │   │   ├── company-profile/page.tsx
│   │       │   │   │   └── layout.tsx
│   │       │   │   ├── admin/
│   │       │   │   │   ├── dashboard/page.tsx
│   │       │   │   │   ├── users/page.tsx
│   │       │   │   │   ├── jobs/page.tsx
│   │       │   │   │   ├── scrapers/page.tsx
│   │       │   │   │   ├── assessments/page.tsx
│   │       │   │   │   ├── settings/page.tsx
│   │       │   │   │   └── layout.tsx
│   │       │   │   └── layout.tsx    # Shared dashboard layout
│   │       │   ├── layout.tsx        # Root layout
│   │       │   ├── not-found.tsx
│   │       │   └── error.tsx
│   │       ├── components/
│   │       │   ├── ui/               # Button, Input, Card, Modal, Badge, etc.
│   │       │   ├── layout/           # Header, Footer, Sidebar, MobileNav
│   │       │   ├── jobs/             # JobCard, JobFilters, JobSearchBar, JobList
│   │       │   ├── auth/             # LoginForm, RegisterForm
│   │       │   ├── profile/          # ProfileForm, ResumeBuilder, AvatarUpload
│   │       │   ├── employer/         # JobPostForm, ApplicationTable, CandidateCard
│   │       │   ├── admin/            # UserTable, ScraperStatus, StatsCards
│   │       │   └── assessment/       # QuizPlayer, SkillBadge, AssessmentCard
│   │       ├── hooks/
│   │       │   ├── useAuth.ts
│   │       │   ├── useJobs.ts
│   │       │   ├── useDebounce.ts
│   │       │   └── useInfiniteScroll.ts
│   │       ├── lib/
│   │       │   ├── api-client.ts     # Axios wrapper with token refresh
│   │       │   ├── auth.ts           # Token management
│   │       │   ├── utils.ts
│   │       │   └── constants.ts
│   │       ├── providers/
│   │       │   ├── AuthProvider.tsx
│   │       │   ├── QueryProvider.tsx  # TanStack Query
│   │       │   └── ThemeProvider.tsx
│   │       └── styles/globals.css
│   │
│   └── api/                          # Express.js backend
│       ├── src/
│       │   ├── config/
│       │   │   ├── db.ts             # MongoDB connection
│       │   │   ├── env.ts            # Environment validation (Zod)
│       │   │   ├── cors.ts
│       │   │   ├── redis.ts          # Redis/BullMQ connection
│       │   │   └── cloudinary.ts
│       │   ├── models/
│       │   │   ├── User.ts
│       │   │   ├── Job.ts
│       │   │   ├── Company.ts
│       │   │   ├── Application.ts
│       │   │   ├── Resume.ts
│       │   │   ├── Skill.ts
│       │   │   ├── Assessment.ts
│       │   │   ├── AssessmentAttempt.ts
│       │   │   ├── SavedJob.ts
│       │   │   ├── Notification.ts
│       │   │   ├── ScraperLog.ts
│       │   │   └── index.ts
│       │   ├── routes/
│       │   │   ├── auth.routes.ts
│       │   │   ├── user.routes.ts
│       │   │   ├── job.routes.ts
│       │   │   ├── company.routes.ts
│       │   │   ├── application.routes.ts
│       │   │   ├── resume.routes.ts
│       │   │   ├── assessment.routes.ts
│       │   │   ├── admin.routes.ts
│       │   │   ├── scraper.routes.ts
│       │   │   ├── upload.routes.ts
│       │   │   └── index.ts
│       │   ├── controllers/          # One per route module
│       │   ├── services/             # Business logic
│       │   │   ├── auth.service.ts
│       │   │   ├── job.service.ts
│       │   │   ├── matching.service.ts
│       │   │   ├── notification.service.ts
│       │   │   └── email.service.ts
│       │   ├── middleware/
│       │   │   ├── auth.middleware.ts
│       │   │   ├── role.middleware.ts
│       │   │   ├── validate.middleware.ts
│       │   │   ├── rateLimiter.middleware.ts
│       │   │   ├── upload.middleware.ts
│       │   │   └── errorHandler.ts
│       │   ├── scrapers/
│       │   │   ├── base.scraper.ts       # Abstract base class
│       │   │   ├── bdjobs.scraper.ts
│       │   │   ├── shomvob.scraper.ts
│       │   │   ├── impactpool.scraper.ts
│       │   │   ├── careerjet.scraper.ts
│       │   │   ├── nextjobz.scraper.ts
│       │   │   ├── skilljobs.scraper.ts
│       │   │   ├── unjobs.scraper.ts
│       │   │   ├── normalizer.ts
│       │   │   ├── deduplicator.ts
│       │   │   └── index.ts
│       │   ├── jobs/                     # BullMQ processors
│       │   │   ├── scraper.job.ts
│       │   │   ├── email.job.ts
│       │   │   ├── matching.job.ts
│       │   │   ├── cleanup.job.ts
│       │   │   └── queues.ts
│       │   ├── utils/
│       │   │   ├── jwt.ts
│       │   │   ├── password.ts
│       │   │   ├── pagination.ts
│       │   │   ├── slug.ts
│       │   │   └── logger.ts
│       │   ├── validators/
│       │   │   ├── auth.validator.ts
│       │   │   ├── job.validator.ts
│       │   │   └── ...
│       │   ├── app.ts                    # Express app setup
│       │   └── server.ts                 # HTTP server entry point
│       └── tests/
│
├── packages/
│   ├── shared-types/                 # TypeScript interfaces
│   │   └── src/
│   │       ├── user.types.ts
│   │       ├── job.types.ts
│   │       ├── company.types.ts
│   │       ├── application.types.ts
│   │       ├── assessment.types.ts
│   │       ├── api.types.ts
│   │       ├── enums.ts
│   │       └── index.ts
│   ├── shared-validators/            # Shared Zod schemas
│   │   └── src/
│   │       ├── auth.schema.ts
│   │       ├── job.schema.ts
│   │       └── index.ts
│   └── shared-constants/             # Bangladesh locations, categories, industries
│       └── src/
│           ├── categories.ts
│           ├── locations.ts
│           ├── industries.ts
│           └── index.ts
│
├── docker-compose.yml                # MongoDB + Redis
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── .env.example
├── .gitignore
├── .prettierrc
└── .eslintrc.js
```

---

## Database Schema Design

### User
```
email, password (bcrypt), role (jobseeker/employer/admin), isEmailVerified, isActive
profile: { firstName, lastName, phone, avatar, dateOfBirth, gender, location, headline, bio }
skills: [Skill refs], preferredJobTypes, preferredCategories, expectedSalary
company: Company ref (for employers)
refreshTokens: [{ token, expiresAt, device }]
```

### Company
```
name, slug, description, industry, companySize, website, logo, coverImage
location: { address, district, division }
isVerified, owners: [User refs], totalJobs, activeJobs
```

### Job (central collection - holds BOTH original + aggregated)
```
title, slug, description, shortDescription
source: (original | bdjobs | shomvob | impactpool | careerjet | nextjobz | skilljobs | unjobs)
sourceUrl, sourceJobId, sourceScrapedAt
company ref, companyName (denormalized), companyLogo
category, subcategory, jobType, experienceLevel, experienceYears
location: { district, division, isRemote }
salary: { min, max, currency, isNegotiable, period }
skills refs, skillNames (denormalized), requirements[], responsibilities[], benefits[]
applicationMethod: (internal | external | email), applicationUrl, applicationEmail
status: (draft | active | paused | expired | closed), publishedAt, deadline, vacancies
viewCount, applicationCount, saveCount, isFeatured, isApproved
TEXT INDEX: title(10x) + skillNames(5x) + companyName(3x) + description(1x)
```

### Application
```
job, applicant, resume, coverLetter, answers[]
status: (applied | viewed | shortlisted | interview | offered | hired | rejected | withdrawn)
employerNotes, rating, statusHistory[], matchScore
UNIQUE: (job + applicant)
```

### Resume
```
user, title, isDefault
fileUrl + fileType (uploaded) OR structured data:
  personalInfo, objective, education[], experience[], skills[], certifications[], languages[], projects[], references[]
template
```

### Skill
```
name, slug, category, description, jobCount, userCount
```

### Assessment
```
title, slug, skill ref, difficulty, duration (min), passingScore
questions: [{ questionText, questionType (MC/TF/code), options[], explanation, points }]
```

### AssessmentAttempt
```
user, assessment, answers[], score, passed, timeTaken, startedAt, completedAt
```

### Others
- **SavedJob**: user + job (unique)
- **Notification**: user, type, title, message, link, isRead (30-day TTL)
- **ScraperLog**: source, status, stats, errorMessages, duration (90-day TTL)

---

## API Endpoints

### Auth (`/api/v1/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register (jobseeker or employer) |
| POST | `/login` | Login, returns access + refresh tokens |
| POST | `/refresh-token` | Refresh access token |
| POST | `/logout` | Invalidate refresh token |
| POST | `/forgot-password` | Send reset email |
| POST | `/reset-password/:token` | Reset password |
| GET | `/verify-email/:token` | Verify email |
| GET | `/me` | Get current user |

### Users (`/api/v1/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PUT | `/profile` | Own profile CRUD |
| PUT | `/change-password` | Change password |
| GET | `/:userId/public` | Public profile |
| PUT | `/preferences` | Job preferences |
| GET/PUT | `/skills` | Own skills |
| GET | `/notifications` | Notifications (paginated) |
| PUT | `/notifications/:id/read` | Mark read |

### Jobs (`/api/v1/jobs`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Search with filters (q, category, division, district, jobType, salary, source, isRemote, sort, page) |
| GET | `/featured` | Featured jobs |
| GET | `/recent` | Recent jobs |
| GET | `/categories` | Categories with counts |
| GET | `/:slug` | Job detail |
| GET | `/:slug/similar` | Similar jobs |
| POST | `/` | Create job (employer) |
| PUT | `/:jobId` | Update job (employer) |
| DELETE | `/:jobId` | Delete job (employer) |
| POST/DELETE | `/:jobId/save` | Save/unsave (jobseeker) |
| GET | `/saved` | Saved jobs |
| GET | `/recommended` | Skill-matched recommendations |

### Companies (`/api/v1/companies`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List companies |
| GET | `/:slug` | Company detail |
| GET | `/:slug/jobs` | Company's jobs |
| POST | `/` | Create company (employer) |
| PUT | `/:companyId` | Update company (employer) |

### Applications (`/api/v1/applications`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Apply to job |
| GET | `/my` | My applications |
| DELETE | `/my/:id` | Withdraw |
| GET | `/job/:jobId` | Applications for a job (employer) |
| PUT | `/:id/status` | Update status (employer) |
| PUT | `/:id/notes` | Add notes (employer) |

### Resumes (`/api/v1/resumes`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/` | List/create resumes |
| GET/PUT/DELETE | `/:id` | Resume CRUD |
| POST | `/upload` | Upload file |
| PUT | `/:id/default` | Set default |
| GET | `/:id/download` | Download PDF |

### Assessments (`/api/v1/assessments`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List assessments |
| GET | `/:slug` | Assessment detail |
| POST | `/:id/start` | Start attempt |
| POST | `/:id/submit` | Submit answers |
| GET | `/my-attempts` | My results |

### Admin (`/api/v1/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Stats |
| GET/PUT | `/users` | User management |
| GET/PUT/DELETE | `/jobs` | Job moderation |
| GET/PUT | `/companies` | Company verification |
| GET/POST/PUT | `/scrapers` | Scraper control |
| POST/PUT/DELETE | `/assessments` | Assessment CRUD |
| GET/PUT | `/settings` | Platform settings |

---

## Key Architectural Decisions

### 1. Separate Express Backend (not Next.js API Routes)
Long-running BullMQ workers for scrapers, cron jobs, and queue processors don't fit the serverless model of Next.js API routes. Express allows independent scaling and full process lifecycle control.

### 2. Single Job Collection for Original + Aggregated
A unified collection enables single-query search across all sources. The `source` field distinguishes origin. `sourceJobId` enables deduplication. Original jobs use internal apply; aggregated jobs redirect to sourceUrl.

### 3. MongoDB Text Index for Search (upgradeable to Atlas Search)
Weighted text index (title 10x, skills 5x, company 3x, description 1x) handles MVP search. Service layer abstraction allows swapping to Atlas Search or Elasticsearch when scaling beyond 100K jobs.

### 4. JWT Access (15min) + Refresh Token (7d, httpOnly cookie)
Stateless API, horizontally scalable. Short-lived access token limits exposure. Refresh token in httpOnly cookie prevents XSS theft. Token rotation on each refresh prevents replay attacks.

### 5. BullMQ + Redis for Scraper Scheduling
Cron schedules per source (4-12h intervals), retry with exponential backoff, concurrency control. Strategy pattern makes scrapers pluggable - new source = new class implementing BaseScraper.

### 6. Skill Matching Algorithm (Weighted Scoring 0-100)
- 40%: Verified skills (passed assessments)
- 20%: Self-declared skills
- 15%: Experience level match
- 15%: Location preference match
- 10%: Salary expectation overlap

---

## Scraper Strategy Per Source

| Source | Method | Schedule |
|--------|--------|----------|
| CareerJet | Official REST API | Every 4h |
| BDJobs | HTML scraping (Cheerio) | Every 6h |
| Impactpool | HTML scraping (Cheerio) | Every 12h |
| Shomvob | Puppeteer (JS-rendered) | Every 8h |
| NextJobz | Puppeteer (JS-rendered) | Every 12h |
| Skill.jobs | Cheerio or Puppeteer | Every 12h |
| UNjobs | HTML scraping (Cheerio) | Every 12h |

---

## Key Packages

### Frontend
next, tailwindcss, @tanstack/react-query, axios, react-hook-form, zod, @hookform/resolvers, next-intl, lucide-react, recharts, tiptap, sonner, nuqs, date-fns, clsx, tailwind-merge

### Backend
express, mongoose, jsonwebtoken, bcryptjs, zod, bullmq, ioredis, cheerio, puppeteer, axios, multer, cloudinary, nodemailer, pino, helmet, cors, express-rate-limit, rate-limit-redis, slugify, sanitize-html, puppeteer-extra, puppeteer-extra-plugin-stealth

### Testing
vitest, @testing-library/react, supertest, mongodb-memory-server, msw

### Dev Tooling
turborepo, pnpm, typescript, eslint, prettier, husky, lint-staged, tsx, nodemon
