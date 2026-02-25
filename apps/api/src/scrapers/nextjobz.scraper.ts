import axios from 'axios';
import * as cheerio from 'cheerio';
import { JobSource } from '@job-platform/shared-types';
import { BaseScraper, type RawJob, type ScrapeResult } from './base.scraper.js';

/**
 * NextJobz Scraper - Bangladeshi job portal.
 * Uses Cheerio for HTML parsing.
 */
export class NextJobzScraper extends BaseScraper {
  source = JobSource.NEXTJOBZ;
  name = 'NextJobz';
  baseUrl = 'https://www.nextjobz.com';

  private userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  async scrape(): Promise<ScrapeResult> {
    const jobs: RawJob[] = [];
    const errors: string[] = [];

    const maxPages = 5;
    for (let page = 1; page <= maxPages; page++) {
      try {
        const pageJobs = await this.scrapePage(page);
        if (pageJobs.length === 0) break;
        jobs.push(...pageJobs);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        errors.push(`NextJobz page ${page} failed: ${msg}`);
      }
    }

    return { jobs, errors };
  }

  private async scrapePage(page: number): Promise<RawJob[]> {
    const jobs: RawJob[] = [];

    const response = await axios.get(`${this.baseUrl}/jobs`, {
      params: {
        country: 'bangladesh',
        page,
      },
      headers: { 'User-Agent': this.userAgent },
      timeout: 30000,
    });

    const $ = cheerio.load(response.data);

    $('div.job-card, .job-item, .listing-item, article').each((_i, el) => {
      try {
        const $el = $(el);

        const titleEl = $el.find('h2 a, h3 a, .job-title a, a.title').first();
        const title = this.cleanText(titleEl.text());
        const href = titleEl.attr('href') || '';
        const url = href.startsWith('http') ? href : `${this.baseUrl}${href}`;

        const company = this.cleanText(
          $el.find('.company, .company-name, .employer').first().text(),
        );

        const location = this.cleanText(
          $el.find('.location, .job-location, .loc').first().text(),
        );

        const salary = this.cleanText(
          $el.find('.salary, .job-salary, .pay').first().text(),
        );

        const deadline = this.cleanText(
          $el.find('.deadline, .expiry, .closing').first().text(),
        );

        if (title && title.length > 3) {
          jobs.push({
            title,
            company: company || 'Unknown Company',
            description: '',
            url,
            sourceJobId: this.extractJobId(href),
            location: location || 'Bangladesh',
            salary,
            deadline: this.parseDate(deadline),
          });
        }
      } catch {
        // Skip malformed entries
      }
    });

    return jobs;
  }

  private extractJobId(url: string): string {
    const match = url.match(/\/(\d+)/) || url.match(/\/([\w-]+)$/);
    return match ? `nextjobz-${match[1]}` : url;
  }
}
