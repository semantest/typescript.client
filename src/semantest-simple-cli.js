#!/usr/bin/env node

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

/**
 * SEMANTEST Simple CLI - Send ImageGenerationRequestedEvent
 * @param {string} domain - Target domain (e.g., 'chatgpt.com')
 * @param {string} prompt - The prompt for image generation
 * @param {string} outputPath - Path where image should be saved
 * @param {string} downloadFolder - Folder where image will be downloaded
 * @param {string} serverUrl - Server URL (default: http://localhost:8080)
 * @param {Object} options - Additional options (correlationId, timeout, etc.)
 */
async function sendEvent(domain, prompt, outputPath, downloadFolder, serverUrl = 'http://localhost:8080', options = {}) {
  const event = {
    id: uuidv4(),
    type: 'ImageGenerationRequestedEvent',
    eventType: 'ImageGenerationRequested',
    payload: {
      domain,  // CRITICAL: Must include domain for tab routing!
      prompt,
      outputPath,
      imagePath: outputPath,
      downloadFolder: downloadFolder || './images',
      correlationId: options.correlationId || uuidv4(),
      timestamp: Date.now(),
      ...(options.parameters && { parameters: options.parameters })
    }
  };

  console.log('📤 Sending SEMANTEST event:');
  console.log(`   Domain: ${domain}`);
  console.log(`   Prompt: ${prompt}`);
  console.log(`   Output: ${outputPath}`);
  console.log(`   Download Folder: ${downloadFolder || './images'}`);
  console.log(`   Server: ${serverUrl}`);
  if (options.correlationId) {
    console.log(`   Correlation ID: ${options.correlationId}`);
  }
  console.log('');

  try {
    const response = await axios.post(
      `${serverUrl}/events`,
      event,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: options.timeout || 30000
      }
    );

    console.log('✅ Event sent successfully!');
    console.log('📬 Response:', response.data);
    
    // Show pipeline status
    console.log('\n📊 Processing Pipeline:');
    console.log('   1. ✅ Event created and validated');
    console.log('   2. ✅ Sent to server successfully');
    console.log('   3. ⏳ Server routing to browser extension...');
    console.log('   4. ⏳ Extension processing request...');
    console.log('   5. ⏳ Image generation in progress...');
    console.log('   6. ⏳ Image download and save pending...');
    
    console.log(`\n💡 Track progress with correlation ID: ${event.payload.correlationId}`);
    console.log(`🖼️ Image will be saved to: ${outputPath}`);
    console.log(`📁 In download folder: ${downloadFolder || './images'}`);
    
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('❌ Server error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ Network error: No response from server');
    } else {
      console.error('❌ Error:', error.message);
    }
    throw error;
  }
}

/**
 * Main CLI handler
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  let domain = 'chatgpt.com';  // DEFAULT DOMAIN
  let prompt = null;
  let outputPath = null;
  let downloadFolder = './images';  // DEFAULT DOWNLOAD FOLDER
  let serverUrl = 'http://localhost:8080';
  let correlationId = null;
  let timeout = 30000;
  let parameters = {};
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--domain':
      case '-d':
        domain = args[++i];
        break;
      case '--prompt':
      case '-p':
        prompt = args[++i];
        break;
      case '--output-path':
      case '--output':
      case '-o':
        outputPath = args[++i];
        break;
      case '--download-folder':
      case '--folder':
      case '-f':
        downloadFolder = args[++i];
        break;
      case '--server':
      case '-s':
        serverUrl = args[++i];
        break;
      case '--correlation-id':
      case '--correlation':
      case '-c':
        correlationId = args[++i];
        break;
      case '--timeout':
      case '-t':
        timeout = parseInt(args[++i]) * 1000; // Convert to milliseconds
        break;
      case '--model':
      case '-m':
        parameters.model = args[++i];
        break;
      case '--help':
      case '-h':
        console.log(`
SEMANTEST Simple CLI - Send ImageGenerationRequestedEvent

Usage: node semantest-simple-cli.js [options]

Required:
  -p, --prompt <text>        Image generation prompt
  -o, --output-path <path>   Output path for image

Optional:
  -d, --domain <domain>      Target domain (default: chatgpt.com)
  -f, --folder <path>        Download folder (default: ./images)
  -s, --server <url>         Server URL (default: http://localhost:8080)
  -c, --correlation-id <id>  Custom correlation ID for tracking
  -t, --timeout <seconds>    Request timeout in seconds (default: 30)
  -m, --model <model>        AI model to use (dall-e-3, etc.)
  -h, --help                 Show this help

Examples:
  node semantest-simple-cli.js -p "a cat" -o cat.png
  node semantest-simple-cli.js -p "sunset" -o sunset.png -f /tmp/images
  node semantest-simple-cli.js -p "landscape" -o landscape.png --model dall-e-3
  node semantest-simple-cli.js -p "portrait" -o portrait.png -c my-request-123
`);
        process.exit(0);
    }
  }

  // Validate required arguments
  if (!prompt) {
    console.error('❌ Error: --prompt is required');
    process.exit(1);
  }
  
  if (!outputPath) {
    console.error('❌ Error: --output-path is required');
    process.exit(1);
  }

  // Send the event
  try {
    const options = {
      correlationId,
      timeout,
      parameters: Object.keys(parameters).length > 0 ? parameters : undefined
    };
    
    await sendEvent(domain, prompt, outputPath, downloadFolder, serverUrl, options);
    console.log('✨ Done! Check the browser extension for progress updates.');
    process.exit(0);
  } catch (error) {
    console.error('\n💔 Generation failed. Check server status and try again.');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for use as module
module.exports = { sendEvent };

// Add batch processing function
async function processBatch(batchFile) {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const batchData = JSON.parse(fs.readFileSync(batchFile, 'utf8'));
    
    console.log(`📦 Processing batch of ${batchData.requests.length} image requests...\n`);
    
    for (let i = 0; i < batchData.requests.length; i++) {
      const request = batchData.requests[i];
      const { domain = 'chatgpt.com', prompt, outputPath, downloadFolder = './images', ...options } = request;
      
      console.log(`🎨 [${i + 1}/${batchData.requests.length}] Processing: "${prompt}"`);
      
      try {
        await sendEvent(domain, prompt, outputPath, downloadFolder, batchData.serverUrl || 'http://localhost:8080', options);
        console.log(`✅ [${i + 1}/${batchData.requests.length}] Request sent successfully\n`);
        
        // Add delay between requests to avoid overwhelming the server
        if (i < batchData.requests.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`❌ [${i + 1}/${batchData.requests.length}] Failed: ${error.message}\n`);
      }
    }
    
    console.log('🎉 Batch processing completed!');
  } catch (error) {
    console.error('❌ Batch processing failed:', error.message);
    throw error;
  }
}

// Export batch function
module.exports.processBatch = processBatch;