import { StartScrapingOptions, ScrapeProgress } from './business';

/**
 * Message types for communication between popup, content scripts, and background
 */
export type Message =
    | StartScrapingMessage
    | StopScrapingMessage
    | ScrapeProgressMessage
    | ScrapeDoneMessage
    | ErrorMessage
    | GetStatusMessage
    | StatusResponseMessage
    | ClearDataMessage;

/**
 * Start scraping command from popup to content script
 */
export interface StartScrapingMessage {
    type: 'START_SCRAPING';
    payload: StartScrapingOptions;
}

/**
 * Stop scraping command from popup to content script
 */
export interface StopScrapingMessage {
    type: 'STOP_SCRAPING';
}

/**
 * Progress update from content script to popup
 */
export interface ScrapeProgressMessage {
    type: 'SCRAPE_PROGRESS';
    payload: ScrapeProgress;
}

/**
 * Scraping completed notification from content script to popup
 */
export interface ScrapeDoneMessage {
    type: 'SCRAPE_DONE';
    payload: {
        total: number;
    };
}

/**
 * Error notification
 */
export interface ErrorMessage {
    type: 'ERROR';
    payload: {
        message: string;
    };
}

/**
 * Request current status from content script
 */
export interface GetStatusMessage {
    type: 'GET_STATUS';
}

/**
 * Response with current status
 */
export interface StatusResponseMessage {
    type: 'STATUS_RESPONSE';
    payload: ScrapeProgress;
}

/**
 * Clear all stored data
 */
export interface ClearDataMessage {
    type: 'CLEAR_DATA';
}

/**
 * Type guard to check if a message is of a specific type
 */
export function isMessageType<T extends Message['type']>(
    message: Message,
    type: T
): message is Extract<Message, { type: T }> {
    return message.type === type;
}
