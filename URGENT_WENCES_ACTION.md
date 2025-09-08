# 🚨 URGENT: Wences - Connect Extension to WebSocket NOW!

**Status**: BLOCKED on Extension→WebSocket connection  
**Port**: 8081 (CONFIRMED)  
**Time**: CRITICAL - Needed NOW!

## ✅ What's Working
- CLI → Server: ✅ WORKING
- Server WebSocket: ✅ RUNNING on port 8081
- MutationObserver: ✅ WORKING

## ❌ What's Missing
- Extension → WebSocket: ❌ NOT CONNECTED

## 🎯 IMMEDIATE ACTION (Copy & Paste)

### Step 1: Add to your extension's content script

```javascript
// COPY THIS ENTIRE BLOCK TO YOUR CONTENT SCRIPT
// semantest-websocket.js

(function() {
  console.log('🚀 SEMANTEST: Initializing WebSocket connection...');
  
  let ws = null;
  let reconnectAttempts = 0;
  
  function connect() {
    try {
      ws = new WebSocket('ws://localhost:8081/ws');
      
      ws.onopen = function() {
        console.log('✅ SEMANTEST: Connected to server!');
        reconnectAttempts = 0;
        
        // Send initial handshake
        ws.send(JSON.stringify({
          type: 'extension.connected',
          timestamp: new Date().toISOString()
        }));
        
        // Notify page we're connected
        window.postMessage({
          type: 'SEMANTEST_CONNECTED',
          status: 'connected'
        }, '*');
      };
      
      ws.onmessage = function(event) {
        console.log('📨 SEMANTEST: Message from server:', event.data);
        const message = JSON.parse(event.data);
        
        // Handle different message types
        if (message.type === 'execute') {
          executeInChatGPT(message.payload);
        }
      };
      
      ws.onerror = function(error) {
        console.error('❌ SEMANTEST: WebSocket error:', error);
      };
      
      ws.onclose = function() {
        console.log('🔌 SEMANTEST: Disconnected, reconnecting...');
        setTimeout(reconnect, 1000);
      };
      
    } catch (error) {
      console.error('❌ SEMANTEST: Failed to connect:', error);
      setTimeout(reconnect, 1000);
    }
  }
  
  function reconnect() {
    if (reconnectAttempts < 5) {
      reconnectAttempts++;
      console.log(`🔄 Reconnecting... (${reconnectAttempts}/5)`);
      connect();
    }
  }
  
  function executeInChatGPT(payload) {
    console.log('🎯 Executing in ChatGPT:', payload);
    
    const textarea = document.querySelector('#prompt-textarea');
    if (textarea) {
      textarea.value = payload.text || '';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Click submit
      const button = document.querySelector('button[type="submit"]');
      if (button) button.click();
    }
  }
  
  // Connect immediately
  connect();
  
  // Make available globally
  window.semantestWS = {
    send: function(data) {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    },
    getStatus: function() {
      return ws ? ws.readyState : 'Not initialized';
    }
  };
})();
```

### Step 2: Add to manifest.json

```json
{
  "content_scripts": [{
    "matches": ["https://chat.openai.com/*"],
    "js": [
      "semantest-websocket.js",  // ADD THIS
      "your-other-scripts.js"
    ]
  }]
}
```

### Step 3: Test in Chrome DevTools

```javascript
// After reloading extension, paste in ChatGPT console:
semantestWS.getStatus();  // Should return 1 (OPEN)
```

## 🧪 TDD Approach

```javascript
// 🔴 RED: Test first (add to your test file)
describe('WebSocket Connection', () => {
  test('connects to port 8081', () => {
    const ws = new WebSocket('ws://localhost:8081/ws');
    expect(ws.url).toBe('ws://localhost:8081/ws');
  });
});

// ✅ GREEN: Make it work (implementation above)

// 🔄 REFACTOR: Clean up later
```

## 📋 Verification Checklist

- [ ] Copy code to extension
- [ ] Update manifest.json
- [ ] Reload extension in Chrome
- [ ] Open ChatGPT
- [ ] Check console for "✅ SEMANTEST: Connected to server!"
- [ ] Test with `semantestWS.getStatus()`

## 🚀 Quick Commands

```bash
# Commit your changes
git add .
git commit -m "feat: ✅ connect extension to WebSocket port 8081"

# Test the connection
# In Chrome console on ChatGPT:
new WebSocket('ws://localhost:8081/ws')
```

## ⏰ Timeline

**NOW**: Copy the code  
**+2 min**: Update manifest  
**+3 min**: Reload extension  
**+4 min**: Test connection  
**+5 min**: WORKING!  

---

**Wences: This is the LAST PIECE! Just copy, paste, and reload!** 🚀