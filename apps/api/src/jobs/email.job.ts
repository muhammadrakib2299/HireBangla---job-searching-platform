import { Worker, Job } from 'bullmq';
import { bullMQConnection } from '../config/redis.js';
import { logger } from '../utils/logger.js';
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

// ─── Email Job Types ─────────────────────────────────────────────────────────

interface ApplicationStatusEmailData {
  type: 'application_status';
  to: string;
  applicantName: string;
  jobTitle: string;
  companyName: string;
  status: string;
}

interface WelcomeEmailData {
  type: 'welcome';
  to: string;
  name: string;
}

interface JobAlertEmailData {
  type: 'job_alert';
  to: string;
  name: string;
  jobs: Array<{ title: string; company: string; slug: string }>;
}

interface GenericEmailData {
  type: 'generic';
  to: string;
  subject: string;
  html: string;
}

type EmailJobData =
  | ApplicationStatusEmailData
  | WelcomeEmailData
  | JobAlertEmailData
  | GenericEmailData;

// ─── Transporter ─────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth:
    env.SMTP_USER && env.SMTP_PASS
      ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
      : undefined,
});

// ─── Email Templates ─────────────────────────────────────────────────────────

function wrapTemplate(content: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
      <div style="background: #2563eb; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">HireBangla</h1>
      </div>
      <div style="padding: 30px 20px;">
        ${content}
      </div>
      <div style="border-top: 1px solid #e5e7eb; padding: 15px 20px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          HireBangla - Bangladesh's Premier Job Platform
        </p>
      </div>
    </div>
  `;
}

function buildApplicationStatusEmail(data: ApplicationStatusEmailData): { subject: string; html: string } {
  const statusMessages: Record<string, string> = {
    viewed: 'Your application has been viewed by the employer.',
    shortlisted: 'Great news! You\'ve been shortlisted.',
    interview: 'You\'ve been invited for an interview!',
    offered: 'Congratulations! You\'ve received a job offer!',
    hired: 'Congratulations! You\'ve been hired!',
    rejected: 'Unfortunately, your application was not selected at this time.',
  };

  const message = statusMessages[data.status] || `Your application status has been updated to: ${data.status}`;

  return {
    subject: `Application Update: ${data.jobTitle} at ${data.companyName}`,
    html: wrapTemplate(`
      <h2 style="color: #111827;">Application Update</h2>
      <p>Hi ${data.applicantName},</p>
      <p>${message}</p>
      <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Position:</strong> ${data.jobTitle}</p>
        <p style="margin: 8px 0 0;"><strong>Company:</strong> ${data.companyName}</p>
        <p style="margin: 8px 0 0;"><strong>Status:</strong> ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}</p>
      </div>
      <p>
        <a href="${env.CLIENT_URL}/dashboard/jobseeker/applications"
           style="background: #2563eb; color: white; padding: 10px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Application
        </a>
      </p>
    `),
  };
}

function buildWelcomeEmail(data: WelcomeEmailData): { subject: string; html: string } {
  return {
    subject: 'Welcome to HireBangla!',
    html: wrapTemplate(`
      <h2 style="color: #111827;">Welcome, ${data.name}!</h2>
      <p>Thank you for joining HireBangla. Here's how to get started:</p>
      <ol style="color: #374151; line-height: 1.8;">
        <li>Complete your profile</li>
        <li>Take skill assessments to verify your expertise</li>
        <li>Browse jobs and start applying</li>
      </ol>
      <p>
        <a href="${env.CLIENT_URL}/jobs"
           style="background: #2563eb; color: white; padding: 10px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Browse Jobs
        </a>
      </p>
    `),
  };
}

function buildJobAlertEmail(data: JobAlertEmailData): { subject: string; html: string } {
  const jobListHtml = data.jobs
    .map(
      (job) => `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 8px;">
        <a href="${env.CLIENT_URL}/jobs/${job.slug}" style="color: #2563eb; font-weight: bold; text-decoration: none;">
          ${job.title}
        </a>
        <p style="color: #6b7280; margin: 4px 0 0; font-size: 14px;">${job.company}</p>
      </div>
    `,
    )
    .join('');

  return {
    subject: `${data.jobs.length} new job(s) matching your profile`,
    html: wrapTemplate(`
      <h2 style="color: #111827;">New Job Matches</h2>
      <p>Hi ${data.name}, we found ${data.jobs.length} new job(s) that match your profile:</p>
      ${jobListHtml}
      <p style="margin-top: 20px;">
        <a href="${env.CLIENT_URL}/dashboard/jobseeker/assessments"
           style="background: #2563eb; color: white; padding: 10px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View All Recommendations
        </a>
      </p>
    `),
  };
}

// ─── Processor ───────────────────────────────────────────────────────────────

async function processEmailJob(job: Job<EmailJobData>) {
  const data = job.data;
  let subject: string;
  let html: string;

  switch (data.type) {
    case 'application_status': {
      const email = buildApplicationStatusEmail(data);
      subject = email.subject;
      html = email.html;
      break;
    }
    case 'welcome': {
      const email = buildWelcomeEmail(data);
      subject = email.subject;
      html = email.html;
      break;
    }
    case 'job_alert': {
      const email = buildJobAlertEmail(data);
      subject = email.subject;
      html = email.html;
      break;
    }
    case 'generic': {
      subject = data.subject;
      html = data.html;
      break;
    }
    default:
      throw new Error(`Unknown email type: ${(data as any).type}`);
  }

  await transporter.sendMail({
    from: `"HireBangla" <${env.EMAIL_FROM}>`,
    to: data.to,
    subject,
    html,
  });

  logger.info(`Email sent: ${data.type} -> ${data.to}`);
}

// ─── Worker ──────────────────────────────────────────────────────────────────

let emailWorker: Worker | null = null;

export function startEmailWorker() {
  emailWorker = new Worker('email', processEmailJob, {
    connection: bullMQConnection,
    concurrency: 5,
    limiter: {
      max: 30,
      duration: 60000, // max 30 emails per minute
    },
  });

  emailWorker.on('completed', (job) => {
    logger.debug(`Email job ${job.id} completed`);
  });

  emailWorker.on('failed', (job, err) => {
    logger.error({ err, jobId: job?.id }, 'Email job failed');
  });

  logger.info('Email worker started');
}

export function stopEmailWorker() {
  if (emailWorker) {
    return emailWorker.close();
  }
}
