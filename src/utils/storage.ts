import { BusinessRecord, StorageData, LastScrapeMetadata, StartScrapingOptions } from '../types/business';

/**
 * Default storage data structure
 */
const DEFAULT_STORAGE: StorageData = {
    records: [],
    lastScrape: {
        startedAt: null,
        finishedAt: null,
        total: 0,
        profile: null,
    },
    settings: {
        maxResults: 200,
        delayBetweenScrolls: 1500,
        profile: 'google-maps',
    },
};

/**
 * Get all stored records
 */
export async function getRecords(): Promise<BusinessRecord[]> {
    const data = await chrome.storage.local.get('records');
    return data.records || [];
}

/**
 * Save records to storage
 */
export async function saveRecords(records: BusinessRecord[]): Promise<void> {
    await chrome.storage.local.set({ records });
}

/**
 * Add new records to existing storage (with deduplication)
 */
export async function addRecords(newRecords: BusinessRecord[]): Promise<void> {
    const existing = await getRecords();
    const combined = [...existing, ...newRecords];
    await saveRecords(combined);
}

/**
 * Get last scrape metadata
 */
export async function getLastScrapeMetadata(): Promise<LastScrapeMetadata> {
    const data = await chrome.storage.local.get('lastScrape');
    return data.lastScrape || DEFAULT_STORAGE.lastScrape;
}

/**
 * Update last scrape metadata
 */
export async function updateLastScrapeMetadata(metadata: Partial<LastScrapeMetadata>): Promise<void> {
    const current = await getLastScrapeMetadata();
    await chrome.storage.local.set({
        lastScrape: { ...current, ...metadata },
    });
}

/**
 * Get user settings
 */
export async function getSettings(): Promise<StartScrapingOptions> {
    const data = await chrome.storage.local.get('settings');
    return data.settings || DEFAULT_STORAGE.settings;
}

/**
 * Save user settings
 */
export async function saveSettings(settings: StartScrapingOptions): Promise<void> {
    await chrome.storage.local.set({ settings });
}

/**
 * Clear all stored data
 */
export async function clearAllData(): Promise<void> {
    await chrome.storage.local.clear();
    // Restore default settings
    await chrome.storage.local.set(DEFAULT_STORAGE);
}

/**
 * Get total count of stored records
 */
export async function getRecordCount(): Promise<number> {
    const records = await getRecords();
    return records.length;
}
