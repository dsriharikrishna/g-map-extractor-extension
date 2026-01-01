/**
 * Wait for a specified amount of time
 * 
 * @param ms - Milliseconds to wait
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wait for an element to appear in the DOM
 * 
 * @param selector - CSS selector
 * @param timeout - Maximum time to wait in milliseconds
 * @returns The found element or null if timeout
 */
export async function waitForElement(
    selector: string,
    timeout: number = 5000
): Promise<Element | null> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        const element = document.querySelector(selector);
        if (element) {
            return element;
        }
        await sleep(100);
    }

    return null;
}

/**
 * Wait for multiple elements to appear in the DOM
 * 
 * @param selector - CSS selector
 * @param minCount - Minimum number of elements to wait for
 * @param timeout - Maximum time to wait in milliseconds
 */
export async function waitForElements(
    selector: string,
    minCount: number = 1,
    timeout: number = 5000
): Promise<Element[]> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        const elements = Array.from(document.querySelectorAll(selector));
        if (elements.length >= minCount) {
            return elements;
        }
        await sleep(100);
    }

    return [];
}

/**
 * Scroll an element by a specified amount
 * 
 * @param element - Element to scroll
 * @param scrollAmount - Amount to scroll in pixels
 */
export function scrollElement(element: Element, scrollAmount: number): void {
    element.scrollBy({
        top: scrollAmount,
        behavior: 'smooth',
    });
}

/**
 * Get the scroll height of an element
 */
export function getScrollHeight(element: Element): number {
    return element.scrollHeight;
}

/**
 * Get the current scroll position of an element
 */
export function getScrollTop(element: Element): number {
    return element.scrollTop;
}

/**
 * Check if an element is scrolled to the bottom
 */
export function isScrolledToBottom(element: Element, threshold: number = 10): boolean {
    const scrollTop = getScrollTop(element);
    const scrollHeight = getScrollHeight(element);
    const clientHeight = element.clientHeight;

    return scrollTop + clientHeight >= scrollHeight - threshold;
}

/**
 * Extract text content from an element safely
 */
export function getTextContent(element: Element | null): string | null {
    if (!element) return null;
    return element.textContent?.trim() || null;
}

/**
 * Extract attribute value from an element safely
 */
export function getAttribute(element: Element | null, attribute: string): string | null {
    if (!element) return null;
    return element.getAttribute(attribute);
}

/**
 * Parse a rating string to a number
 * Examples: "4.5", "4.5 stars", "Rating: 4.5"
 */
export function parseRating(ratingText: string | null): number | null {
    if (!ratingText) return null;

    const match = ratingText.match(/(\d+\.?\d*)/);
    if (match) {
        const rating = parseFloat(match[1]);
        return isNaN(rating) ? null : rating;
    }

    return null;
}

/**
 * Parse a review count string to a number
 * Examples: "123", "123 reviews", "(123)", "123 Reviews"
 */
export function parseReviewCount(reviewText: string | null): number | null {
    if (!reviewText) return null;

    const match = reviewText.match(/(\d+)/);
    if (match) {
        const count = parseInt(match[1], 10);
        return isNaN(count) ? null : count;
    }

    return null;
}

/**
 * Extract phone number from a tel: link
 */
export function extractPhoneFromTel(telLink: string | null): string | null {
    if (!telLink) return null;

    const match = telLink.match(/tel:(.+)/);
    return match ? match[1] : null;
}

/**
 * Clean and normalize a phone number
 */
export function normalizePhone(phone: string | null): string | null {
    if (!phone) return null;

    // Remove common formatting characters
    return phone.replace(/[\s\-\(\)\.]/g, '');
}
