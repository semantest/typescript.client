#!/usr/bin/env node
/*
                        Semantest - Google Images Downloader
                        Implementation for searching and downloading images

    This script searches for "green house" on Google Images and downloads 
    one of the matching images locally using the Web-Buddy framework.
*/

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
    timeout: 60000, // 60 seconds for image downloads
    retries: 3
};

// Create client instance
const client = new EventDrivenWebBuddyClient(config);

/**
 * Main function to search and download green house image
 */
async function searchAndDownloadGreenHouse() {
    console.log('🚀 Starting Google Images search for "green house"...\n');
    
    try {
        // Step 1: Check connectivity
        console.log('📡 Checking server connectivity...');
        const pingResult = await client.ping();
        if (!pingResult.success) {
            throw new Error('Cannot connect to Web-Buddy server. Make sure it\'s running on ' + config.baseUrl);
        }
        console.log(`✅ Connected to server (latency: ${pingResult.latency}ms)\n`);

        // Step 2: Navigate to Google Images
        console.log('🌐 Opening Google Images...');
        // In a real implementation, we would use Playwright/Puppeteer to navigate
        // For this example, we'll assume the extension is already on Google Images
        const tabId = 1; // This would be retrieved from the browser automation
        
        // Step 3: Search for "green house"
        const searchQuery = "green house";
        console.log(`🔍 Searching for "${searchQuery}"...\n`);
        
        // Step 4: Download the first suitable image
        // In practice, we would:
        // 1. Use Playwright/Puppeteer to navigate to images.google.com
        // 2. Enter the search query
        // 3. Wait for results to load
        // 4. Extract image elements from the DOM
        // 5. Select a suitable image to download
        
        // For this example, we'll simulate an image element
        const simulatedImageElement = {
            src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ...', // Google Images thumbnail
            alt: 'Beautiful green house with garden',
            title: 'Green House',
            width: 300,
            height: 200
        };
        
        console.log('📥 Attempting to download image...');
        console.log(`   Source: ${simulatedImageElement.src}`);
        console.log(`   Alt text: ${simulatedImageElement.alt}\n`);
        
        // Request the download
        const downloadResult = await client.requestGoogleImageDownload(
            config.extensionId,
            tabId,
            simulatedImageElement,
            {
                searchQuery: searchQuery,
                filename: 'green_house_download'
            }
        );
        
        // Handle the result
        if (downloadResult instanceof GoogleImageDownloadCompleted) {
            console.log('✅ Image downloaded successfully!');
            console.log(`   Download ID: ${downloadResult.downloadId}`);
            console.log(`   Filename: ${downloadResult.filename}`);
            console.log(`   Path: ${downloadResult.filepath}`);
            console.log(`   Original URL: ${downloadResult.originalUrl}`);
            console.log(`   High-res URL: ${downloadResult.highResUrl}`);
            console.log(`   File size: ${downloadResult.metadata.fileSize} bytes`);
            console.log(`   Dimensions: ${downloadResult.metadata.width}x${downloadResult.metadata.height}`);
            console.log(`   Format: ${downloadResult.metadata.format}\n`);
            
            // Create a downloads directory if it doesn't exist
            const downloadsDir = path.join(process.cwd(), 'downloads');
            if (!fs.existsSync(downloadsDir)) {
                fs.mkdirSync(downloadsDir, { recursive: true });
            }
            
            // Log download info to a file
            const logFile = path.join(downloadsDir, 'download_log.json');
            const logEntry = {
                timestamp: new Date().toISOString(),
                searchQuery: searchQuery,
                downloadId: downloadResult.downloadId,
                filename: downloadResult.filename,
                filepath: downloadResult.filepath,
                originalUrl: downloadResult.originalUrl,
                highResUrl: downloadResult.highResUrl,
                metadata: downloadResult.metadata
            };
            
            fs.writeFileSync(logFile, JSON.stringify(logEntry, null, 2));
            console.log(`📝 Download info saved to: ${logFile}`);
            
            return downloadResult;
            
        } else if (downloadResult instanceof GoogleImageDownloadFailed) {
            console.error('❌ Image download failed!');
            console.error(`   Reason: ${downloadResult.reason}`);
            console.error(`   Original URL: ${downloadResult.originalUrl}\n`);
            throw new Error(downloadResult.reason);
        }
        
    } catch (error) {
        console.error('💥 Error occurred:', error);
        throw error;
    }
}

/**
 * Alternative: Download multiple green house images
 */
async function downloadMultipleGreenHouseImages() {
    console.log('🚀 Downloading multiple green house images...\n');
    
    try {
        const tabId = 1;
        
        // Simulate multiple image elements from search results
        const images = [
            {
                element: {
                    src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:1...',
                    alt: 'Modern green house design',
                    width: 400,
                    height: 300
                },
                searchQuery: 'green house',
                filename: 'green_house_modern'
            },
            {
                element: {
                    src: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:2...',
                    alt: 'Traditional green house with plants',
                    width: 350,
                    height: 250
                },
                searchQuery: 'green house',
                filename: 'green_house_traditional'
            },
            {
                element: {
                    src: 'https://encrypted-tbn2.gstatic.com/images?q=tbn:3...',
                    alt: 'Small backyard greenhouse',
                    width: 300,
                    height: 400
                },
                searchQuery: 'green house',
                filename: 'green_house_backyard'
            }
        ];
        
        console.log(`📥 Downloading ${images.length} images...\n`);
        
        const results = await client.downloadMultipleGoogleImages(
            config.extensionId,
            tabId,
            images,
            {
                parallel: false, // Download sequentially
                delayBetween: 2000 // 2 second delay between downloads
            }
        );
        
        // Process results
        let successCount = 0;
        let failCount = 0;
        
        results.forEach((result, index) => {
            if (result instanceof GoogleImageDownloadCompleted) {
                successCount++;
                console.log(`✅ Image ${index + 1}: Downloaded as ${result.filename}`);
            } else {
                failCount++;
                console.log(`❌ Image ${index + 1}: Failed - ${result.reason}`);
            }
        });
        
        console.log(`\n📊 Summary: ${successCount} succeeded, ${failCount} failed`);
        
        return results;
        
    } catch (error) {
        console.error('💥 Error in batch download:', error);
        throw error;
    }
}

// Run the main function if this file is executed directly
if (require.main === module) {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const command = args[0] || 'single';
    
    console.log('=====================================');
    console.log('   Semantest Google Images Downloader');
    console.log('=====================================\n');
    
    if (command === 'multiple') {
        downloadMultipleGreenHouseImages()
            .then(() => {
                console.log('\n✨ Batch download completed!');
                process.exit(0);
            })
            .catch((error) => {
                console.error('\n💀 Batch download failed:', error.message);
                process.exit(1);
            });
    } else {
        searchAndDownloadGreenHouse()
            .then(() => {
                console.log('\n✨ Download completed successfully!');
                process.exit(0);
            })
            .catch((error) => {
                console.error('\n💀 Download failed:', error.message);
                process.exit(1);
            });
    }
}

// Export functions for use in other scripts
export {
    searchAndDownloadGreenHouse,
    downloadMultipleGreenHouseImages
};