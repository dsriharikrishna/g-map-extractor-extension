/**
 * Core business record interface representing scraped business data
 */
export interface BusinessRecord {
    // Basic Information
    name: string;
    category: string | null;

    // Ratings & Reviews
    rating: number | null;
    reviewCount: number | null;
    priceLevel: string | null; // e.g., "$", "$$", "$$$"

    // Location Information
    address: string | null;
    locality: string | null; // City/locality
    latitude: number | null;
    longitude: number | null;
    plusCode: string | null;

    // Contact Information
    phone: string | null;
    website: string | null;

    // Google Maps Specific
    googleMapsUrl: string | null;
    placeId: string | null;

    // Metadata
    source: ScraperSource;
    scrapedAt: string; // ISO timestamp
}

/**
 * Supported scraper sources
 */
export type ScraperSource = 'google-maps' | 'yelp' | 'generic-directory';

/**
 * Scraper status states
 */
export type ScraperStatus = 'idle' | 'running' | 'stopped' | 'completed' | 'error';

/**
 * Scraper profile/mode selection
 */
export type ScraperProfile = 'google-maps' | 'generic-listing';

/**
 * Options for starting a scraping session
 */
export interface StartScrapingOptions {
    maxResults: number;
    delayBetweenScrolls: number; // milliseconds
    profile: ScraperProfile;
}

/**
 * Progress information during scraping
 */
export interface ScrapeProgress {
    count: number;
    status: ScraperStatus;
    message?: string;
}

/**
 * Metadata about the last scraping session
 */
export interface LastScrapeMetadata {
    startedAt: string | null;
    finishedAt: string | null;
    total: number;
    profile: ScraperProfile | null;
}

/**
 * Storage structure for chrome.storage.local
 */
export interface StorageData {
    records: BusinessRecord[];
    lastScrape: LastScrapeMetadata;
    settings: StartScrapingOptions;
}
