import { JobSource } from '@job-platform/shared-types';
import { logger } from '../utils/logger.js';

export interface RawJob {
  title: string;
  company: string;
  description: string;
  url: string;
  sourceJobId?: string;
  location?: string;
  salary?: string;
  jobType?: string;
  category?: string;
  deadline?: string;
  postedDate?: string;
  skills?: string[];
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  experienceLevel?: string;
  education?: string;
  companyLogo?: string;
}

export interface ScrapeResult {
  jobs: RawJob[];
  errors: string[];
}

export abstract class BaseScraper {
  abstract source: JobSource;
  abstract name: string;
  abstract baseUrl: string;

  /**
   * Scrape jobs from the source. Returns raw job data.
   */
  abstract scrape(): Promise<ScrapeResult>;

  /**
   * Run the scraper with error handling and logging.
   */
  async run(): Promise<ScrapeResult> {
    logger.info(`[${this.name}] Starting scrape from ${this.baseUrl}`);
    const start = Date.now();

    try {
      const result = await this.scrape();
      const elapsed = Date.now() - start;
      logger.info(
        `[${this.name}] Completed in ${elapsed}ms - ${result.jobs.length} jobs fetched, ${result.errors.length} errors`,
      );
      return result;
    } catch (error) {
      const elapsed = Date.now() - start;
      const message = error instanceof Error ? error.message : String(error);
      logger.error(
        { err: error },
        `[${this.name}] Failed after ${elapsed}ms: ${message}`,
      );
      return { jobs: [], errors: [message] };
    }
  }

  /**
   * Clean and trim text content.
   */
  protected cleanText(text: string | undefined | null): string {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Extract salary range from a salary string like "BDT 50,000 - 80,000"
   */
  protected parseSalaryRange(
    salaryStr: string,
  ): { min?: number; max?: number; currency: string } | null {
    if (!salaryStr) return null;
    const cleaned = salaryStr.replace(/,/g, '');

    // Match patterns like "50000 - 80000", "BDT 50000-80000"
    const rangeMatch = cleaned.match(
      /(\d+)\s*[-–to]+\s*(\d+)/i,
    );
    if (rangeMatch) {
      return {
        min: parseInt(rangeMatch[1]),
        max: parseInt(rangeMatch[2]),
        currency: cleaned.match(/[A-Z]{3}/)?.[0] || 'BDT',
      };
    }

    // Single number
    const singleMatch = cleaned.match(/(\d+)/);
    if (singleMatch) {
      const val = parseInt(singleMatch[1]);
      // Ignore very small numbers (probably not salary)
      if (val > 1000) {
        return {
          min: val,
          currency: cleaned.match(/[A-Z]{3}/)?.[0] || 'BDT',
        };
      }
    }

    return null;
  }

  /**
   * Parse a date string to ISO format. Returns undefined if unparseable.
   */
  protected parseDate(dateStr: string | undefined): string | undefined {
    if (!dateStr) return undefined;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return undefined;
      return d.toISOString();
    } catch {
      return undefined;
    }
  }
}
