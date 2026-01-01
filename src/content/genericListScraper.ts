import { BusinessRecord } from '../types/business';
import {
    sleep,
    getTextContent,
    getAttribute,
    parseRating,
    extractPhoneFromTel,
} from '../utils/domHelpers';

/**
 * Generic list scraper for directory sites
 * Uses common patterns to extract business data from various listing pages
 */
export class GenericListScraper {
    private isRunning: boolean = false;
    private scrapedCount: number = 0;
    private maxResults: number = 200;
    private onProgress?: (count: number) => void;

    /**
     * Common selectors that work across many directory sites
     */
    private readonly COMMON_SELECTORS = {
        // Container patterns
        listContainers: [
            '[class*="listing"]',
            '[class*="result"]',
            '[class*="business"]',
            '[class*="card"]',
            'article',
            '[itemtype*="LocalBusiness"]',
        ],

        // Name patterns
        nameSelectors: [
            '[itemprop="name"]',
            '.business-name',
            '.listing-name',
            '.title',
            'h2',
            'h3',
            'h4',
        ],

        // Address patterns
        addressSelectors: [
            '[itemprop="address"]',
            '.address',
            '.location',
            '[class*="address"]',
        ],

        // Phone patterns
        phoneSelectors: [
            '[itemprop="telephone"]',
            'a[href^="tel:"]',
            '.phone',
            '[class*="phone"]',
        ],

        // Website patterns
        websiteSelectors: [
            '[itemprop="url"]',
            'a[href^="http"]',
            '.website',
            '[class*="website"]',
        ],

        // Rating patterns
        ratingSelectors: [
            '[itemprop="ratingValue"]',
            '.rating',
            '[class*="rating"]',
            '[class*="star"]',
        ],

        // Category patterns
        categorySelectors: [
            '[itemprop="category"]',
            '.category',
            '[class*="category"]',
            '[class*="type"]',
        ],
    };

    constructor(
        maxResults: number,
        onProgress?: (count: number) => void
    ) {
        this.maxResults = maxResults;
        this.onProgress = onProgress;
    }

    /**
     * Start the scraping process
     */
    async start(): Promise<BusinessRecord[]> {
        this.isRunning = true;
        this.scrapedCount = 0;

        try {
            // Find all potential listing containers
            const containers = this.findListingContainers();

            if (containers.length === 0) {
                throw new Error('Could not find any business listings on this page. Try using Google Maps scraper instead.');
            }

            console.log(`Found ${containers.length} potential listings`);

            const records: BusinessRecord[] = [];

            for (const container of containers) {
                if (!this.isRunning || this.scrapedCount >= this.maxResults) {
                    break;
                }

                const record = this.extractBusinessData(container);

                if (record && record.name) {
                    records.push(record);
                    this.scrapedCount++;

                    // Notify progress
                    if (this.onProgress) {
                        this.onProgress(this.scrapedCount);
                    }
                }

                // Small delay to avoid overwhelming the page
                await sleep(50);
            }

            return records;

        } catch (error) {
            console.error('Error during scraping:', error);
            throw error;
        }
    }

    /**
     * Stop the scraping process
     */
    stop(): void {
        this.isRunning = false;
    }

    /**
     * Find all listing containers on the page
     */
    private findListingContainers(): Element[] {
        const containers: Element[] = [];

        for (const selector of this.COMMON_SELECTORS.listContainers) {
            const elements = Array.from(document.querySelectorAll(selector));
            containers.push(...elements);
        }

        // Remove duplicates (an element might match multiple selectors)
        return Array.from(new Set(containers));
    }

    /**
     * Extract business data from a container element
     */
    private extractBusinessData(container: Element): BusinessRecord | null {
        try {
            // Extract name
            const name = this.findFirstMatch(container, this.COMMON_SELECTORS.nameSelectors);

            if (!name) {
                return null; // Skip if no name found
            }

            // Extract other fields
            const address = this.findFirstMatch(container, this.COMMON_SELECTORS.addressSelectors);
            const category = this.findFirstMatch(container, this.COMMON_SELECTORS.categorySelectors);
            const ratingText = this.findFirstMatch(container, this.COMMON_SELECTORS.ratingSelectors);
            const rating = parseRating(ratingText);

            // Extract phone
            let phone: string | null = null;
            const phoneElement = this.findFirstElement(container, this.COMMON_SELECTORS.phoneSelectors);
            if (phoneElement) {
                const telLink = getAttribute(phoneElement, 'href');
                phone = extractPhoneFromTel(telLink) || getTextContent(phoneElement);
            }

            // Extract website
            let website: string | null = null;
            const websiteElement = this.findFirstElement(container, this.COMMON_SELECTORS.websiteSelectors);
            if (websiteElement) {
                website = getAttribute(websiteElement, 'href');
                // Filter out non-website links (tel:, mailto:, etc.)
                if (website && !website.startsWith('http')) {
                    website = null;
                }
            }

            // Create business record
            const record: BusinessRecord = {
                name,
                category,
                rating,
                reviewCount: null,
                priceLevel: null,
                address,
                locality: null,
                latitude: null,
                longitude: null,
                plusCode: null,
                phone,
                website,
                googleMapsUrl: null,
                placeId: null,
                source: 'generic-directory',
                scrapedAt: new Date().toISOString(),
            };

            return record;

        } catch (error) {
            console.error('Error extracting business data from container:', error);
            return null;
        }
    }

    /**
     * Find the first matching element using multiple selectors
     */
    private findFirstElement(container: Element, selectors: string[]): Element | null {
        for (const selector of selectors) {
            const element = container.querySelector(selector);
            if (element) {
                return element;
            }
        }
        return null;
    }

    /**
     * Find the first matching text content using multiple selectors
     */
    private findFirstMatch(container: Element, selectors: string[]): string | null {
        const element = this.findFirstElement(container, selectors);
        return getTextContent(element);
    }
}
