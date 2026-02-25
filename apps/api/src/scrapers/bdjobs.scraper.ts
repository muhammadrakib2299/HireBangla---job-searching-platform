import axios from 'axios';
import * as cheerio from 'cheerio';
import { JobSource } from '@job-platform/shared-types';
import { BaseScraper, type RawJob, type ScrapeResult } from './base.scraper.js';

/**
 * BDJobs Scraper - The largest job portal in Bangladesh.
 * Uses Cheerio for HTML parsing of search result pages.
 */
export class BDJobsScraper extends BaseScraper {
  source = JobSource.BDJOBS;
  name = 'BDJobs';
  baseUrl = 'https://jobs.bdjobs.com';

  private userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  async scrape(): Promise<ScrapeResult> {
    const jobs: RawJob[] = [];
    const errors: string[] = [];

    // Scrape multiple category pages
    const categories = [
      'IT/Telecommunication',
      'Bank/Non-Bank Fin. Institution',
      'Marketing/Sales',
      'Engineer/Architects',
      'NGO/Development',
      'Garments/Textile',
      'Education/Training',
      'Accounting/Finance',
    ];

    for (const category of categories) {
      try {
        const pageJobs = await this.scrapeCategory(category);
        jobs.push(...pageJobs);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        errors.push(`BDJobs category "${category}" failed: ${msg}`);
      }
    }

    return { jobs: this.deduplicateRaw(jobs), errors };
  }

  private async scrapeCategory(category: string): Promise<RawJob[]> {
    const jobs: RawJob[] = [];

    // BDJobs search URL pattern
    const searchUrl = `${this.baseUrl}/jobsearch.asp`;
    const response = await axios.get(searchUrl, {
      params: {
        fcatId: '',
        qOT: category,
        qJobLevel: '',
        qExperience: '',
        txtsearch: '',
      },
      headers: { 'User-Agent': this.userAgent },
      timeout: 30000,
    });

    const $ = cheerio.load(response.data);

    // BDJobs listing selectors
    $('div.job-list-view, tr.job-list, .norm-job').each((_i, el) => {
      try {
        const $el = $(el);

        const titleEl = $el.find('a.title, .job-title a, a[href*="jobdetails"]').first();
        const title = this.cleanText(titleEl.text());
        const url = titleEl.attr('href') || '';
        const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}/${url}`;

        const company = this.cleanText(
          $el.find('.company-name, .comp-name, .company').first().text(),
        );

        const location = this.cleanText(
          $el.find('.location, .job-location, .loc').first().text(),
        );

        const deadline = this.cleanText(
          $el.find('.deadline, .job-deadline, .expire-date').first().text(),
        );

        const experience = this.cleanText(
          $el.find('.experience, .exp').first().text(),
        );

        if (title && title.length > 3) {
          jobs.push({
            title,
            company: company || 'Unknown Company',
            description: '',
            url: fullUrl,
            sourceJobId: this.extractJobId(fullUrl),
            location: location || 'Dhaka, Bangladesh',
            deadline: this.parseDate(deadline),
            experienceLevel: experience,
            category,
          });
        }
      } catch {
        // Skip malformed entries
      }
    });

    return jobs;
  }

  private extractJobId(url: string): string {
    const match = url.match(/jobid=(\d+)/i) || url.match(/\/(\d+)\/?$/);
    return match ? `bdjobs-${match[1]}` : url;
  }

  private deduplicateRaw(jobs: RawJob[]): RawJob[] {
    const seen = new Set<string>();
    return jobs.filter((job) => {
      const id = job.sourceJobId || `${job.title}-${job.company}`;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }
}
