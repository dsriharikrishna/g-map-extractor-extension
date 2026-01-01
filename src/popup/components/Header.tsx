import React from 'react';

interface HeaderProps {
    pageStatus: string;
}

export const Header: React.FC<HeaderProps> = ({ pageStatus }) => {
    const getStatusColor = () => {
        if (pageStatus.includes('Google Maps')) {
            return 'bg-green-100 text-green-800 border-green-300';
        } else if (pageStatus.includes('Generic')) {
            return 'bg-blue-100 text-blue-800 border-blue-300';
        } else {
            return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    return (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 rounded-t-lg">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Lead Scraper</h1>
                    <p className="text-primary-100 text-sm">Extract business data with ease</p>
                </div>
                <div className="text-4xl">🎯</div>
            </div>

            <div className="mt-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor()}`}>
                    {pageStatus}
                </span>
            </div>
        </div>
    );
};
