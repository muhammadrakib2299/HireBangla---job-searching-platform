import axios from 'axios';
import * as cheerio from 'cheerio';
import { JobSource } from '@job-platform/shared-types';
import { BaseScraper, type RawJob, type ScrapeResult } from './base.scraper.js';

/**
 * UNJobs Scraper - United Nations and international organization jobs in Bangladesh.
 * Uses Cheerio for HTML parsing.
 */
export class UNJobsScraper extends BaseScraper {
  source = JobSource.UNJOBS;
  name = 'UNJobs';
  baseUrl = 'https://unjobs.org';

  private userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  async scrape(): Promise<ScrapeResult> {
    const jobs: RawJob[] = [];
    const errors: string[] = [];

    // Scrape multiple pages
    const maxPages = 5;
    for (let page = 1; page <= maxPages; page++) {
      try {
        const pageJobs = await this.scrapePage(page);
        if (pageJobs.length === 0) break;
        jobs.push(...pageJobs);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        errors.push(`UNJobs page ${page} failed: ${msg}`);
      }
    }

    return { jobs, errors };
  }

  private async scrapePage(page: number): Promise<RawJob[]> {
    const jobs: RawJob[] = [];

    const response = await axios.get(
      `${this.baseUrl}/duty_stations/bangladesh`,
      {
        params: { page },
        headers: { 'User-Agent': this.userAgent },
        timeout: 30000,
      },
    );

    const $ = cheerio.load(response.data);

    $('div.job-item, tr.vacancy-row, .job-listing').each((_i, el) => {
      try {
        const $el = $(el);

        const titleEl = $el.find('a.job-title, h3 a, .title a').first();
        const title = this.cleanText(titleEl.text());
        const href = titleEl.attr('href') || '';
        const url = href.startsWith('http') ? href : `${this.baseUrl}${href}`;

        const company = this.cleanText(
          $el.find('.organization, .agency, .org-name').first().text(),
        );

        const location = this.cleanText(
          $el.find('.location, .duty-station').first().text(),
        );

        const deadline = this.cleanText(
          $el.find('.deadline, .closing-date, .date').first().text(),
        );

        const level = this.cleanText(
          $el.find('.level, .grade').first().text(),
        );

        if (title && title.length > 3) {
          jobs.push({
            title,
            company: company || 'United Nations',
            description: '',
            url,
            sourceJobId: this.extractJobId(href),
            location: location || 'Dhaka, Bangladesh',
            deadline: this.parseDate(deadline),
            experienceLevel: level,
            category: 'NGO/Development',
          });
        }
      } catch {
        // Skip malformed entries
      }
    });

    return jobs;
  }

  private extractJobId(url: string): string {
    const match = url.match(/\/(\d+)/);
    return match ? `unjobs-${match[1]}` : url;
  }
}
