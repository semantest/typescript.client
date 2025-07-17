#!/usr/bin/env node
/*
                        Semantest - Google Images Playwright Integration
                        Automated browser interaction for image search and download

    This script uses Playwright to automate the browser, navigate to Google Images,
    search for "green house", and download one of the matching images.
*/

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { EventDrivenWebBuddyClient } from '../typescript/src/event-driven-client';
import { 
    GoogleImageDownloadCompleted, 
    GoogleImageDownloadFailed 
} from '../typescript/src/types';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const config = {
    baseUrl: process.env.WEBBUDDY_SERVER_URL || 'http://localhost:3000',
    apiKey: process.env.WEBBUDDY_API_KEY || 'test-api-key',
    extensionId: process.env.WEBBUDDY_EXTENSION_ID || 'test-extension-id',
    extensionPath: process.env.WEBBUDDY_EXTENSION_PATH || path.join(__dirname, '../../extension.chrome'),
    headless: process.env.HEADLESS !== 'false', // Default to headless mode
    timeout: 60000
};

// Create client instance
const client = new EventDrivenWebBuddyClient(config);

/**
 * Launch browser with Web-Buddy extension loaded
 */
async function launchBrowserWithExtension(): Promise<{ browser: Browser; context: BrowserContext; page: Page }> {
    console.log('🚀 Launching browser with Web-Buddy extension...');
    
    const browser = await chromium.launch({
        headless: false, // Extensions don't work in headless mode
        args: [
            `--disable-extensions-except=${config.extensionPath}`,
            `--load-extension=${config.extensionPath}`
        ]
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    const page = await context.newPage();
    
    // Wait a bit for extension to initialize
    await page.waitForTimeout(2000);
    
    console.log('✅ Browser launched with extension loaded\n');
    
    return { browser, context, page };
}

/**
 * Navigate to Google Images and search
 */
async function searchGoogleImages(page: Page, query: string) {
    console.log(`🌐 Navigating to Google Images...`);
    
    // Navigate to Google Images
    await page.goto('https://images.google.com', {
        waitUntil: 'networkidle',
        timeout: 30000
    });
    
    console.log('✅ Google Images loaded\n');
    
    // Accept cookies if dialog appears
    try {
        const acceptButton = await page.locator('text="Accept all"').or(page.locator('text="I agree"'));
        if (await acceptButton.isVisible({ timeout: 3000 })) {
            await acceptButton.click();
            console.log('🍪 Accepted cookies\n');
        }
    } catch (e) {
        // No cookie dialog, continue
    }
    
    console.log(`🔍 Searching for "${query}"...`);
    
    // Find and fill the search input
    const searchInput = await page.locator('input[name="q"]');
    await searchInput.fill(query);
    await searchInput.press('Enter');
    
    // Wait for search results to load
    await page.waitForSelector('img[data-src], img[src*="encrypted"]', {
        timeout: 10000
    });
    
    console.log('✅ Search results loaded\n');
}

/**
 * Extract image elements from search results
 */
async function extractImageElements(page: Page, limit: number = 5) {
    console.log('📸 Extracting image elements from search results...');
    
    // Wait a bit for all images to be visible
    await page.waitForTimeout(2000);
    
    // Get all image elements from search results
    const imageElements = await page.evaluate((maxImages) => {
        const images = [];
        const imgElements = document.querySelectorAll('img[data-src], img[src*="encrypted"], img[jsname]');
        
        for (let i = 0; i < Math.min(imgElements.length, maxImages); i++) {
            const img = imgElements[i] as HTMLImageElement;
            
            // Skip tiny images (likely icons)
            if (img.width < 50 || img.height < 50) continue;
            
            images.push({
                src: img.src,
                dataSrc: img.getAttribute('data-src'),
                alt: img.alt || '',
                title: img.title || '',
                width: img.naturalWidth || img.width,
                height: img.naturalHeight || img.height,
                index: i
            });
        }
        
        return images;
    }, limit);
    
    console.log(`✅ Found ${imageElements.length} suitable images\n`);
    
    return imageElements;
}

/**
 * Click on an image to get full resolution
 */
async function clickImageForFullRes(page: Page, imageIndex: number) {
    console.log(`🖱️ Clicking on image ${imageIndex + 1} to get full resolution...`);
    
    // Click on the image
    const imageSelector = `img:nth-of-type(${imageIndex + 1})`;
    await page.click(imageSelector);
    
    // Wait for the side panel with full image to appear
    await page.waitForSelector('img[src*="googleusercontent.com"]:not([data-src])', {
        timeout: 5000
    });
    
    // Extract the full resolution image URL
    const fullResImage = await page.evaluate(() => {
        // Look for the larger image in the side panel
        const images = Array.from(document.querySelectorAll('img'));
        const largeImage = images
            .filter(img => img.naturalWidth > 400 || img.width > 400)
            .sort((a, b) => (b.naturalWidth * b.naturalHeight) - (a.naturalWidth * a.naturalHeight))[0];
        
        if (largeImage) {
            return {
                src: largeImage.src,
                alt: largeImage.alt,
                width: largeImage.naturalWidth || largeImage.width,
                height: largeImage.naturalHeight || largeImage.height
            };
        }
        
        return null;
    });
    
    if (fullResImage) {
        console.log(`✅ Found full resolution image: ${fullResImage.width}x${fullResImage.height}\n`);
    }
    
    return fullResImage;
}

/**
 * Main function to search and download green house image
 */
async function searchAndDownloadWithPlaywright() {
    let browser: Browser | null = null;
    
    try {
        // Launch browser with extension
        const { browser: b, context, page } = await launchBrowserWithExtension();
        browser = b;
        
        // Get the tab ID for Web-Buddy communication
        const pages = context.pages();
        const tabId = pages.indexOf(page) + 1; // Simple tab ID assignment
        
        // Search for green house images
        const searchQuery = "green house";
        await searchGoogleImages(page, searchQuery);
        
        // Extract image elements
        const images = await extractImageElements(page, 10);
        
        if (images.length === 0) {
            throw new Error('No images found in search results');
        }
        
        // Try to get full resolution of the first image
        let targetImage = images[0];
        try {
            const fullResImage = await clickImageForFullRes(page, 0);
            if (fullResImage) {
                targetImage = { ...targetImage, ...fullResImage };
            }
        } catch (e) {
            console.warn('⚠️ Could not get full resolution, using thumbnail\n');
        }
        
        console.log('📥 Downloading image via Web-Buddy...');
        console.log(`   Source: ${targetImage.src}`);
        console.log(`   Alt: ${targetImage.alt}`);
        console.log(`   Dimensions: ${targetImage.width}x${targetImage.height}\n`);
        
        // Request download through Web-Buddy
        const downloadResult = await client.requestGoogleImageDownload(
            config.extensionId,
            tabId,
            {
                src: targetImage.src,
                alt: targetImage.alt,
                title: targetImage.title,
                width: targetImage.width,
                height: targetImage.height
            },
            {
                searchQuery: searchQuery,
                filename: 'green_house_from_search'
            }
        );
        
        // Handle result
        if (downloadResult instanceof GoogleImageDownloadCompleted) {
            console.log('✅ Image downloaded successfully!');
            console.log(`   Filename: ${downloadResult.filename}`);
            console.log(`   Path: ${downloadResult.filepath}\n`);
            
            // Take a screenshot of the result
            const screenshotPath = path.join(process.cwd(), 'downloads', 'search_result.png');
            await page.screenshot({ path: screenshotPath, fullPage: true });
            console.log(`📸 Screenshot saved to: ${screenshotPath}`);
            
            return downloadResult;
            
        } else {
            throw new Error(`Download failed: ${downloadResult.reason}`);
        }
        
    } catch (error) {
        console.error('💥 Error:', error);
        throw error;
        
    } finally {
        if (browser) {
            console.log('\n🔚 Closing browser...');
            await browser.close();
        }
    }
}

/**
 * Alternative: Download directly without Web-Buddy extension
 */
async function downloadDirectlyWithPlaywright() {
    let browser: Browser | null = null;
    
    try {
        console.log('🚀 Launching browser for direct download...\n');
        
        browser = await chromium.launch({
            headless: config.headless,
            downloads: path.join(process.cwd(), 'downloads')
        });
        
        const context = await browser.newContext({
            acceptDownloads: true
        });
        
        const page = await context.newPage();
        
        // Search for images
        await searchGoogleImages(page, "green house");
        
        // Click on first image to open it
        console.log('🖱️ Opening first image...');
        await page.click('img:first-of-type');
        await page.waitForTimeout(2000);
        
        // Try to find and click a download button or right-click to save
        console.log('💾 Attempting to save image...');
        
        // Method 1: Look for any download buttons
        try {
            const downloadButton = await page.locator('text="Download"').or(page.locator('[aria-label*="Download"]'));
            if (await downloadButton.isVisible({ timeout: 3000 })) {
                const downloadPromise = page.waitForEvent('download');
                await downloadButton.click();
                const download = await downloadPromise;
                
                const fileName = `green_house_${Date.now()}.jpg`;
                await download.saveAs(path.join(process.cwd(), 'downloads', fileName));
                
                console.log(`✅ Image saved as: ${fileName}`);
                return fileName;
            }
        } catch (e) {
            console.log('ℹ️ No download button found, trying right-click method...');
        }
        
        // Method 2: Right-click and save image
        const largeImage = await page.locator('img').filter({ 
            has: page.locator('css=img').filter({ hasNot: page.locator('[data-src]') }) 
        }).first();
        
        await largeImage.click({ button: 'right' });
        await page.waitForTimeout(500);
        
        // Try to click "Save image as..." option
        const saveOption = await page.locator('text="Save image as"').or(page.locator('text="Save Image As"'));
        if (await saveOption.isVisible({ timeout: 2000 })) {
            await saveOption.click();
            console.log('✅ Save dialog opened (manual save required in non-headless mode)');
        }
        
        // Take a final screenshot
        const screenshotPath = path.join(process.cwd(), 'downloads', 'final_result.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`📸 Screenshot saved to: ${screenshotPath}`);
        
    } catch (error) {
        console.error('💥 Error:', error);
        throw error;
        
    } finally {
        if (browser) {
            console.log('\n🔚 Closing browser...');
            await browser.close();
        }
    }
}

// Run the appropriate function based on command line arguments
if (require.main === module) {
    const args = process.argv.slice(2);
    const mode = args[0] || 'webbuddy';
    
    console.log('=====================================');
    console.log('   Semantest Playwright Integration');
    console.log('=====================================\n');
    
    // Create downloads directory
    const downloadsDir = path.join(process.cwd(), 'downloads');
    if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
    }
    
    if (mode === 'direct') {
        downloadDirectlyWithPlaywright()
            .then(() => {
                console.log('\n✨ Direct download completed!');
                process.exit(0);
            })
            .catch((error) => {
                console.error('\n💀 Direct download failed:', error.message);
                process.exit(1);
            });
    } else {
        searchAndDownloadWithPlaywright()
            .then(() => {
                console.log('\n✨ Web-Buddy download completed!');
                process.exit(0);
            })
            .catch((error) => {
                console.error('\n💀 Web-Buddy download failed:', error.message);
                process.exit(1);
            });
    }
}

// Export functions
export {
    searchAndDownloadWithPlaywright,
    downloadDirectlyWithPlaywright,
    launchBrowserWithExtension,
    searchGoogleImages,
    extractImageElements
};