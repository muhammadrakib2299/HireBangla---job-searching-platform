import { JobSource } from '@job-platform/shared-types';
import { BaseScraper } from './base.scraper.js';
import { BDJobsScraper } from './bdjobs.scraper.js';
import { CareerJetScraper } from './careerjet.scraper.js';
import { UNJobsScraper } from './unjobs.scraper.js';
import { ImpactpoolScraper } from './impactpool.scraper.js';
import { ShomvobScraper } from './shomvob.scraper.js';
import { NextJobzScraper } from './nextjobz.scraper.js';
import { SkillJobsScraper } from './skilljobs.scraper.js';

const scraperMap: Record<string, () => BaseScraper> = {
  [JobSource.BDJOBS]: () => new BDJobsScraper(),
  [JobSource.CAREERJET]: () => new CareerJetScraper(),
  [JobSource.UNJOBS]: () => new UNJobsScraper(),
  [JobSource.IMPACTPOOL]: () => new ImpactpoolScraper(),
  [JobSource.SHOMVOB]: () => new ShomvobScraper(),
  [JobSource.NEXTJOBZ]: () => new NextJobzScraper(),
  [JobSource.SKILLJOBS]: () => new SkillJobsScraper(),
};

export function getScraper(source: string): BaseScraper | null {
  const factory = scraperMap[source];
  return factory ? factory() : null;
}

export function getAvailableSources(): string[] {
  return Object.keys(scraperMap);
}
