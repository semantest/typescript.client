# SEMANTEST CLI - UX Design Guide

## Philosophy: Making Users Badass

Following Kathy Sierra's "Badass Users" principles, the SEMANTEST CLI is designed to:
1. **Progressive Disclosure**: Start simple, reveal complexity as needed
2. **Error as Teacher**: Every error message helps users learn
3. **Visible Progress**: Make async operations feel responsive
4. **Context-Aware Help**: Right information at the right time

## User Journey Levels

### 🌱 Beginner (First Day)
Users who just want to generate an image quickly.

```bash
# Simplest possible command
semantest generate "a sunset" --output sunset.png

# What they see:
🎨 Generating image...
   Prompt: "a sunset"
   Output: sunset.png

✅ Request sent successfully!

📊 Event Pipeline:
   1. ✅ Event created
   2. ✅ Sent to server
   3. ⏳ Server processing...
   4. ⏳ Browser extension handling...
   5. ⏳ Image generation in progress...

💡 Your image will be saved to: sunset.png
   Check the browser extension for real-time progress
```

### 🚀 Intermediate (First Week)
Users who understand the basics and want more control.

```bash
# Using short forms and additional options
semantest gen "complex artwork" -o art.png --timeout 600

# Monitoring events
semantest events --follow

# Checking system status
semantest status --verbose
```

### 🎯 Expert (Power User)
Users who need full control and automation capabilities.

```bash
# Advanced queue management
semantest generate "priority job" --output result.png \
  --queue-strategy priority \
  --correlation-id job-123

# Event stream processing
semantest events --follow --format json | jq '.payload | select(.status == "completed")'

# Debugging with full verbosity
SEMANTEST_DEBUG=* semantest generate "test" -o test.png --verbose
```

## Error Handling Examples

### Connection Error
Instead of: `Error: connect ECONNREFUSED 127.0.0.1:8080`

We show:
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

### Missing Browser Extension
Instead of: `WebSocket connection failed`

We show:
```
❌ Browser extension not responding
   The browser extension is not connected or not responding to events.

💡 How to fix:
   Check that:
   1. The extension is installed in your browser
   2. The extension is enabled
   3. You have a tab open on chatgpt.com (or your target domain)

📚 Learn more:
   The browser extension executes commands in web pages.

Next steps:
  1. Install the browser extension
  2. Open a browser tab on your target site
  3. Check connection: semantest status
```

## Progressive Disclosure in Help

### Basic Help (Default)
```bash
semantest help

🚀 SEMANTEST - Simple Yet Powerful Image Generation

Basic Usage:
  semantest generate "your prompt" --output image.png

Commands:
  generate      Generate an image from a prompt
  events        Monitor events in the system
  status        Check system status

Examples:
  semantest generate "sunset over mountains" --output sunset.png
  semantest gen "cute cat" -o cat.png              # Short form
  semantest status                                  # Check system

📚 Learn More:
  semantest help --advanced    # Show advanced options
  semantest help --expert      # Show expert features
```

### Advanced Help
```bash
semantest help --advanced

Advanced Options:

Server Configuration:
  --server <url>      Custom server URL (default: http://localhost:8080)
  --timeout <sec>     Request timeout in seconds (default: 30)
  --retries <n>       Number of retries on failure (default: 3)

Monitoring:
  semantest events --follow        # Watch events in real-time
  semantest status --verbose       # Detailed status information

📚 Expert Mode:
  semantest help --expert          # Unlock expert features
```

### Expert Help
```bash
semantest help --expert

Expert Features:

Queue Management:
  --queue-strategy <strategy>   Set queue strategy: fifo, lifo, priority
  --correlation-id <id>         Custom correlation ID for tracking

Event Processing:
  semantest events --follow --format json | jq ".payload | select(.status == \"completed\")"
  semantest events --follow --format json | tee events.log | jq .

Direct Event Sending:
  semantest send <EventType> --data '{"key": "value"}'
  semantest send CustomEvent --domain chatgpt.com --selector "textarea"

Debugging:
  SEMANTEST_DEBUG=* semantest generate "test" -o test.png
  semantest --verbose generate "test" --output test.png
```

## Feedback System Design

### Visual Progress Pipeline
```
Pipeline stages:
🔍 validate → 📤 send → 📋 queue → 🔀 route → 🌐 execute → 🎨 generate → 💾 save

Current status:
🔍 Validating request... ✓
📤 Sending to server... ✓
📋 Queued for processing... ✓
🔀 Routing to browser... [in progress]
```

### Live Updates for Long Operations
```
🎨 Generating image: Creating initial composition (15%)
█████░░░░░░░░░░░░░░░ 25% (Rendering background)
```

### Event Stream Visualization
```
📡 Live Event Stream

[14:23:01] ImageGenerationRequestedEvent #a3f2d8e1
[14:23:02] EventRoutedEvent #b4e3c9f2
[14:23:03] BrowserReceivedEvent #c5d4b8a3
[14:23:15] GenerationStartedEvent #d6c5a794
[14:23:45] GenerationProgressEvent #e7b69685 (50%)
[14:24:02] GenerationCompletedEvent #f8a58576
```

## Command Aliases and Shortcuts

To reduce typing and make the CLI more approachable:

```bash
# Long form
semantest generate "prompt" --output file.png --server http://localhost:8080

# Short form
semantest gen "prompt" -o file.png -s http://localhost:8080

# Ultra short (with config file)
st gen "prompt"  # If semantest is aliased to 'st'
```

## Configuration File Support

For power users who don't want to repeat options:

```yaml
# ~/.semantest/config.yml
server: http://localhost:8080
timeout: 60
output_dir: ~/images/
queue_strategy: priority
verbose: true
```

## Interactive Mode (Future Enhancement)

For users who prefer guided interaction:

```bash
semantest interactive

Welcome to SEMANTEST Interactive Mode!

What would you like to generate?
> a beautiful mountain landscape

Where should I save it? [generated-1234567.png]
> mountain.png

Generating your image...
[Progress bar visualization]

✨ Success! Image saved to mountain.png

Generate another? (y/n)
>
```

## Accessibility Features

1. **Color-blind friendly**: Don't rely only on color
2. **Screen reader compatible**: Clear text descriptions
3. **Keyboard navigation**: No mouse required
4. **Clear status indicators**: ✓ ✗ ⏳ symbols with text

## Performance Feedback

Show users that the system is working efficiently:

```bash
✅ Request processed in 1.2s
✅ Queued immediately (0 items ahead)
✅ Browser responded in 0.8s
⏳ Image generation: ~30s remaining
```

## Learning Path Integration

Help users level up naturally:

```bash
# After successful basic command
✨ Success! Your image was generated.

💡 Did you know? You can:
   • Monitor progress: semantest events --follow
   • Check system health: semantest status
   • Learn more: semantest help --advanced
```

## Error Recovery Suggestions

Always provide a path forward:

```bash
❌ Generation failed after 3 retries

Possible solutions:
  1. Try a simpler prompt
  2. Increase timeout: --timeout 600
  3. Check server load: semantest status
  4. View detailed logs: semantest events

💡 Most failures are temporary. Try again in a moment.
```

## Success Celebration

Make users feel accomplished:

```bash
✨ Image generated successfully!

📊 Statistics:
   • Total time: 32s
   • Queue wait: 0.5s
   • Generation: 31s
   • File size: 2.4 MB

🎉 You've generated 10 images today!
   Your most complex prompt: "a futuristic city with flying cars"
```

## Summary

The SEMANTEST CLI UX is designed to:
1. **Start simple**: One command to success
2. **Reveal gradually**: More features as users grow
3. **Teach through errors**: Every failure is a learning opportunity
4. **Show progress**: Never leave users wondering
5. **Celebrate success**: Make users feel awesome

By following these principles, we create a CLI that's both powerful and approachable, helping users become badass at browser automation.