import React from 'react';
import { ScraperStatus, ScraperProfile } from '../../types/business';

interface ControlsProps {
    status: ScraperStatus;
    maxResults: number;
    delayBetweenScrolls: number;
    profile: ScraperProfile;
    onMaxResultsChange: (value: number) => void;
    onDelayChange: (value: number) => void;
    onProfileChange: (value: ScraperProfile) => void;
    onStartClick: () => void;
    onStopClick: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
    status,
    maxResults,
    delayBetweenScrolls,
    profile,
    onMaxResultsChange,
    onDelayChange,
    onProfileChange,
    onStartClick,
    onStopClick,
}) => {
    const isRunning = status === 'running';
    const isDisabled = isRunning;

    return (
        <div className="p-6 space-y-4 bg-white">
            {/* Settings */}
            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Scrape Profile
                    </label>
                    <select
                        value={profile}
                        onChange={(e) => onProfileChange(e.target.value as ScraperProfile)}
                        disabled={isDisabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                    >
                        <option value="google-maps">Google Maps</option>
                        <option value="generic-listing">Generic Listing</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Results
                    </label>
                    <input
                        type="number"
                        value={maxResults}
                        onChange={(e) => onMaxResultsChange(parseInt(e.target.value) || 0)}
                        disabled={isDisabled}
                        min="1"
                        max="1000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delay Between Scrolls (ms)
                    </label>
                    <input
                        type="number"
                        value={delayBetweenScrolls}
                        onChange={(e) => onDelayChange(parseInt(e.target.value) || 0)}
                        disabled={isDisabled}
                        min="500"
                        max="5000"
                        step="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                    />
                </div>
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                    💡 <strong>Tip:</strong> Open your target search page (e.g., Google Maps search results) before starting.
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                {!isRunning ? (
                    <button
                        onClick={onStartClick}
                        className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <span className="text-lg">▶</span>
                        Start Scraping
                    </button>
                ) : (
                    <button
                        onClick={onStopClick}
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <span className="text-lg">⏸</span>
                        Stop Scraping
                    </button>
                )}
            </div>
        </div>
    );
};
