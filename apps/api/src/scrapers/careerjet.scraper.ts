import axios from 'axios';
import { JobSource } from '@job-platform/shared-types';
import { BaseScraper, type RawJob, type ScrapeResult } from './base.scraper.js';

/**
 * CareerJet Scraper - Uses their public search API.
 * CareerJet aggregates jobs and provides a REST-like search interface.
 */
export class CareerJetScraper extends BaseScraper {
  source = JobSource.CAREERJET;
  name = 'CareerJet';
  baseUrl = 'https://www.careerjet.com.bd';

  private searchUrl = 'https://public.api.careerjet.net/search';

  async scrape(): Promise<ScrapeResult> {
    const jobs: RawJob[] = [];
    const errors: string[] = [];

    // Search for Bangladesh jobs across multiple keywords
    const keywords = ['', 'software', 'marketing', 'engineer', 'finance', 'admin'];
    const pageSize = 50;

    for (const keyword of keywords) {
      try {
        const response = await axios.get(this.searchUrl, {
          params: {
            locale_code: 'en_BD',
            location: 'Bangladesh',
            keywords: keyword,
            pagesize: pageSize,
            page: 1,
            affid: 'hirebangla', // affiliate ID
          },
          timeout: 30000,
        });

        const data = response.data;
        if (data?.jobs && Array.isArray(data.jobs)) {
          for (const item of data.jobs) {
            jobs.push({
              title: this.cleanText(item.title),
              company: this.cleanText(item.company) || 'Unknown Company',
              description: this.cleanText(item.description),
              url: item.url || '',
              sourceJobId: item.url ? this.extractJobId(item.url) : undefined,
              location: this.cleanText(item.locations),
              salary: item.salary || '',
              postedDate: item.date,
            });
          }
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        errors.push(`CareerJet search "${keyword}" failed: ${msg}`);
      }
    }

    return { jobs: this.deduplicateRaw(jobs), errors };
  }

  private extractJobId(url: string): string {
    // Extract unique portion from CareerJet URL
    const match = url.match(/\/([a-f0-9]+)\.html/);
    return match ? match[1] : url;
  }

  private deduplicateRaw(jobs: RawJob[]): RawJob[] {
    const seen = new Set<string>();
    return jobs.filter((job) => {
      const key = `${job.title}-${job.company}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
