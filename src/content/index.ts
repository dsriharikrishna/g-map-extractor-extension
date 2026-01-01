import { Message, isMessageType } from '../types/messages';
import { BusinessRecord, ScraperStatus, StartScrapingOptions } from '../types/business';
import { GoogleMapsScraper } from './googleMapsScraper';
import { GenericListScraper } from './genericListScraper';
import { dedupeRecords } from '../utils/deduplicate';
import { saveRecords, getRecords, updateLastScrapeMetadata } from '../utils/storage';

/**
 * Content script state
 */
let currentStatus: ScraperStatus = 'idle';
let currentScraper: GoogleMapsScraper | GenericListScraper | null = null;
let scrapedRecords: BusinessRecord[] = [];

/**
 * Listen for messages from popup
 */
chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
    console.log('Content script received message:', message);

    if (isMessageType(message, 'START_SCRAPING')) {
        handleStartScraping(message.payload);
        sendResponse({ success: true });
    } else if (isMessageType(message, 'STOP_SCRAPING')) {
        handleStopScraping();
        sendResponse({ success: true });
    } else if (isMessageType(message, 'GET_STATUS')) {
        sendResponse({
            count: scrapedRecords.length,
            status: currentStatus,
        });
    }

    return true; // Keep message channel open for async response
});

/**
 * Handle start scraping command
 */
async function handleStartScraping(options: StartScrapingOptions): Promise<void> {
    if (currentStatus === 'running') {
        sendErrorMessage('Scraping is already in progress');
        return;
    }

    try {
        currentStatus = 'running';
        scrapedRecords = [];

        // Update metadata
        await updateLastScrapeMetadata({
            startedAt: new Date().toISOString(),
            finishedAt: null,
            total: 0,
            profile: options.profile,
        });

        // Send initial progress
        sendProgressMessage(0);

        // Choose scraper based on profile
        let records: BusinessRecord[] = [];

        if (options.profile === 'google-maps') {
            // Check if we're on Google Maps
            if (!GoogleMapsScraper.isGoogleMapsPage()) {
                throw new Error('Not on a Google Maps page. Please navigate to Google Maps search results.');
            }

            currentScraper = new GoogleMapsScraper(
                options.maxResults,
                options.delayBetweenScrolls,
                (count) => sendProgressMessage(count)
            );

            records = await currentScraper.start();

        } else {
            // Generic scraper
            currentScraper = new GenericListScraper(
                options.maxResults,
                (count) => sendProgressMessage(count)
            );

            records = await currentScraper.start();
        }

        // Deduplicate records
        scrapedRecords = dedupeRecords(records);

        // Save to storage
        const existingRecords = await getRecords();
        const allRecords = dedupeRecords([...existingRecords, ...scrapedRecords]);
        await saveRecords(allRecords);

        // Update metadata
        await updateLastScrapeMetadata({
            finishedAt: new Date().toISOString(),
            total: scrapedRecords.length,
        });

        // Mark as completed
        currentStatus = 'completed';
        sendDoneMessage(scrapedRecords.length);

    } catch (error) {
        console.error('Scraping error:', error);
        currentStatus = 'error';
        sendErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
        currentScraper = null;
    }
}

/**
 * Handle stop scraping command
 */
function handleStopScraping(): void {
    if (currentScraper) {
        currentScraper.stop();
        currentStatus = 'stopped';

        // Update metadata
        updateLastScrapeMetadata({
            finishedAt: new Date().toISOString(),
            total: scrapedRecords.length,
        });

        sendProgressMessage(scrapedRecords.length);
    }
}

/**
 * Send progress update to popup
 */
function sendProgressMessage(count: number): void {
    chrome.runtime.sendMessage({
        type: 'SCRAPE_PROGRESS',
        payload: {
            count,
            status: currentStatus,
        },
    });
}

/**
 * Send completion message to popup
 */
function sendDoneMessage(total: number): void {
    chrome.runtime.sendMessage({
        type: 'SCRAPE_DONE',
        payload: {
            total,
        },
    });
}

/**
 * Send error message to popup
 */
function sendErrorMessage(message: string): void {
    chrome.runtime.sendMessage({
        type: 'ERROR',
        payload: {
            message,
        },
    });
}

console.log('Lead Scraper content script loaded');
