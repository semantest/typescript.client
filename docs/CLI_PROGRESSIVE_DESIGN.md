# SEMANTEST CLI Progressive Disclosure Design

## 🎯 Design Philosophy: Badass Users Approach

Making users successful at every level while revealing system complexity progressively.

## 📊 User Journey Levels

### Level 0: First Contact (5 seconds to success)
```bash
# Simplest possible command - smart defaults handle everything
semantest generate "a sunset over mountains"
# → Automatically outputs to ./generated/sunset-[timestamp].png
# → Shows progress: Connecting... → Sending... → Processing... → Saved!
```

### Level 1: Beginner (Basic customization)
```bash
# Specify output location
semantest generate "a cat playing piano" --output cat.png

# See what happened
semantest status
# → Shows: Last generation took 3.2s, saved to cat.png

# Get help that actually helps
semantest help
# → Shows ONLY the essential commands with examples
```

### Level 2: Intermediate (Understanding the system)
```bash
# See the event flow happening
semantest generate "robot chef" --verbose
# → 📤 Sending ImageGenerationRequestedEvent to server...
# → 🔄 Server received, routing to WebSocket...
# → 🌐 Browser extension processing...
# → ✅ Image saved to ./robot-chef.png

# Control timing and retries
semantest generate "sunset" --timeout 60 --retry 3

# Use different services
semantest generate "ocean" --service dall-e
```

### Level 3: Advanced (Power user features)
```bash
# Queue management for batch operations
semantest queue add "prompt1.txt" --priority high
semantest queue add "prompt2.txt" --priority normal
semantest queue process --parallel 3

# Custom event routing
semantest generate "test" --route chatgpt.com --selector "#custom-input"

# Session management
semantest session start --name "art-project"
semantest generate "series of landscapes" --session art-project
semantest session export art-project --format json
```

### Level 4: Expert (Full event control)
```bash
# Direct event manipulation
semantest events send ImageGenerationRequestedEvent \
  --payload '{"prompt": "custom", "parameters": {...}}' \
  --trace

# Watch the event stream
semantest events watch --filter "type:Image*" --format json

# Debug mode showing internal state
semantest generate "test" --debug
# → Shows WebSocket frames, server responses, timing metrics

# Custom middleware injection
semantest middleware add rate-limiter --config limits.json
```

### Level 5: Developer (System internals)
```bash
# Full system introspection
semantest system status --detailed
# → Server health, WebSocket connections, queue depth, performance metrics

# Event replay and debugging
semantest debug replay-events events.log --breakpoint "error"

# Performance profiling
semantest perf profile "generate 'test'" --iterations 10
# → Latency percentiles, bottleneck analysis, optimization suggestions

# Direct WebSocket access
semantest ws connect --raw
> {"type": "CustomEvent", "payload": {...}}
```

## 🎓 Progressive Help System

### Context-Aware Help
```bash
# After an error
semantest generate "test"
# ❌ Connection failed: Server not responding on port 8080
# 💡 The server should be running. Start it with:
#    npm run server
# 📚 Learn more: semantest help server

# After success, suggest next steps
semantest generate "cat"
# ✅ Saved to ./cat.png
# 💡 Try: semantest generate "cat" --style photorealistic
```

### Layered Documentation
```bash
semantest help              # Essential commands only
semantest help --all         # Complete command list
semantest help generate      # Specific command details
semantest help --examples    # Real-world examples
semantest help --concepts    # Understand the event system
semantest tutorial           # Interactive learning mode
```

## 🔔 Smart Error Messages

### Teaching Through Errors
```bash
# Wrong port
semantest generate "test" --server http://localhost:9999
# ❌ Cannot connect to server at http://localhost:9999
# 
# The SEMANTEST server listens on port 8080 by default.
# 
# → Check if server is running: semantest doctor
# → Start server: npm run server
# → Use different port: semantest config set server.port 9999
#
# Understanding the architecture:
# CLI → HTTP Server (8080) → WebSocket → Browser Extension

# Missing dependency
semantest generate "test"
# ❌ Browser extension not detected
#
# The SEMANTEST system needs three components:
# 1. ✅ CLI (you're using it)
# 2. ❌ Server (not running) 
# 3. ❌ Browser extension (not detected)
#
# Quick fix:
# 1. Start server: npm run server
# 2. Install extension: semantest install extension
# 3. Open target website: https://chatgpt.com
#
# Learn more: semantest tutorial architecture
```

## 📈 Progressive Complexity Indicators

### Visual Feedback Levels
```bash
# Beginner - Simple spinner
semantest generate "cat"
⠋ Generating...
✅ Done! Saved to cat.png

# Intermediate - Progress stages
semantest generate "cat" --verbose
[1/4] 📤 Sending request...
[2/4] 🔄 Server processing...
[3/4] 🌐 Browser generating...
[4/4] 💾 Saving image...
✅ Complete! (3.2s)

# Advanced - Full metrics
semantest generate "cat" --metrics
📊 Event Flow Metrics:
├─ CLI → Server: 12ms
├─ Server → WebSocket: 3ms
├─ WebSocket → Extension: 8ms
├─ Extension Processing: 2,841ms
├─ Extension → Server: 15ms
└─ Server → CLI: 10ms
Total: 2,889ms

# Expert - Event stream
semantest generate "cat" --trace
→ Event[ImageGenerationRequestedEvent] id:abc-123 timestamp:1634...
← Ack[Server] latency:15ms
→ Forward[WebSocket] channel:ws://localhost:8081
← Event[ImageGenerationStartedEvent] correlation:abc-123
← Event[ImageGenerationProgressEvent] progress:0.25
← Event[ImageGenerationProgressEvent] progress:0.50
← Event[ImageGenerationProgressEvent] progress:0.75
← Event[ImageGenerationCompletedEvent] path:./cat.png size:2.1MB
```

## 🛠️ Configuration Philosophy

### Smart Defaults with Override Capability
```yaml
# Default (hidden) configuration
defaults:
  server: http://localhost:8080
  output: ./generated/
  timeout: 30
  retry: 1
  format: png

# User configuration (progressive)
# ~/.semantest/config.yml

# Beginner - just the essentials
output: ~/my-images/

# Intermediate - common overrides  
server: http://my-server:8080
timeout: 60
retry: 3

# Advanced - full control
queuing:
  strategy: priority  # fifo, lifo, priority
  parallel: 3
  rate_limit: 10/min

events:
  trace: true
  persist: ./events.log
  
middleware:
  - rate-limiter
  - cache
  - metrics

# Expert - environment-specific
environments:
  dev:
    server: http://localhost:8080
    debug: true
  prod:
    server: https://api.semantest.com
    retry: 5
```

## 🎯 Learning Path Integration

### Built-in Tutorials
```bash
# Interactive tutorial
semantest tutorial
# → Welcome to SEMANTEST! Let's generate your first image.
# → Type: semantest generate "your prompt here"

# Concept tutorials
semantest learn events
# → Interactive visualization of event flow

semantest learn architecture  
# → ASCII diagram showing system components

semantest learn debugging
# → Common issues and how to diagnose them
```

### Achievement System (Subtle)
```bash
semantest stats
# 🏆 Your SEMANTEST Journey:
# ├─ First Image: ✅ (2 days ago)
# ├─ Batch Processing: ✅ (1 day ago)
# ├─ Custom Events: 🔒 (try: semantest events send)
# ├─ Debug Master: 🔒 (try: semantest --debug)
# └─ Total Generated: 42 images

# Power user discovery
# After using advanced features:
# 💡 You discovered event tracing! This unlocks:
#    - semantest events watch
#    - semantest debug replay
#    - semantest perf analyze
```

## 🔄 Feedback Loop Design

### Progressive Status Information
```bash
# Level 1: Simple
semantest status
# ✅ System operational
# Last generation: 2 minutes ago

# Level 2: Informative
semantest status --verbose
# System Status:
# ├─ Server: ✅ Running (uptime: 2h 15m)
# ├─ WebSocket: ✅ Connected (1 client)
# ├─ Extension: ✅ Active (chatgpt.com)
# └─ Queue: Empty

# Level 3: Diagnostic
semantest status --detailed
# Detailed System Status:
# 
# Server (http://localhost:8080):
#   PID: 12345
#   Memory: 84MB
#   CPU: 0.3%
#   Requests: 1,247 total (0 errors)
#   
# WebSocket (ws://localhost:8081):
#   Connections: 1 active
#   Messages: 2,494 sent, 2,494 received
#   Latency: avg 12ms, p99 45ms
#
# Extension:
#   Version: 1.2.3
#   Tab: chatgpt.com (active)
#   State: idle
#   Cache: 15 items (2.1MB)
```

## 🚀 Implementation Priorities

### Phase 1: Foundation (Simplicity)
- Basic `generate` command with smart defaults
- Clear error messages with next steps
- Simple help system

### Phase 2: Understanding (Visibility)
- --verbose flag showing event flow
- Status command
- Better progress indicators

### Phase 3: Power (Control)
- Queue management
- Session support
- Custom routing

### Phase 4: Mastery (Access)
- Event stream access
- Debug capabilities
- Performance profiling

### Phase 5: Innovation (Extension)
- Plugin system
- Custom middleware
- Scriptable workflows

## 📝 Key UX Principles

1. **Fast First Success**: 5 seconds from install to first image
2. **Progressive Disclosure**: Complexity available but not required
3. **Errors Are Teachers**: Every error explains the system
4. **Visible System Model**: Users can see how it works when they want
5. **Power When Needed**: Advanced features discoverable, not overwhelming
6. **Respectful Interface**: Assumes users want to understand, not be protected