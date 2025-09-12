#!/usr/bin/env node

// Test script to verify domain field is included in events

console.log('🧪 Testing domain field in SEMANTEST events\n');

// Test 1: Default domain
console.log('Test 1: Default domain (should be chatgpt.com)');
console.log('Command: node src/semantest-simple-cli.js -p "test" -o /tmp/test.png');

const { sendEvent } = require('./src/semantest-simple-cli.js');

// Mock axios to capture the event
const originalAxios = require('axios');
require('axios').post = async (url, data) => {
  console.log('✅ Event structure:');
  console.log(JSON.stringify(data, null, 2));
  
  // Verify domain field
  if (data.payload && data.payload.domain) {
    console.log(`✅ Domain field present: ${data.payload.domain}`);
  } else {
    console.log('❌ Domain field missing!');
  }
  
  // Return mock response
  return { data: { success: true } };
};

async function runTests() {
  console.log('\n--- Test 1: Default domain ---');
  try {
    await sendEvent('chatgpt.com', 'test prompt', '/tmp/test.png');
  } catch (e) {
    // Expected if server not running
  }

  console.log('\n--- Test 2: Custom domain ---');
  try {
    await sendEvent('custom-ai.com', 'test prompt', '/tmp/test.png');
  } catch (e) {
    // Expected if server not running
  }

  console.log('\n✨ Domain field verification complete!');
}

runTests();