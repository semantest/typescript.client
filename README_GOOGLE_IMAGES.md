# Google Images Downloader - Semantest Implementation

This implementation fulfills the Semantest project spec: searching for "green house" images on Google Images and downloading them locally.

## Overview

The implementation provides two approaches:

1. **Web-Buddy Framework Integration** (`google-images-downloader.ts`) - Uses the event-driven architecture to communicate with the Web-Buddy extension
2. **Playwright Direct Automation** (`google-images-playwright.ts`) - Uses Playwright to directly automate the browser

## Prerequisites

1. Install dependencies:
```bash
cd typescript.client
npm install
```

2. For Web-Buddy integration, ensure:
   - The Web-Buddy server is running on `http://localhost:3000`
   - The Chrome extension is built and available in `extension.chrome/`
   - You have the extension ID (check Chrome's extension management page)

3. For Playwright integration:
   - Playwright will be installed with `npm install`
   - Chrome/Chromium will be downloaded automatically

## Usage

### Method 1: Simple Web-Buddy Client (Simulated)

This demonstrates the client API without requiring a live browser:

```bash
# Download a single image
npm run download:simple

# Download multiple images
npm run download:multiple
```

### Method 2: Playwright with Web-Buddy Extension

This launches a real browser with the Web-Buddy extension and performs the search:

```bash
# Set environment variables (optional)
export WEBBUDDY_SERVER_URL=http://localhost:3000
export WEBBUDDY_EXTENSION_PATH=/path/to/extension.chrome
export WEBBUDDY_EXTENSION_ID=your-extension-id

# Run the automated search and download
npm run download:playwright
```

### Method 3: Direct Playwright Download

This uses Playwright to directly interact with Google Images without the Web-Buddy extension:

```bash
# Run in headless mode (default)
npm run download:direct

# Run with visible browser
HEADLESS=false npm run download:direct
```

## What It Does

1. **Navigates to Google Images** using Playwright
2. **Searches for "green house"** in the search box
3. **Extracts image elements** from the search results
4. **Downloads an image** using one of these methods:
   - Via Web-Buddy extension (event-driven)
   - Via direct browser automation

## Output

Downloaded images and logs are saved to the `downloads/` directory:

```
downloads/
├── green_house_from_search.jpg     # Downloaded image
├── download_log.json               # Download metadata
├── search_result.png               # Screenshot of search results
└── final_result.png                # Screenshot of final state
```

## Architecture

### Event-Driven Approach (Web-Buddy)

```typescript
// 1. Create client
const client = new EventDrivenWebBuddyClient(config);

// 2. Send download request event
const result = await client.requestGoogleImageDownload(
    extensionId,
    tabId,
    imageElement,
    { searchQuery: "green house" }
);

// 3. Handle response event
if (result instanceof GoogleImageDownloadCompleted) {
    console.log('Downloaded:', result.filename);
}
```

### Direct Automation (Playwright)

```typescript
// 1. Launch browser
const browser = await chromium.launch();
const page = await browser.newPage();

// 2. Navigate and search
await page.goto('https://images.google.com');
await page.fill('input[name="q"]', 'green house');
await page.press('input[name="q"]', 'Enter');

// 3. Extract and download images
const images = await extractImageElements(page);
// ... download logic
```

## Troubleshooting

1. **Extension not loading**: Ensure the extension is built (`npm run build` in extension.chrome/)
2. **Server connection failed**: Start the Web-Buddy server (`npm start` in nodejs.server/)
3. **No images found**: Google Images layout may have changed - update selectors
4. **Download fails**: Check browser console for CORS or permission issues

## Next Steps

1. Implement actual MCP (Model Context Protocol) server integration for Playwright
2. Add more sophisticated image selection logic (quality, relevance, size)
3. Implement pattern learning for repeated searches
4. Add support for other image search engines

## Related Files

- `/extension.chrome/src/downloads/domain/entities/google-images-downloader.ts` - Core download logic
- `/extension.chrome/src/downloads/infrastructure/adapters/google-images-content-adapter.ts` - Browser integration
- `/docs/GOOGLE_IMAGES_GETTING_STARTED.md` - Detailed documentation