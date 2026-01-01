import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Header } from './components/Header';
import { Controls } from './components/Controls';
import { ProgressBar } from './components/ProgressBar';
import { PreviewTable } from './components/PreviewTable';
import { BusinessRecord, ScraperStatus, ScraperProfile } from '../types/business';
import { Message, isMessageType } from '../types/messages';
import { getRecords, getSettings, saveSettings, clearAllData } from '../utils/storage';
import { downloadCSV } from '../utils/csvExport';
import { downloadJSON } from '../utils/jsonExport';
import './styles.css';

const App: React.FC = () => {
    // State
    const [status, setStatus] = useState<ScraperStatus>('idle');
    const [currentCount, setCurrentCount] = useState(0);
    const [records, setRecords] = useState<BusinessRecord[]>([]);
    const [maxResults, setMaxResults] = useState(200);
    const [delayBetweenScrolls, setDelayBetweenScrolls] = useState(1500);
    const [profile, setProfile] = useState<ScraperProfile>('google-maps');
    const [pageStatus, setPageStatus] = useState('Detecting page...');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Load initial data
    useEffect(() => {
        loadData();
        detectPageType();
        listenForMessages();
    }, []);

    // Load records and settings from storage
    const loadData = async () => {
        const storedRecords = await getRecords();
        const storedSettings = await getSettings();

        setRecords(storedRecords);
        setMaxResults(storedSettings.maxResults);
        setDelayBetweenScrolls(storedSettings.delayBetweenScrolls);
        setProfile(storedSettings.profile);
    };

    // Detect the type of page we're on
    const detectPageType = async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab.url) {
            setPageStatus('Unknown page');
            return;
        }

        if (tab.url.includes('google.com/maps')) {
            setPageStatus('✓ Google Maps detected');
        } else if (tab.url.includes('yelp.com')) {
            setPageStatus('Generic site (Yelp)');
        } else {
            setPageStatus('Generic website');
        }
    };

    // Listen for messages from content script
    const listenForMessages = () => {
        chrome.runtime.onMessage.addListener((message: Message) => {
            if (isMessageType(message, 'SCRAPE_PROGRESS')) {
                setStatus(message.payload.status);
                setCurrentCount(message.payload.count);
            } else if (isMessageType(message, 'SCRAPE_DONE')) {
                setStatus('completed');
                setCurrentCount(message.payload.total);
                loadData(); // Reload records
                showToastMessage(`✓ Scraping completed! ${message.payload.total} records extracted.`);
            } else if (isMessageType(message, 'ERROR')) {
                setStatus('error');
                showToastMessage(`✗ Error: ${message.payload.message}`);
            }
        });
    };

    // Show toast notification
    const showToastMessage = (message: string) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
    };

    // Start scraping
    const handleStartScraping = async () => {
        // Clear previous data before starting new scrape
        await clearAllData();
        setRecords([]);
        setCurrentCount(0);

        // Save settings
        await saveSettings({ maxResults, delayBetweenScrolls, profile });

        // Send message to content script
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab.id) {
            showToastMessage('✗ Error: No active tab found');
            return;
        }

        try {
            await chrome.tabs.sendMessage(tab.id, {
                type: 'START_SCRAPING',
                payload: { maxResults, delayBetweenScrolls, profile },
            });

            setStatus('running');
            setCurrentCount(0);
        } catch (error) {
            showToastMessage('✗ Error: Could not communicate with page. Try refreshing the page.');
            console.error(error);
        }
    };

    // Stop scraping
    const handleStopScraping = async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab.id) return;

        try {
            await chrome.tabs.sendMessage(tab.id, {
                type: 'STOP_SCRAPING',
            });

            setStatus('stopped');
            loadData(); // Reload records
        } catch (error) {
            console.error(error);
        }
    };

    // Export as CSV (in batches of 100)
    const handleExportCSV = () => {
        if (records.length === 0) {
            showToastMessage('⚠ No data to export');
            return;
        }

        const batchSize = 100;
        const totalBatches = Math.ceil(records.length / batchSize);

        for (let i = 0; i < totalBatches; i++) {
            const start = i * batchSize;
            const end = Math.min(start + batchSize, records.length);
            const batch = records.slice(start, end);

            const filename = totalBatches > 1
                ? `business-leads-batch-${i + 1}-of-${totalBatches}-${Date.now()}.csv`
                : `business-leads-${Date.now()}.csv`;

            downloadCSV(batch, filename);
        }

        showToastMessage(`✓ Exported ${records.length} records in ${totalBatches} file(s)`);
    };

    // Export as JSON (in batches of 100)
    const handleExportJSON = () => {
        if (records.length === 0) {
            showToastMessage('⚠ No data to export');
            return;
        }

        const batchSize = 100;
        const totalBatches = Math.ceil(records.length / batchSize);

        for (let i = 0; i < totalBatches; i++) {
            const start = i * batchSize;
            const end = Math.min(start + batchSize, records.length);
            const batch = records.slice(start, end);

            const filename = totalBatches > 1
                ? `business-leads-batch-${i + 1}-of-${totalBatches}-${Date.now()}.json`
                : `business-leads-${Date.now()}.json`;

            downloadJSON(batch, filename);
        }

        showToastMessage(`✓ Exported ${records.length} records in ${totalBatches} file(s)`);
    };

    // Clear all data
    const handleClearData = async () => {
        if (confirm('Are you sure you want to clear all scraped data? This cannot be undone.')) {
            await clearAllData();
            setRecords([]);
            setCurrentCount(0);
            setStatus('idle');
            showToastMessage('✓ All data cleared');
        }
    };

    return (
        <div className="w-[500px] bg-white shadow-xl rounded-lg overflow-hidden">
            <Header pageStatus={pageStatus} />

            <Controls
                status={status}
                maxResults={maxResults}
                delayBetweenScrolls={delayBetweenScrolls}
                profile={profile}
                onMaxResultsChange={setMaxResults}
                onDelayChange={setDelayBetweenScrolls}
                onProfileChange={setProfile}
                onStartClick={handleStartScraping}
                onStopClick={handleStopScraping}
            />

            <ProgressBar
                status={status}
                currentCount={currentCount}
                maxResults={maxResults}
            />

            <PreviewTable records={records} />

            {/* Export Section */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Export Data</h3>
                <div className="flex gap-2">
                    <button
                        onClick={handleExportCSV}
                        disabled={records.length === 0}
                        className="flex-1 bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                    >
                        📊 Export CSV
                    </button>
                    <button
                        onClick={handleExportJSON}
                        disabled={records.length === 0}
                        className="flex-1 bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                    >
                        📄 Export JSON
                    </button>
                </div>

                <button
                    onClick={handleClearData}
                    className="w-full mt-2 bg-white border border-red-300 text-red-600 hover:bg-red-50 font-medium py-2 px-4 rounded-lg text-sm transition-colors"
                >
                    🗑️ Clear All Data
                </button>
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-pulse z-50">
                    {toastMessage}
                </div>
            )}
        </div>
    );
};

// Mount React app
const root = document.getElementById('root');
if (root) {
    ReactDOM.createRoot(root).render(<App />);
}
