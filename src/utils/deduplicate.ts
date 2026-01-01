import { BusinessRecord } from '../types/business';

/**
 * Normalize a string for comparison
 * - Converts to lowercase
 * - Trims whitespace
 * - Removes extra spaces
 * - Removes special characters
 */
function normalizeString(str: string | null): string {
    if (!str) return '';
    return str
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/g, '');
}

/**
 * Generate a unique key for a business record
 * Uses combination of name, address, and phone for best accuracy
 */
function generateRecordKey(record: BusinessRecord): string {
    const parts: string[] = [];

    // Primary identifier: Google Maps URL or Place ID
    if (record.googleMapsUrl) {
        parts.push(normalizeString(record.googleMapsUrl));
    } else if (record.placeId) {
        parts.push(normalizeString(record.placeId));
    }

    // Secondary identifiers
    if (record.name) {
        parts.push(normalizeString(record.name));
    }

    if (record.address) {
        parts.push(normalizeString(record.address));
    }

    if (record.phone) {
        parts.push(normalizeString(record.phone));
    }

    // If we have at least name + (address OR phone), that's good enough
    if (parts.length >= 2) {
        return parts.join('|');
    }

    // Fallback: use all available data
    return JSON.stringify(record);
}

/**
 * Remove duplicate records from an array
 * Keeps the first occurrence of each unique record
 * 
 * @param records - Array of business records to deduplicate
 * @returns Deduplicated array of records
 */
export function dedupeRecords(records: BusinessRecord[]): BusinessRecord[] {
    const seen = new Set<string>();
    const unique: BusinessRecord[] = [];

    for (const record of records) {
        const key = generateRecordKey(record);

        if (!seen.has(key)) {
            seen.add(key);
            unique.push(record);
        }
    }

    return unique;
}

/**
 * Check if two records are duplicates
 */
export function areDuplicates(record1: BusinessRecord, record2: BusinessRecord): boolean {
    return generateRecordKey(record1) === generateRecordKey(record2);
}

/**
 * Merge two arrays of records and deduplicate
 */
export function mergeAndDedupe(existing: BusinessRecord[], newRecords: BusinessRecord[]): BusinessRecord[] {
    const combined = [...existing, ...newRecords];
    return dedupeRecords(combined);
}
