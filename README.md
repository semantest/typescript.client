# SEMANTEST TypeScript Client

## 🚀 Simple Yet Powerful Browser Automation

SEMANTEST follows the "Badass Users" philosophy - progressive disclosure that makes you awesome at browser automation.

## Quick Start (Beginner)

```bash
# Install dependencies
npm install

# Start the server
npm run server

# Generate an image (simplest form)
semantest generate "a beautiful sunset" --output sunset.png
```

## Three Levels of Mastery

### 🌱 Beginner - Just Works
```bash
# Basic image generation
semantest generate "cute cat" --output cat.png

# Check if everything is working
semantest status

# Fix common problems
semantest doctor
```

### 🚀 Intermediate - More Control
```bash
# See what's happening
semantest generate "robot chef" --output robot.png --verbose

# Custom timeout for complex prompts
semantest generate "detailed artwork" --output art.png --timeout 600

# Monitor events in real-time
semantest events --follow
```

### 🎯 Expert - Full Power
```bash
# Queue management with priority
semantest generate "urgent task" --output result.png \
  --queue-strategy priority \
  --correlation-id task-123

# Process event stream with jq
semantest events --follow --format json | jq '.payload | select(.status == "completed")'

# Debug mode with full trace
SEMANTEST_DEBUG=* semantest generate "test" --output test.png --trace
```

## Error Messages That Teach

Instead of cryptic errors, SEMANTEST teaches you:

```
❌ Cannot connect to server
   The SEMANTEST server at localhost:8080 is not responding.

💡 How to fix:
   Start the server first with: npm run server

📚 Learn more:
   The server manages communication between the CLI and browser extension.

Next steps:
  1. Start the server: npm run server
  2. Check server status: semantest status
  3. Try your command again
```

## Visual Progress Feedback

Watch your operations flow through the pipeline:

```
Pipeline stages:
🔍 validate → 📤 send → 📋 queue → 🔀 route → 🌐 execute → 🎨 generate → 💾 save

Current status:
🔍 Validating request... ✓
📤 Sending to server... ✓
📋 Queued for processing... ✓
🔀 Routing to browser... [in progress]
```

## Smart Defaults, Full Control

SEMANTEST works out of the box with smart defaults, but gives you control when you need it:

```bash
# Simplest - uses all defaults
semantest generate "sunset"

# With options - override what you need
semantest generate "sunset" --output ~/images/sunset.png --timeout 60

# Full control - expert mode
semantest generate "sunset" \
  --server http://custom:8080 \
  --queue-strategy priority \
  --correlation-id abc-123 \
  --verbose --trace
```

## Common Workflows

### First-Time Setup
```bash
semantest doctor          # Diagnose your setup
npm run server           # Start the server
semantest status         # Verify everything works
semantest generate "test" # Your first generation!
```

### Debugging Connection Issues
```bash
semantest doctor         # See what's wrong
semantest status --verbose # Detailed status
semantest events --follow  # Watch events flow
```

### Batch Processing
```bash
# Queue multiple tasks
for prompt in "sunset" "mountain" "ocean"; do
  semantest generate "$prompt" --output "${prompt}.png"
done
```

## Architecture

```
┌─────────┐     HTTP      ┌──────────┐     WebSocket    ┌──────────┐
│   CLI   │────────────▶  │  Server  │ ◀──────────────▶ │Extension │
└─────────┘   (Events)    └──────────┘                  └──────────┘
     │                         │                              │
     │                         │                              │
     ▼                         ▼                              ▼
  User Input              Event Router                   Browser Tab
```

## Learn More

```bash
semantest help              # Basic help
semantest help --advanced   # Advanced features
semantest help --expert     # Expert mode
```

## Contributing

We follow the "Badass Users" philosophy:
1. Make the simple things simple
2. Make the complex things possible
3. Teach through the interface
4. Celebrate user success

## License

GPLv3 - See LICENSE file

---
Part of the Semantest ecosystem.
Documentation: https://github.com/semantest/docs
