#!/usr/bin/env node
/*
                        Semantest - Google Images Test Script
                        Quick test to verify the implementation

    This is a simplified test that demonstrates the Google Images
    download functionality without requiring the full infrastructure.
*/

import * as fs from 'fs';
import * as path from 'path';
import { chromium } from 'playwright';

async function testGoogleImagesSearch() {
    console.log('=====================================');
    console.log('   Semantest Google Images Test');
    console.log('=====================================\n');
    
    console.log('🧪 Running simplified test without Web-Buddy server...\n');
    
    const browser = await chromium.launch({
        headless: false, // Set to true for headless mode
        slowMo: 1000 // Slow down actions for visibility
    });
    
    try {
        const page = await browser.newPage();
        
        // Step 1: Navigate to Google Images
        console.log('📍 Step 1: Navigating to Google Images...');
        await page.goto('https://images.google.com');
        console.log('✅ Loaded Google Images\n');
        
        // Step 2: Search for "green house"
        console.log('📍 Step 2: Searching for "green house"...');
        const searchBox = await page.locator('input[name="q"]');
        await searchBox.fill('green house');
        await searchBox.press('Enter');
        
        // Wait for results
        await page.waitForSelector('img[data-src], img[src*="encrypted"]', {
            timeout: 10000
        });
        console.log('✅ Search results loaded\n');
        
        // Step 3: Extract image URLs
        console.log('📍 Step 3: Extracting image information...');
        const images = await page.evaluate(() => {
            const imgElements = document.querySelectorAll('img');
            const results = [];
            
            for (const img of Array.from(imgElements).slice(0, 5)) {
                if (img.width > 50 && img.height > 50) {
                    results.push({
                        src: img.src,
                        alt: img.alt || 'No description',
                        width: img.width,
                        height: img.height
                    });
                }
            }
            
            return results;
        });
        
        console.log(`✅ Found ${images.length} images\n`);
        
        // Step 4: Display results
        console.log('📍 Step 4: Image results:');
        images.forEach((img, index) => {
            console.log(`\n   Image ${index + 1}:`);
            console.log(`   - Alt: ${img.alt}`);
            console.log(`   - Size: ${img.width}x${img.height}`);
            console.log(`   - URL: ${img.src.substring(0, 80)}...`);
        });
        
        // Step 5: Save results
        const resultsDir = path.join(process.cwd(), 'downloads');
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }
        
        const resultsFile = path.join(resultsDir, 'test_results.json');
        fs.writeFileSync(resultsFile, JSON.stringify({
            timestamp: new Date().toISOString(),
            query: 'green house',
            images: images,
            totalFound: images.length
        }, null, 2));
        
        console.log(`\n📍 Step 5: Results saved to ${resultsFile}`);
        
        // Take screenshot
        const screenshotPath = path.join(resultsDir, 'test_screenshot.png');
        await page.screenshot({ path: screenshotPath, fullPage: false });
        console.log(`📸 Screenshot saved to ${screenshotPath}`);
        
        console.log('\n✨ Test completed successfully!');
        console.log('\n📋 Summary:');
        console.log(`   - Searched for: "green house"`);
        console.log(`   - Found: ${images.length} images`);
        console.log(`   - Results saved to: downloads/test_results.json`);
        console.log(`   - Screenshot saved to: downloads/test_screenshot.png`);
        
        console.log('\n💡 Next steps:');
        console.log('   1. Run "npm run download:playwright" for full Web-Buddy integration');
        console.log('   2. Check the downloads/ directory for results');
        console.log('   3. Install and configure the Web-Buddy extension for actual downloads');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    } finally {
        console.log('\n🔚 Closing browser...');
        await browser.close();
    }
}

// Run the test
if (require.main === module) {
    testGoogleImagesSearch()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

export { testGoogleImagesSearch };