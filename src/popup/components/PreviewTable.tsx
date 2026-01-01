import React from 'react';
import { BusinessRecord } from '../../types/business';

interface PreviewTableProps {
    records: BusinessRecord[];
}

export const PreviewTable: React.FC<PreviewTableProps> = ({ records }) => {
    const previewRecords = records.slice(0, 20); // Show first 20 records

    if (records.length === 0) {
        return (
            <div className="px-6 py-8 text-center">
                <div className="text-gray-400 text-5xl mb-3">📋</div>
                <p className="text-gray-500 text-sm">No data yet. Start scraping to see results here.</p>
            </div>
        );
    }

    return (
        <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                    Preview ({records.length} total records)
                </h3>
                {records.length > 20 && (
                    <span className="text-xs text-gray-500">
                        Showing first 20
                    </span>
                )}
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-xs">
                        <thead className="bg-gray-100 sticky top-0">
                            <tr>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">Name</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">Rating</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">Address</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">Phone</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {previewRecords.map((record, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-3 py-2 text-gray-900 font-medium">
                                        {record.name}
                                    </td>
                                    <td className="px-3 py-2 text-gray-700">
                                        {record.rating ? (
                                            <span className="inline-flex items-center gap-1">
                                                <span className="text-yellow-500">⭐</span>
                                                {record.rating.toFixed(1)}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-3 py-2 text-gray-700 truncate max-w-xs">
                                        {record.address || <span className="text-gray-400">—</span>}
                                    </td>
                                    <td className="px-3 py-2 text-gray-700">
                                        {record.phone || <span className="text-gray-400">—</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
