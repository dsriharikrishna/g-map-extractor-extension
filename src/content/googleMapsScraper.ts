import { BusinessRecord } from '../types/business';
import {
    sleep,
    waitForElement,
    scrollElement,
    isScrolledToBottom,
    getTextContent,
    getAttribute,
    parseRating,
    parseReviewCount,
} from '../utils/domHelpers';

/**
 * Google Maps specific scraper
 * Handles scraping of business listings from Google Maps search results
 * Enhanced to extract detailed information by clicking into each listing
 */
export class GoogleMapsScraper {
    private isRunning: boolean = false;
    private scrapedCount: number = 0;
    private maxResults: number = 200;
    private delayBetweenScrolls: number = 1500;
    private onProgress?: (count: number) => void;

    /**
     * Selectors for Google Maps elements
     * These may need to be updated if Google changes their DOM structure
     */
    private readonly SELECTORS = {
        // The scrollable container that holds all results
        resultsContainer: 'div[role="feed"]',

        // Individual result cards
        resultCard: 'div[role="feed"] > div > div[jsaction]',

        // Elements within each card
        name: 'div.fontHeadlineSmall',
        rating: 'span[role="img"][aria-label*="star"]',
        link: 'a[href*="/maps/place/"]',

        // Detail panel selectors (after clicking into a business)
        detailPanel: 'div[role="main"]',
        detailName: 'h1.DUwDvf',
        detailCategory: 'button[jsaction*="category"]',
        detailAddress: 'button[data-item-id="address"]',
        detailPhone: 'button[data-item-id^="phone:tel:"]',
        detailWebsite: 'a[data-item-id="authority"]',
        detailPlusCode: 'button[data-item-id="oloc"]',
        detailReviewCount: 'button[jsaction*="pane.reviewChart"] span',
        detailPriceLevel: 'span[aria-label*="Price"]',
        backButton: 'button[aria-label*="Back"]',
    };

    constructor(
        maxResults: number,
        delayBetweenScrolls: number,
        onProgress?: (count: number) => void
    ) {
        this.maxResults = maxResults;
        this.delayBetweenScrolls = delayBetweenScrolls;
        this.onProgress = onProgress;
    }

    /**
     * Start the scraping process
     */
    async start(): Promise<BusinessRecord[]> {
        this.isRunning = true;
        this.scrapedCount = 0;

        try {
            // Wait for the results container to load
            const container = await waitForElement(this.SELECTORS.resultsContainer, 10000);

            if (!container) {
                throw new Error('Could not find Google Maps results container. Make sure you are on a search results page.');
            }

            // First, scroll to collect all listing links
            const listingLinks = await this.collectListingLinks(container);

            if (!this.isRunning) {
                return [];
            }

            // Then, extract detailed info from each listing
            const records = await this.extractDetailedInfo(listingLinks);

            return records;

        } catch (error) {
            console.error('Error during scraping:', error);
            throw error;
        }
    }

    /**
     * Collect all listing links by scrolling through results
     */
    private async collectListingLinks(container: Element): Promise<string[]> {
        const links: string[] = [];
        const seenUrls = new Set<string>();
        let noNewResultsCount = 0;
        const maxNoNewResults = 5;

        while (this.isRunning && links.length < this.maxResults) {
            const cards = Array.from(document.querySelectorAll(this.SELECTORS.resultCard));
            let newResultsFound = false;

            for (const card of cards) {
                if (links.length >= this.maxResults) break;

                const linkElement = card.querySelector(this.SELECTORS.link) as HTMLAnchorElement;
                if (linkElement && linkElement.href && !seenUrls.has(linkElement.href)) {
                    seenUrls.add(linkElement.href);
                    links.push(linkElement.href);
                    newResultsFound = true;
                }
            }

            if (!newResultsFound) {
                noNewResultsCount++;
                if (noNewResultsCount >= maxNoNewResults) {
                    break;
                }
            } else {
                noNewResultsCount = 0;
            }

            // Scroll to load more
            if (links.length < this.maxResults && this.isRunning) {
                scrollElement(container, 1000);
                await sleep(this.delayBetweenScrolls);

                if (isScrolledToBottom(container)) {
                    break;
                }
            }
        }

        return links.slice(0, this.maxResults);
    }

    /**
     * Extract detailed information from each listing
     */
    private async extractDetailedInfo(links: string[]): Promise<BusinessRecord[]> {
        const records: BusinessRecord[] = [];

        for (let i = 0; i < links.length && this.isRunning; i++) {
            const link = links[i];

            try {
                // Click on the listing (navigate to it)
                const linkElement = document.querySelector(`a[href="${link}"]`) as HTMLAnchorElement;
                if (linkElement) {
                    linkElement.click();
                    await sleep(2000); // Wait for detail panel to load

                    // Extract detailed data
                    const record = await this.extractDetailedBusinessData(link);

                    if (record) {
                        records.push(record);
                        this.scrapedCount++;

                        // Notify progress
                        if (this.onProgress) {
                            this.onProgress(this.scrapedCount);
                        }
                    }

                    // Go back to list
                    const backButton = document.querySelector(this.SELECTORS.backButton) as HTMLButtonElement;
                    if (backButton) {
                        backButton.click();
                        await sleep(500);
                    }
                }
            } catch (error) {
                console.error(`Error extracting details for ${link}:`, error);
                // Continue with next listing
            }
        }

        return records;
    }

    /**
     * Extract detailed business data from the detail panel
     */
    private async extractDetailedBusinessData(url: string): Promise<BusinessRecord | null> {
        try {
            // Wait for detail panel to load
            await waitForElement(this.SELECTORS.detailName, 5000);

            // Extract name
            const nameElement = document.querySelector(this.SELECTORS.detailName);
            const name = getTextContent(nameElement);

            if (!name) {
                return null;
            }

            // Extract category
            const categoryElement = document.querySelector(this.SELECTORS.detailCategory);
            const category = getTextContent(categoryElement);

            // Extract address - use the specific text div
            const addressElement = document.querySelector('button[data-item-id="address"] .Io6YTe.fontBodyMedium');
            const address = getTextContent(addressElement);

            // Extract phone - use the specific text div
            const phoneElement = document.querySelector('button[data-item-id^="phone:tel:"] .Io6YTe.fontBodyMedium');
            const phone = getTextContent(phoneElement);

            // Extract website
            const websiteElement = document.querySelector(this.SELECTORS.detailWebsite) as HTMLAnchorElement;
            const website = websiteElement?.href || null;

            // Extract Plus Code - use the specific text div
            const plusCodeElement = document.querySelector('button[data-item-id="oloc"] .Io6YTe.fontBodyMedium');
            const plusCode = getTextContent(plusCodeElement);

            // Extract rating - from aria-label
            const ratingElement = document.querySelector('span[role="img"][aria-label*="stars"]');
            const ratingText = getAttribute(ratingElement, 'aria-label');
            const rating = parseRating(ratingText);

            // Extract review count - from aria-label
            const reviewElement = document.querySelector('span[role="img"][aria-label*="reviews"]');
            const reviewText = getAttribute(reviewElement, 'aria-label');
            const reviewCount = parseReviewCount(reviewText);

            // Extract price level
            const priceLevelElement = document.querySelector(this.SELECTORS.detailPriceLevel);
            const priceLevel = getAttribute(priceLevelElement, 'aria-label');

            // Extract coordinates from URL
            let latitude: number | null = null;
            let longitude: number | null = null;
            const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (coordMatch) {
                latitude = parseFloat(coordMatch[1]);
                longitude = parseFloat(coordMatch[2]);
            }

            // Extract place ID
            let placeId: string | null = null;
            const placeIdMatch = url.match(/!1s([^!]+)/);
            placeId = placeIdMatch ? placeIdMatch[1] : null;

            // Extract locality from address (simple extraction)
            let locality: string | null = null;
            if (address) {
                const parts = address.split(',');
                if (parts.length >= 2) {
                    locality = parts[parts.length - 2].trim();
                }
            }

            const record: BusinessRecord = {
                name,
                category,
                rating,
                reviewCount,
                priceLevel,
                address,
                locality,
                latitude,
                longitude,
                plusCode,
                phone,
                website,
                googleMapsUrl: url,
                placeId,
                source: 'google-maps',
                scrapedAt: new Date().toISOString(),
            };

            return record;

        } catch (error) {
            console.error('Error extracting detailed business data:', error);
            return null;
        }
    }

    /**
     * Stop the scraping process
     */
    stop(): void {
        this.isRunning = false;
    }

    /**
     * Check if the current page is a Google Maps search results page
     */
    static isGoogleMapsPage(): boolean {
        return window.location.hostname.includes('google.com') &&
            window.location.pathname.includes('/maps');
    }
}
