import { ApplicationStatus } from './enums';

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  changedAt: Date;
  changedBy?: string;
  note?: string;
}

export interface IApplication {
  _id: string;
  job: string;
  applicant: string;
  resume?: string;

  coverLetter?: string;
  answers?: Array<{ question: string; answer: string }>;

  status: ApplicationStatus;
  employerNotes?: string;
  rating?: number;
  statusHistory: StatusHistoryEntry[];
  matchScore?: number;

  createdAt: Date;
  updatedAt: Date;
}
