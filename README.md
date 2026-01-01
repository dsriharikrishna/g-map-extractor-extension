# Lead Scraper - Chrome Extension

A production-ready Chrome Extension for scraping business data from Google Maps and directory sites. Built with TypeScript, React, and Tailwind CSS.

## 🎯 Features

- **Google Maps Scraper**: Intelligently scrapes business listings from Google Maps search results
- **Generic List Scraper**: Works with various directory sites using common patterns
- **Smart Deduplication**: Automatically removes duplicate entries based on name, address, and phone
- **Progress Tracking**: Real-time progress updates with visual feedback
- **Data Export**: Export scraped data as CSV or JSON
- **Modern UI**: Clean, responsive popup interface built with React and Tailwind CSS
- **TypeScript**: Fully typed codebase for better development experience

## 📊 Data Extracted

The extension extracts the following fields where available:

- Business name
- Category
- Rating & review count
- Price level ($, $$, $$$)
- Full address
- Phone number
- Website URL
- Google Maps URL
- Place ID
- Plus Code
- Latitude & Longitude (when available)
- Source & timestamp

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Chrome browser

### Installation

1. **Clone or download this repository**

2. **Install dependencies**
   ```bash
   cd GMAPExtractor
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

   This will create a `dist` folder with the compiled extension.

4. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

### Development

For development with auto-rebuild on file changes:

```bash
npm run dev
```

This will watch for file changes and automatically rebuild the extension. You'll need to manually reload the extension in Chrome after changes.

## 📖 Usage

### Basic Workflow

1. **Navigate to your target page**
   - For Google Maps: Search for businesses (e.g., "Indian restaurants in Dallas, Texas")
   - For other sites: Open any business directory or listing page

2. **Open the extension**
   - Click the extension icon in your Chrome toolbar
   - The popup will detect the page type automatically

3. **Configure settings**
   - **Scrape Profile**: Choose "Google Maps" or "Generic Listing"
   - **Max Results**: Set the maximum number of results to scrape (default: 200)
   - **Delay Between Scrolls**: Set the delay in milliseconds (default: 1500ms)

4. **Start scraping**
   - Click the "Start Scraping" button
   - Watch the progress bar as data is extracted
   - You can stop at any time by clicking "Stop Scraping"

5. **Export data**
   - Preview the first 20 records in the table
   - Click "Export CSV" or "Export JSON" to download your data
   - Use "Clear All Data" to reset and start fresh

### Google Maps Scraping

For best results with Google Maps:

1. Perform a search on Google Maps (e.g., "restaurants near me")
2. Wait for the results sidebar to load
3. Open the extension and select "Google Maps" profile
4. Start scraping - the extension will automatically scroll and load more results

### Generic Site Scraping

For other directory sites:

1. Navigate to a page with business listings
2. Open the extension and select "Generic Listing" profile
3. Start scraping - the extension will attempt to find and extract business data using common patterns

## 🏗️ Project Structure

```
GMAPExtractor/
├── public/                    # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── src/
│   ├── background/           # Background service worker
│   │   └── background.ts
│   ├── content/              # Content scripts
│   │   ├── googleMapsScraper.ts
│   │   ├── genericListScraper.ts
│   │   └── index.ts
│   ├── popup/                # Popup UI
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── Controls.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── PreviewTable.tsx
│   │   ├── index.html
│   │   ├── popup.tsx
│   │   └── styles.css
│   ├── types/                # TypeScript definitions
│   │   ├── business.ts
│   │   └── messages.ts
│   └── utils/                # Utility functions
│       ├── csvExport.ts
│       ├── jsonExport.ts
│       ├── deduplicate.ts
│       ├── domHelpers.ts
│       └── storage.ts
├── manifest.json             # Extension manifest
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── webpack.config.js
```

## 🔧 Configuration

### Manifest Permissions

The extension requires the following permissions:

- `scripting`: To inject content scripts
- `activeTab`: To access the current tab
- `storage`: To persist scraped data
- `downloads`: To download exported files
- `host_permissions`: To run on all websites

### Customization

You can customize the scraper by modifying:

- **Selectors**: Update selectors in `googleMapsScraper.ts` if Google changes their DOM
- **Generic patterns**: Add more patterns in `genericListScraper.ts` for better coverage
- **UI styling**: Modify Tailwind classes in popup components
- **Export format**: Customize CSV/JSON export in utility files

## 🛠️ Technical Stack

- **TypeScript**: Strongly typed JavaScript
- **React**: UI library for popup interface
- **Tailwind CSS**: Utility-first CSS framework
- **Webpack**: Module bundler
- **Chrome Extensions API**: Manifest V3

## ⚠️ Important Notes

### Compliance

- This extension is for educational and personal use only
- Always respect website terms of service and robots.txt
- Use reasonable delays to avoid overwhelming servers
- Be mindful of rate limiting and scraping ethics

### Limitations

- Google Maps may update their DOM structure, requiring selector updates
- Some websites may block or detect scraping attempts
- Not all fields are available on all sites
- Results depend on page structure and available data

### Performance

- Larger scraping sessions (500+ results) may take several minutes
- Increase delay between scrolls if experiencing issues
- Browser may become slow during intensive scraping

## 🐛 Troubleshooting

### Extension not working

1. Refresh the target page
2. Reload the extension in `chrome://extensions`
3. Check the browser console for errors

### No data extracted

1. Verify you're on a supported page type
2. Try the "Generic Listing" profile
3. Check if the page has loaded completely

### Selectors not matching

1. Google Maps or other sites may have updated their HTML
2. Update selectors in the scraper files
3. Use browser DevTools to inspect element structure

## 📝 License

MIT License - feel free to use and modify for your needs.

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📧 Support

For issues or questions, please open an issue on the repository.

---

**Disclaimer**: This tool is provided as-is for educational purposes. Users are responsible for ensuring their use complies with applicable laws and website terms of service.
