import { BusinessRecord } from '../types/business';

/**
 * Convert business records to CSV format
 * 
 * @param records - Array of business records
 * @returns CSV string
 */
export function exportToCSV(records: BusinessRecord[]): string {
    if (records.length === 0) {
        return '';
    }

    // Define CSV headers
    const headers = [
        'Name',
        'Category',
        'Rating',
        'Review Count',
        'Price Level',
        'Address',
        'Locality',
        'Phone',
        'Website',
        'Google Maps URL',
        'Place ID',
        'Plus Code',
        'Latitude',
        'Longitude',
        'Source',
        'Scraped At',
    ];

    // Create CSV rows
    const rows = records.map(record => [
        escapeCsvValue(record.name),
        escapeCsvValue(record.category),
        record.rating?.toString() || '',
        record.reviewCount?.toString() || '',
        escapeCsvValue(record.priceLevel),
        escapeCsvValue(record.address),
        escapeCsvValue(record.locality),
        escapeCsvValue(record.phone),
        escapeCsvValue(record.website),
        escapeCsvValue(record.googleMapsUrl),
        escapeCsvValue(record.placeId),
        escapeCsvValue(record.plusCode),
        record.latitude?.toString() || '',
        record.longitude?.toString() || '',
        record.source,
        record.scrapedAt,
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
    ].join('\n');

    return csvContent;
}

/**
 * Escape a value for CSV format
 * - Wraps in quotes if contains comma, quote, or newline
 * - Escapes internal quotes by doubling them
 */
function escapeCsvValue(value: string | null): string {
    if (value === null || value === undefined) {
        return '';
    }

    const stringValue = String(value);

    // Check if value needs escaping
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        // Escape quotes by doubling them
        const escaped = stringValue.replace(/"/g, '""');
        return `"${escaped}"`;
    }

    return stringValue;
}

/**
 * Download CSV file
 * 
 * @param records - Array of business records
 * @param filename - Name of the file to download
 */
export function downloadCSV(records: BusinessRecord[], filename: string = 'business-leads.csv'): void {
    const csvContent = exportToCSV(records);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);
}
