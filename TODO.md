# Job Searching Platform - Step-by-Step TODO

## Phase 0: Project Scaffolding

- [ ] **0.1** Initialize git repository
- [ ] **0.2** Create root `package.json` with pnpm workspace config
- [ ] **0.3** Create `pnpm-workspace.yaml` defining apps/ and packages/ workspaces
- [ ] **0.4** Create `turbo.json` with pipeline config (dev, build, lint, test)
- [ ] **0.5** Create `.gitignore` (node_modules, .env, dist, .next, .turbo)
- [ ] **0.6** Create `.env.example` with all required environment variables
- [ ] **0.7** Create `docker-compose.yml` for MongoDB + Redis
- [ ] **0.8** Scaffold `apps/web` - Next.js with App Router, TypeScript, Tailwind CSS
- [ ] **0.9** Scaffold `apps/api` - Express.js with TypeScript (tsx for dev)
- [ ] **0.10** Create `packages/shared-types` - TypeScript interfaces and enums
- [ ] **0.11** Create `packages/shared-validators` - Zod schemas
- [ ] **0.12** Create `packages/shared-constants` - BD locations, job categories, industries
- [ ] **0.13** Create `packages/eslint-config` - shared ESLint config
- [ ] **0.14** Create `packages/tsconfig` - shared TypeScript base configs
- [ ] **0.15** Configure `.prettierrc` and `.eslintrc.js` at root
- [ ] **0.16** Set up `apps/api/src/config/env.ts` - Zod environment validation
- [ ] **0.17** Set up `apps/api/src/config/db.ts` - MongoDB connection with Mongoose
- [ ] **0.18** Set up `apps/api/src/app.ts` - Express app with helmet, cors, json parser
- [ ] **0.19** Set up `apps/api/src/server.ts` - HTTP server entry point
- [ ] **0.20** Set up `apps/api/src/middleware/errorHandler.ts` - global error handler
- [ ] **0.21** Set up `apps/api/src/utils/logger.ts` - Pino logger
- [ ] **0.22** Verify `turbo dev` starts both apps (Next.js :3000, Express :5000)
- [ ] **0.23** Verify Express connects to MongoDB successfully

---

## Phase 1: Authentication + Core User System

### Backend
- [ ] **1.1** Create `User` model (`apps/api/src/models/User.ts`) with full schema
- [ ] **1.2** Create `Company` model (`apps/api/src/models/Company.ts`)
- [ ] **1.3** Create `apps/api/src/utils/password.ts` - bcrypt hash/compare helpers
- [ ] **1.4** Create `apps/api/src/utils/jwt.ts` - sign/verify access + refresh tokens
- [ ] **1.5** Create `apps/api/src/validators/auth.validator.ts` - Zod schemas for register, login, reset
- [ ] **1.6** Create `apps/api/src/middleware/validate.middleware.ts` - Zod validation middleware
- [ ] **1.7** Create `apps/api/src/middleware/auth.middleware.ts` - JWT verification
- [ ] **1.8** Create `apps/api/src/middleware/role.middleware.ts` - role-based access guard
- [ ] **1.9** Create `apps/api/src/services/auth.service.ts` - register, login, refresh, verify email, reset password
- [ ] **1.10** Create `apps/api/src/services/email.service.ts` - Nodemailer setup + email templates
- [ ] **1.11** Create `apps/api/src/controllers/auth.controller.ts`
- [ ] **1.12** Create `apps/api/src/routes/auth.routes.ts` - all auth endpoints
- [ ] **1.13** Create `apps/api/src/controllers/user.controller.ts` - profile CRUD
- [ ] **1.14** Create `apps/api/src/routes/user.routes.ts` - user endpoints
- [ ] **1.15** Create `apps/api/src/routes/index.ts` - route aggregator
- [ ] **1.16** Set up `apps/api/src/middleware/rateLimiter.middleware.ts` on auth routes
- [ ] **1.17** Test all auth endpoints with API client (Postman/Thunder Client)

### Shared Packages
- [ ] **1.18** Define user types in `packages/shared-types/src/user.types.ts`
- [ ] **1.19** Define enums in `packages/shared-types/src/enums.ts` (UserRole, JobType, etc.)
- [ ] **1.20** Define auth Zod schemas in `packages/shared-validators/src/auth.schema.ts`

### Frontend
- [ ] **1.21** Create `apps/web/src/lib/api-client.ts` - Axios instance with interceptors
- [ ] **1.22** Create `apps/web/src/lib/auth.ts` - token storage + refresh logic
- [ ] **1.23** Create `apps/web/src/providers/AuthProvider.tsx` - auth context
- [ ] **1.24** Create `apps/web/src/providers/QueryProvider.tsx` - TanStack Query
- [ ] **1.25** Create `apps/web/src/app/layout.tsx` - root layout with providers
- [ ] **1.26** Create UI components: Button, Input, Card, Modal, Badge (`apps/web/src/components/ui/`)
- [ ] **1.27** Create `apps/web/src/components/layout/Header.tsx` - with auth state
- [ ] **1.28** Create `apps/web/src/components/layout/Footer.tsx`
- [ ] **1.29** Create `apps/web/src/components/layout/Sidebar.tsx` - dashboard sidebar
- [ ] **1.30** Create `apps/web/src/app/(auth)/layout.tsx` - auth pages layout
- [ ] **1.31** Create `apps/web/src/app/(auth)/login/page.tsx` - login page
- [ ] **1.32** Create `apps/web/src/app/(auth)/register/page.tsx` - register (jobseeker/employer)
- [ ] **1.33** Create `apps/web/src/app/(auth)/forgot-password/page.tsx`
- [ ] **1.34** Create `apps/web/src/hooks/useAuth.ts` - auth hook
- [ ] **1.35** Create protected route wrapper component
- [ ] **1.36** Create `apps/web/src/app/(dashboard)/layout.tsx` - dashboard layout with sidebar
- [ ] **1.37** Create skeleton dashboard pages for jobseeker, employer, admin
- [ ] **1.38** Test full auth flow: register -> verify email -> login -> access dashboard -> logout

---

## Phase 2: Job Posting + Search

### Backend
- [ ] **2.1** Create `Skill` model with text index
- [ ] **2.2** Create skill seeding script (`apps/api/src/scripts/seed-skills.ts`) with common BD job skills
- [ ] **2.3** Create `Job` model with weighted text index + all filter indexes
- [ ] **2.4** Create `apps/api/src/utils/slug.ts` - slug generation
- [ ] **2.5** Create `apps/api/src/utils/pagination.ts` - pagination helper
- [ ] **2.6** Create `apps/api/src/validators/job.validator.ts` - Zod schemas
- [ ] **2.7** Create `apps/api/src/services/job.service.ts` - CRUD, search with filters, pagination, sorting
- [ ] **2.8** Create `apps/api/src/controllers/job.controller.ts`
- [ ] **2.9** Create `apps/api/src/routes/job.routes.ts`
- [ ] **2.10** Create `apps/api/src/validators/company.validator.ts`
- [ ] **2.11** Create `apps/api/src/services/company.service.ts`
- [ ] **2.12** Create `apps/api/src/controllers/company.controller.ts`
- [ ] **2.13** Create `apps/api/src/routes/company.routes.ts`
- [ ] **2.14** Set up Cloudinary config (`apps/api/src/config/cloudinary.ts`)
- [ ] **2.15** Create `apps/api/src/middleware/upload.middleware.ts` - Multer config
- [ ] **2.16** Create `apps/api/src/controllers/upload.controller.ts`
- [ ] **2.17** Create `apps/api/src/routes/upload.routes.ts`
- [ ] **2.18** Register all new routes in route aggregator
- [ ] **2.19** Test job search with various filter combinations

### Shared Packages
- [ ] **2.20** Define job types in `packages/shared-types/src/job.types.ts`
- [ ] **2.21** Define company types in `packages/shared-types/src/company.types.ts`
- [ ] **2.22** Add BD locations in `packages/shared-constants/src/locations.ts` (8 divisions, 64 districts)
- [ ] **2.23** Add job categories in `packages/shared-constants/src/categories.ts`
- [ ] **2.24** Add industries in `packages/shared-constants/src/industries.ts`

### Frontend
- [ ] **2.25** Create `apps/web/src/app/(main)/layout.tsx` - public pages layout
- [ ] **2.26** Create `apps/web/src/components/jobs/JobCard.tsx` - job listing card
- [ ] **2.27** Create `apps/web/src/components/jobs/JobSearchBar.tsx` - keyword + location input
- [ ] **2.28** Create `apps/web/src/components/jobs/JobFilters.tsx` - filter sidebar
- [ ] **2.29** Create `apps/web/src/components/jobs/JobList.tsx` - paginated job list
- [ ] **2.30** Create `apps/web/src/hooks/useJobs.ts` - TanStack Query hooks for jobs
- [ ] **2.31** Create `apps/web/src/app/(main)/page.tsx` - Homepage (hero, search bar, featured jobs, categories, stats)
- [ ] **2.32** Create `apps/web/src/app/(main)/jobs/page.tsx` - Job search page with URL-based filter state
- [ ] **2.33** Create `apps/web/src/app/(main)/jobs/[slug]/page.tsx` - Job detail page
- [ ] **2.34** Create `apps/web/src/app/(main)/companies/page.tsx` - Company listing
- [ ] **2.35** Create `apps/web/src/app/(main)/companies/[slug]/page.tsx` - Company detail
- [ ] **2.36** Create `apps/web/src/components/employer/JobPostForm.tsx` - job posting form with rich text editor
- [ ] **2.37** Create `apps/web/src/app/(dashboard)/employer/post-job/page.tsx`
- [ ] **2.38** Create `apps/web/src/app/(dashboard)/employer/manage-jobs/page.tsx` - list & manage
- [ ] **2.39** Create `apps/web/src/app/(dashboard)/employer/company-profile/page.tsx`
- [ ] **2.40** Test: post job as employer -> appears in search -> view detail

---

## Phase 3: Applications + Resume Builder

### Backend
- [ ] **3.1** Create `Application` model with unique compound index (job + applicant)
- [ ] **3.2** Create `apps/api/src/validators/application.validator.ts`
- [ ] **3.3** Create `apps/api/src/services/application.service.ts` - apply, withdraw, status updates
- [ ] **3.4** Create `apps/api/src/controllers/application.controller.ts`
- [ ] **3.5** Create `apps/api/src/routes/application.routes.ts`
- [ ] **3.6** Create `Resume` model (uploaded file + structured builder data)
- [ ] **3.7** Create `apps/api/src/services/resume.service.ts` - CRUD, PDF generation
- [ ] **3.8** Create `apps/api/src/controllers/resume.controller.ts`
- [ ] **3.9** Create `apps/api/src/routes/resume.routes.ts`
- [ ] **3.10** Create `SavedJob` model + endpoints (add to job routes)
- [ ] **3.11** Create `Notification` model with 30-day TTL index
- [ ] **3.12** Create `apps/api/src/services/notification.service.ts` - create & send notifications
- [ ] **3.13** Add notification endpoints to user routes
- [ ] **3.14** Register all new routes

### Frontend
- [ ] **3.15** Create apply modal/dialog on job detail page (select resume, cover letter)
- [ ] **3.16** Create `apps/web/src/app/(dashboard)/jobseeker/applications/page.tsx` - My Applications with status timeline
- [ ] **3.17** Create `apps/web/src/components/profile/ResumeBuilder.tsx` - multi-step form
- [ ] **3.18** Create `apps/web/src/app/(dashboard)/jobseeker/resume/page.tsx` - resume management
- [ ] **3.19** Create resume preview with template selection
- [ ] **3.20** Create resume upload feature (drag & drop PDF/DOCX)
- [ ] **3.21** Create `apps/web/src/app/(dashboard)/jobseeker/saved-jobs/page.tsx`
- [ ] **3.22** Create `apps/web/src/app/(dashboard)/employer/applications/page.tsx` - view candidates
- [ ] **3.23** Create `apps/web/src/components/employer/ApplicationTable.tsx` - filter, sort, bulk actions
- [ ] **3.24** Create `apps/web/src/components/employer/CandidateCard.tsx` - view resume, notes, rating
- [ ] **3.25** Create notification bell component in Header with dropdown
- [ ] **3.26** Test: apply to job -> employer sees application -> updates status -> jobseeker sees change

---

## Phase 4: Job Aggregation Engine

### Backend
- [ ] **4.1** Set up Redis config (`apps/api/src/config/redis.ts`)
- [ ] **4.2** Set up BullMQ queues (`apps/api/src/jobs/queues.ts`) with cron schedules
- [ ] **4.3** Create `apps/api/src/scrapers/base.scraper.ts` - abstract base class with scrape(), normalize()
- [ ] **4.4** Create `apps/api/src/scrapers/normalizer.ts` - maps diverse formats to Job schema
- [ ] **4.5** Create `apps/api/src/scrapers/deduplicator.ts` - fuzzy title+company+location matching
- [ ] **4.6** Implement `careerjet.scraper.ts` (REST API - cleanest integration)
- [ ] **4.7** Implement `bdjobs.scraper.ts` (Cheerio HTML scraping)
- [ ] **4.8** Implement `unjobs.scraper.ts` (Cheerio HTML scraping)
- [ ] **4.9** Implement `impactpool.scraper.ts` (Cheerio HTML scraping)
- [ ] **4.10** Implement `shomvob.scraper.ts` (Puppeteer for JS-rendered)
- [ ] **4.11** Implement `nextjobz.scraper.ts` (Puppeteer for JS-rendered)
- [ ] **4.12** Implement `skilljobs.scraper.ts` (Cheerio or Puppeteer)
- [ ] **4.13** Create `apps/api/src/jobs/scraper.job.ts` - BullMQ processor
- [ ] **4.14** Create `ScraperLog` model with 90-day TTL
- [ ] **4.15** Create `apps/api/src/controllers/scraper.controller.ts` - manual trigger, status, logs
- [ ] **4.16** Create `apps/api/src/routes/scraper.routes.ts`
- [ ] **4.17** Create `apps/api/src/jobs/cleanup.job.ts` - expired job cleanup cron
- [ ] **4.18** Test each scraper individually
- [ ] **4.19** Test deduplication across sources

### Frontend
- [ ] **4.20** Add source badge/icon to JobCard component
- [ ] **4.21** Add "Apply on [Source]" redirect button for external jobs on detail page
- [ ] **4.22** Add "Source" filter to job search sidebar
- [ ] **4.23** Create `apps/web/src/app/(dashboard)/admin/scrapers/page.tsx` - scraper dashboard
- [ ] **4.24** Build scraper status cards (last run, success/fail, job counts, manual trigger)
- [ ] **4.25** Build scraper log viewer
- [ ] **4.26** Test: trigger scraper -> jobs appear in search -> source badge visible -> external apply redirects

---

## Phase 5: Skill Assessment + Matching

### Backend
- [ ] **5.1** Create `Assessment` model
- [ ] **5.2** Create `AssessmentAttempt` model
- [ ] **5.3** Create `apps/api/src/validators/assessment.validator.ts`
- [ ] **5.4** Create `apps/api/src/services/assessment.service.ts` - list, start (strip answers), submit, grade
- [ ] **5.5** Create `apps/api/src/controllers/assessment.controller.ts`
- [ ] **5.6** Create `apps/api/src/routes/assessment.routes.ts`
- [ ] **5.7** Create `apps/api/src/services/matching.service.ts` - weighted scoring algorithm
- [ ] **5.8** Create `apps/api/src/jobs/matching.job.ts` - BullMQ processor for matching on new job/assessment pass
- [ ] **5.9** Create assessment seeding script with sample quizzes (JavaScript, Python, Excel, English)
- [ ] **5.10** Add `/recommended` endpoint to job routes using matching service
- [ ] **5.11** Test: take assessment -> pass -> skill verified -> recommendations update

### Frontend
- [ ] **5.12** Create `apps/web/src/components/assessment/AssessmentCard.tsx`
- [ ] **5.13** Create `apps/web/src/app/(dashboard)/jobseeker/assessments/page.tsx` - list assessments
- [ ] **5.14** Create assessment detail page (description, duration, passing score, start button)
- [ ] **5.15** Create `apps/web/src/components/assessment/QuizPlayer.tsx` - timer, questions, navigation, submit
- [ ] **5.16** Create results page - score, pass/fail, correct answers with explanations
- [ ] **5.17** Create `apps/web/src/components/assessment/SkillBadge.tsx` - verified vs self-declared
- [ ] **5.18** Add skill badges to jobseeker profile page
- [ ] **5.19** Create recommended jobs section/page with match percentage
- [ ] **5.20** Add match % indicator to JobCard when user is logged in
- [ ] **5.21** Test full flow: take quiz -> see results -> badges on profile -> recommended jobs

---

## Phase 6: Admin Dashboard + Polish

### Backend
- [ ] **6.1** Create `apps/api/src/services/admin.service.ts` - dashboard stats, user/job/company management
- [ ] **6.2** Create `apps/api/src/controllers/admin.controller.ts`
- [ ] **6.3** Create `apps/api/src/routes/admin.routes.ts` - all admin endpoints
- [ ] **6.4** Add job moderation (approval queue, bulk approve/reject)
- [ ] **6.5** Add company verification endpoint
- [ ] **6.6** Add platform settings endpoints
- [ ] **6.7** Create `apps/api/src/jobs/email.job.ts` - BullMQ email queue processor

### Frontend
- [ ] **6.8** Create `apps/web/src/app/(dashboard)/admin/dashboard/page.tsx` - stats + charts (Recharts)
- [ ] **6.9** Create `apps/web/src/app/(dashboard)/admin/users/page.tsx` - user management table
- [ ] **6.10** Create `apps/web/src/app/(dashboard)/admin/jobs/page.tsx` - job moderation queue
- [ ] **6.11** Create `apps/web/src/app/(dashboard)/admin/assessments/page.tsx` - CRUD assessment form
- [ ] **6.12** Create `apps/web/src/app/(dashboard)/admin/settings/page.tsx`
- [ ] **6.13** Build data tables with sort, filter, pagination (reusable DataTable component)
- [ ] **6.14** Test: admin login -> view stats -> manage users -> moderate jobs -> control scrapers

---

## Phase 7: Production Readiness

### i18n
- [ ] **7.1** Install and configure `next-intl` in Next.js app
- [ ] **7.2** Wrap all user-facing strings with translation function
- [ ] **7.3** Create English translation files (`messages/en.json`)
- [ ] **7.4** Set up `[locale]` dynamic segment in App Router

### SEO
- [ ] **7.5** Add dynamic `metadata` exports to all pages
- [ ] **7.6** Create `sitemap.xml` generation
- [ ] **7.7** Create `robots.txt`
- [ ] **7.8** Add OpenGraph images

### Performance & Security
- [ ] **7.9** Add rate limiting on all API endpoints (express-rate-limit + Redis store)
- [ ] **7.10** Add request logging with Pino
- [ ] **7.11** Add health check endpoint (`/api/v1/health`)
- [ ] **7.12** Review and optimize MongoDB indexes
- [ ] **7.13** Configure TanStack Query cache strategy (stale times, invalidation)
- [ ] **7.14** Set up image optimization (Next.js `<Image>`, Cloudinary transforms)
- [ ] **7.15** Add error tracking (Sentry)

### Testing
- [ ] **7.16** Write unit tests for auth service
- [ ] **7.17** Write unit tests for job service (search, filters)
- [ ] **7.18** Write integration tests for auth endpoints (supertest)
- [ ] **7.19** Write integration tests for job endpoints
- [ ] **7.20** Write integration tests for application flow
- [ ] **7.21** Write frontend component tests (Testing Library)

### Deployment
- [ ] **7.22** Create Dockerfile for Express API
- [ ] **7.23** Configure Vercel deployment for Next.js
- [ ] **7.24** Configure Railway/Render for Express + Redis
- [ ] **7.25** Set up MongoDB Atlas production cluster
- [ ] **7.26** Configure environment variables in all platforms
- [ ] **7.27** Set up CI/CD with GitHub Actions (lint, test, build on PR)
- [ ] **7.28** Load testing on search and scraper endpoints

---

## Quick Reference

**Total tasks: ~150**
- Phase 0 (Scaffolding): 23 tasks
- Phase 1 (Auth): 38 tasks
- Phase 2 (Jobs): 40 tasks
- Phase 3 (Applications): 26 tasks
- Phase 4 (Scrapers): 26 tasks
- Phase 5 (Assessments): 21 tasks
- Phase 6 (Admin): 14 tasks
- Phase 7 (Production): 28 tasks
