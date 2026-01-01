import React from 'react';
import { ScraperStatus } from '../../types/business';

interface ProgressBarProps {
    status: ScraperStatus;
    currentCount: number;
    maxResults: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    status,
    currentCount,
    maxResults,
}) => {
    const getStatusText = () => {
        switch (status) {
            case 'idle':
                return 'Ready to scrape';
            case 'running':
                return 'Scraping in progress...';
            case 'stopped':
                return 'Stopped by user';
            case 'completed':
                return 'Scraping completed!';
            case 'error':
                return 'Error occurred';
            default:
                return 'Unknown status';
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'idle':
                return 'text-gray-600';
            case 'running':
                return 'text-primary-600';
            case 'stopped':
                return 'text-yellow-600';
            case 'completed':
                return 'text-green-600';
            case 'error':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const getProgressBarColor = () => {
        switch (status) {
            case 'running':
                return 'bg-primary-600';
            case 'stopped':
                return 'bg-yellow-500';
            case 'completed':
                return 'bg-green-600';
            case 'error':
                return 'bg-red-600';
            default:
                return 'bg-gray-400';
        }
    };

    const progressPercentage = maxResults > 0 ? Math.min((currentCount / maxResults) * 100, 100) : 0;

    return (
        <div className="px-6 py-4 bg-gray-50 border-t border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-semibold ${getStatusColor()}`}>
                    {getStatusText()}
                </span>
                <span className="text-sm font-bold text-gray-700">
                    {currentCount} / {maxResults}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-300 ${getProgressBarColor()} ${status === 'running' ? 'animate-pulse-slow' : ''
                        }`}
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>

            {/* Additional info for running state */}
            {status === 'running' && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                    Scrolling and extracting data...
                </p>
            )}
        </div>
    );
};
