import { Message } from '../types/messages';

/**
 * Background service worker
 * Handles extension lifecycle and message routing
 */

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('Lead Scraper Extension installed');
});

// Listen for messages (can be used for future features)
chrome.runtime.onMessage.addListener((message: Message, _sender, _sendResponse) => {
    console.log('Background received message:', message);

    // Currently, most communication happens directly between popup and content script
    // This can be extended for more complex message routing if needed

    return true;
});

console.log('Lead Scraper background service worker loaded');
