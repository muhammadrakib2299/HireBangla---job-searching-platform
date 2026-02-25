import axios from 'axios';
import * as cheerio from 'cheerio';
import { JobSource } from '@job-platform/shared-types';
import { BaseScraper, type RawJob, type ScrapeResult } from './base.scraper.js';

/**
 * SkillJobs Scraper - Bangladeshi skill-based job portal.
 * Uses Cheerio for HTML parsing.
 */
export class SkillJobsScraper extends BaseScraper {
  source = JobSource.SKILLJOBS;
  name = 'SkillJobs';
  baseUrl = 'https://www.skill.jobs';

  private userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  async scrape(): Promise<ScrapeResult> {
    const jobs: RawJob[] = [];
    const errors: string[] = [];

    // Scrape by categories
    const categories = [
      'it-software',
      'marketing',
      'engineering',
      'accounting',
      'teaching',
      'sales',
    ];

    for (const cat of categories) {
      try {
        const catJobs = await this.scrapeCategory(cat);
        jobs.push(...catJobs);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        errors.push(`SkillJobs category "${cat}" failed: ${msg}`);
      }
    }

    return { jobs: this.deduplicateRaw(jobs), errors };
  }

  private async scrapeCategory(category: string): Promise<RawJob[]> {
    const jobs: RawJob[] = [];

    const response = await axios.get(`${this.baseUrl}/jobs/${category}`, {
      headers: { 'User-Agent': this.userAgent },
      timeout: 30000,
    });

    const $ = cheerio.load(response.data);

    $('div.job-card, .job-listing, .job-item, article.job').each((_i, el) => {
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

        const skillsText = this.cleanText(
          $el.find('.skills, .tags').first().text(),
        );
        const skills = skillsText
          ? skillsText.split(/[,|]/).map((s) => s.trim()).filter(Boolean)
          : [];

        if (title && title.length > 3) {
          jobs.push({
            title,
            company: company || 'Unknown Company',
            description: '',
            url,
            sourceJobId: this.extractJobId(href),
            location: location || 'Bangladesh',
            salary,
            skills,
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
    const match = url.match(/\/(\d+)/) || url.match(/\/([\w-]+)$/);
    return match ? `skilljobs-${match[1]}` : url;
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
