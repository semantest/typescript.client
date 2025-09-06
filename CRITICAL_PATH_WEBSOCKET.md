# 🔴 CRITICAL PATH: WebSocket Bidirectional Implementation

**Owner**: Fran (Backend Engineer)  
**Priority**: CRITICAL - Current Bottleneck  
**Carlos**: Coordinating immediate support

## 🚨 Current Status

### ✅ What's Working
- **Server**: `ws://localhost:8081/ws` READY
- **Wences**: MutationObserver COMPLETE
- **Elena**: CLI nearly complete

### 🔴 What's Needed NOW
- **Extension WebSocket Client**: Not connected to server
- **Bidirectional Communication**: Server ↔ Extension

## 🎯 Fran's Immediate Tasks

### 1. Extension WebSocket Client Implementation

```typescript
// src/extension/websocket-client.ts
class SemantestWebSocketClient {
  private ws: WebSocket;
  private reconnectAttempts = 0;
  
  constructor(private url: string = 'ws://localhost:8081/ws') {}
  
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('✅ SEMANTEST WebSocket connected');
        this.reconnectAttempts = 0;
        resolve();
      };
      
      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleServerMessage(message);
      };
      
      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.reconnect();
      };
      
      this.ws.onclose = () => {
        console.log('🔌 WebSocket closed');
        this.reconnect();
      };
    });
  }
  
  private handleServerMessage(message: any) {
    console.log('📨 Server message:', message);
    
    switch(message.type) {
      case 'semantest.execute':
        // Trigger Wences's MutationObserver
        window.postMessage({
          type: 'SEMANTEST_EXECUTE',
          payload: message.payload
        }, '*');
        break;
        
      case 'semantest.query':
        // Get current state from extension
        const state = this.getCurrentState();
        this.send('semantest.state', state);
        break;
    }
  }
  
  send(type: string, payload: any) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type,
        payload,
        timestamp: new Date().toISOString()
      }));
    }
  }
  
  private reconnect() {
    if (this.reconnectAttempts < 5) {
      setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`🔄 Reconnecting... (${this.reconnectAttempts}/5)`);
        this.connect();
      }, 1000 * this.reconnectAttempts);
    }
  }
  
  private getCurrentState() {
    // Get state from Wences's detector
    return {
      idle: document.querySelector('#prompt-textarea:not([disabled])') !== null,
      busy: document.querySelector('.result-streaming') !== null
    };
  }
}

// Initialize on extension load
const wsClient = new SemantestWebSocketClient();
wsClient.connect();

// Export for other modules
export { wsClient };
```

### 2. Server Handler Updates

```typescript
// Ensure server handles bidirectional messages
wss.on('connection', (ws) => {
  console.log('✅ Client connected');
  
  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    
    switch(message.type) {
      case 'semantest.idle.detected':
        // Notify CLI that we're ready
        broadcastToClients('ready');
        break;
        
      case 'semantest.response.captured':
        // Send response back to CLI
        broadcastToClients('response', message.payload);
        break;
    }
  });
  
  // Send heartbeat
  const heartbeat = setInterval(() => {
    ws.send(JSON.stringify({ type: 'ping' }));
  }, 30000);
  
  ws.on('close', () => {
    clearInterval(heartbeat);
  });
});
```

## 📊 Integration Flow with WebSocket

```
Elena (CLI)          Fran (Server)         Wences (Extension)
     |                    |                        |
     | --command-->       |                        |
     |                    | --WebSocket-->         |
     |                    |                        |
     |                    |              [MutationObserver]
     |                    |                        |
     |                    | <--state update--      |
     |                    |                        |
     | <--response--      |                        |
```

## 🚀 Quick Implementation Steps

1. **Copy the WebSocket client code above**
2. **Add to extension manifest.json**:
```json
{
  "content_scripts": [{
    "matches": ["https://chat.openai.com/*"],
    "js": ["websocket-client.js", "content-script.js"]
  }]
}
```

3. **Test connection**:
```bash
# Start server
npm run server

# Check WebSocket
wscat -c ws://localhost:8081/ws
```

4. **Commit**:
```bash
git commit -m "feat: 🚀 add WebSocket bidirectional communication"
```

## ⏱️ Timeline

**CRITICAL**: Need this working in next 30 minutes!

1. **0-10 min**: Copy and implement WebSocket client
2. **10-20 min**: Test connection with server
3. **20-30 min**: Integrate with Wences's MutationObserver

## 🆘 Support Available

**Carlos**: Coordinating integration points
**Wences**: MutationObserver ready to receive events
**Elena**: CLI ready to send commands

## 💡 Quick Debug Commands

```bash
# Test WebSocket server
curl -i -N -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Key: SGVsbG8sIHdvcmxkIQ==" \
  -H "Sec-WebSocket-Version: 13" \
  http://localhost:8081/ws

# Monitor WebSocket traffic
websocat ws://localhost:8081/ws

# Chrome DevTools Console
new WebSocket('ws://localhost:8081/ws')
```

---

**Fran: You're the critical path! WebSocket bidirectional is the last piece!** 🚀