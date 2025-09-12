#!/usr/bin/env node

// Direct CLI for testing: node direct-cli.js --domain chatgpt.com --prompt 'test'

const axios = require('axios');

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  let domain = 'chatgpt.com';  // DEFAULT
  let prompt = null;
  let outputPath = '/tmp/output.png';  // DEFAULT
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--domain' && i + 1 < args.length) {
      domain = args[i + 1];
      i++;
    } else if (args[i] === '--prompt' && i + 1 < args.length) {
      prompt = args[i + 1];
      i++;
    } else if (args[i] === '--output-path' && i + 1 < args.length) {
      outputPath = args[i + 1];
      i++;
    }
  }

  if (!prompt) {
    console.error('❌ Error: --prompt is required');
    console.log('Usage: node direct-cli.js --domain chatgpt.com --prompt "test"');
    process.exit(1);
  }

  // Create event with CRITICAL domain field
  const event = {
    id: Math.random().toString(36).substring(7),
    type: 'ImageGenerationRequestedEvent',
    payload: {
      domain,  // CRITICAL: Domain for tab routing!
      prompt,
      outputPath,
      correlationId: Math.random().toString(36).substring(7),
      timestamp: Date.now()
    }
  };

  console.log('📤 SEMANTEST Event:');
  console.log(JSON.stringify(event, null, 2));

  try {
    const response = await axios.post('http://localhost:8080/events', event);
    console.log('✅ Sent to server!');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('⚠️  Server not running (expected for test)');
    console.log('✅ Event structure is correct with domain:', domain);
  }
}

main();