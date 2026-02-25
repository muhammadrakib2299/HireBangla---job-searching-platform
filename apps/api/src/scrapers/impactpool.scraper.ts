import axios from 'axios';
import * as cheerio from 'cheerio';
import { JobSource } from '@job-platform/shared-types';
import { BaseScraper, type RawJob, type ScrapeResult } from './base.scraper.js';

/**
 * Impactpool Scraper - International development and humanitarian jobs.
 * Uses Cheerio for HTML parsing.
 */
export class ImpactpoolScraper extends BaseScraper {
  source = JobSource.IMPACTPOOL;
  name = 'Impactpool';
  baseUrl = 'https://www.impactpool.org';

  private userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  async scrape(): Promise<ScrapeResult> {
    const jobs: RawJob[] = [];
    const errors: string[] = [];

    const maxPages = 3;
    for (let page = 1; page <= maxPages; page++) {
      try {
        const pageJobs = await this.scrapePage(page);
        if (pageJobs.length === 0) break;
        jobs.push(...pageJobs);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        errors.push(`Impactpool page ${page} failed: ${msg}`);
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

    $('article.job-card, .job-listing-item, .vacancy-item').each((_i, el) => {
      try {
        const $el = $(el);

        const titleEl = $el.find('h2 a, h3 a, .job-title a').first();
        const title = this.cleanText(titleEl.text());
        const href = titleEl.attr('href') || '';
        const url = href.startsWith('http') ? href : `${this.baseUrl}${href}`;

        const company = this.cleanText(
          $el.find('.organization, .company-name, .employer').first().text(),
        );

        const location = this.cleanText(
          $el.find('.location, .job-location').first().text(),
        );

        const deadline = this.cleanText(
          $el.find('.deadline, .closing-date, .expiry').first().text(),
        );

        if (title && title.length > 3) {
          jobs.push({
            title,
            company: company || 'International Organization',
            description: '',
            url,
            sourceJobId: this.extractJobId(href),
            location: location || 'Bangladesh',
            deadline: this.parseDate(deadline),
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
    return match ? `impactpool-${match[1]}` : url;
  }
}
