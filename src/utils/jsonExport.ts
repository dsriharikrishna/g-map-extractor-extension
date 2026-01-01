import { BusinessRecord } from '../types/business';

/**
 * Convert business records to JSON format
 * 
 * @param records - Array of business records
 * @returns Pretty-printed JSON string
 */
export function exportToJSON(records: BusinessRecord[]): string {
    return JSON.stringify(records, null, 2);
}

/**
 * Download JSON file
 * 
 * @param records - Array of business records
 * @param filename - Name of the file to download
 */
export function downloadJSON(records: BusinessRecord[], filename: string = 'business-leads.json'): void {
    const jsonContent = exportToJSON(records);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
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
