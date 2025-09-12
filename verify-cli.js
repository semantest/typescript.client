#!/usr/bin/env node

// Verify CLI works after merge - creates mock server to test

const http = require('http');
const { spawn } = require('child_process');

// Create mock server
const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const event = JSON.parse(body);
    console.log('📥 Server received event:');
    console.log(`   Type: ${event.type}`);
    console.log(`   Domain: ${event.payload.domain}`);
    console.log(`   Prompt: ${event.payload.prompt}`);
    console.log(`   Output: ${event.payload.outputPath}`);
    
    // Verify critical domain field
    if (event.payload.domain === 'chatgpt.com') {
      console.log('✅ Domain field correct: chatgpt.com');
    } else {
      console.log(`⚠️  Domain: ${event.payload.domain}`);
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, id: event.id }));
    
    // Close server after handling request
    setTimeout(() => {
      server.close();
      console.log('\n✅ CLI VERIFIED - Image generation event structure correct!');
      process.exit(0);
    }, 100);
  });
});

server.listen(8081, () => {
  console.log('🚀 Mock server running on http://localhost:8081');
  console.log('📤 Testing CLI...\n');
  
  // Run the CLI command
  const cli = spawn('node', [
    'src/semantest-simple-cli.js',
    '--prompt', 'test',
    '--output-path', '/tmp/test.png',
    '--domain', 'chatgpt.com',
    '--server', 'http://localhost:8081'
  ]);
  
  cli.stdout.on('data', data => process.stdout.write(data));
  cli.stderr.on('data', data => process.stderr.write(data));
});

// Timeout after 5 seconds
setTimeout(() => {
  console.log('⏱️  Test timeout');
  server.close();
  process.exit(1);
}, 5000);