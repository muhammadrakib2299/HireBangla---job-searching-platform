import axios from 'axios';
import * as cheerio from 'cheerio';
import { JobSource } from '@job-platform/shared-types';
import { BaseScraper, type RawJob, type ScrapeResult } from './base.scraper.js';

/**
 * Shomvob Scraper - Bangladeshi job portal focusing on entry-level and mid-level jobs.
 * Uses Cheerio for HTML parsing. May need Puppeteer if JS-rendered content is detected.
 */
export class ShomvobScraper extends BaseScraper {
  source = JobSource.SHOMVOB;
  name = 'Shomvob';
  baseUrl = 'https://shomvob.com';

  private userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  async scrape(): Promise<ScrapeResult> {
    const jobs: RawJob[] = [];
    const errors: string[] = [];

    // Try API endpoint first (Shomvob may expose a JSON API)
    try {
      const apiJobs = await this.scrapeViaApi();
      if (apiJobs.length > 0) {
        return { jobs: apiJobs, errors };
      }
    } catch {
      // Fall back to HTML scraping
    }

    // HTML scraping fallback
    const maxPages = 5;
    for (let page = 1; page <= maxPages; page++) {
      try {
        const pageJobs = await this.scrapePage(page);
        if (pageJobs.length === 0) break;
        jobs.push(...pageJobs);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        errors.push(`Shomvob page ${page} failed: ${msg}`);
      }
    }

    return { jobs, errors };
  }

  private async scrapeViaApi(): Promise<RawJob[]> {
    const jobs: RawJob[] = [];

    // Many modern job portals expose a JSON API for their frontend
    const response = await axios.get(`${this.baseUrl}/api/jobs`, {
      params: { page: 1, limit: 100 },
      headers: {
        'User-Agent': this.userAgent,
        Accept: 'application/json',
      },
      timeout: 30000,
    });

    if (response.data?.data && Array.isArray(response.data.data)) {
      for (const item of response.data.data) {
        jobs.push({
          title: this.cleanText(item.title),
          company: this.cleanText(item.company?.name || item.companyName),
          description: item.description || '',
          url: `${this.baseUrl}/jobs/${item.slug || item.id}`,
          sourceJobId: `shomvob-${item.id}`,
          location: item.location || 'Dhaka, Bangladesh',
          salary: item.salary,
          jobType: item.jobType,
          deadline: item.deadline,
          postedDate: item.createdAt,
          skills: item.skills,
        });
      }
    }

    return jobs;
  }

  private async scrapePage(page: number): Promise<RawJob[]> {
    const jobs: RawJob[] = [];

    const response = await axios.get(`${this.baseUrl}/jobs`, {
      params: { page },
      headers: { 'User-Agent': this.userAgent },
      timeout: 30000,
    });

    const $ = cheerio.load(response.data);

    $('div.job-card, .job-listing, article.job').each((_i, el) => {
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
          $el.find('.location, .job-location').first().text(),
        );

        const salary = this.cleanText(
          $el.find('.salary, .job-salary').first().text(),
        );

        if (title && title.length > 3) {
          jobs.push({
            title,
            company: company || 'Unknown Company',
            description: '',
            url,
            sourceJobId: this.extractJobId(href),
            location: location || 'Dhaka, Bangladesh',
            salary,
          });
        }
      } catch {
        // Skip malformed entries
      }
    });

    return jobs;
  }

  private extractJobId(url: string): string {
    const match = url.match(/\/jobs?\/([\w-]+)/);
    return match ? `shomvob-${match[1]}` : url;
  }
}
