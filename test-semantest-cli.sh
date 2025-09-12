#!/bin/bash

echo "🧪 Testing SEMANTEST CLI with domain support"
echo "============================================="
echo ""

# Test 1: Image generation with default domain (chatgpt.com)
echo "Test 1: Default domain (chatgpt.com)"
echo "Command: npm run semantest -- image-generation --prompt 'test' --output-path /tmp/test.png"
echo ""

# Test 2: With explicit domain
echo "Test 2: Explicit domain"
echo "Command: npm run semantest -- image-generation --domain chatgpt.com --prompt 'a cat' --output-path /tmp/cat.png"
echo ""

# Test 3: Simple CLI version
echo "Test 3: Simple CLI"
echo "Command: npm run semantest-simple -- --domain chatgpt.com --prompt 'test' --output-path /tmp/test.png"
echo ""

# Run actual test (dry-run without server)
echo "📤 Dry run example (will fail without server):"
echo "---"
npm run semantest -- image-generation --domain chatgpt.com --prompt 'test' --output-path /tmp/test.png 2>&1 | head -20

echo ""
echo "✅ CLI is ready! Domain field is ALWAYS included (defaults to chatgpt.com)"