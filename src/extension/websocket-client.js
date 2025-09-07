/**
 * SEMANTEST WebSocket Client for Chrome Extension
 * Owner: Wences (Browser Specialist)
 * Coordinator: Carlos (Integration)
 * 
 * QUICK INTEGRATION:
 * 1. Copy this file to extension folder
 * 2. Add to manifest.json content_scripts
 * 3. Test with server at ws://localhost:8081/ws
 */

class SemantestWebSocketClient {
  constructor() {
    this.url = 'ws://localhost:8084/ws';  // Updated to match server port!
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.isConnected = false;
    
    // Auto-connect on creation
    this.connect();
    
    // Listen for messages from content script
    this.setupMessageListener();
  }
  
  connect() {
    console.log('🔌 SEMANTEST: Connecting to WebSocket server...');
    
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('✅ SEMANTEST: WebSocket connected to server!');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Notify content script we're connected
        this.notifyContentScript('connected');
        
        // Send initial handshake
        this.send('semantest.extension.ready', {
          version: '2.0.0',
          capabilities: ['idle-detection', 'message-injection', 'response-capture']
        });
      };
      
      this.ws.onmessage = (event) => {
        console.log('📨 SEMANTEST: Server message:', event.data);
        const message = JSON.parse(event.data);
        this.handleServerMessage(message);
      };
      
      this.ws.onerror = (error) => {
        console.error('❌ SEMANTEST: WebSocket error:', error);
        this.isConnected = false;
      };
      
      this.ws.onclose = () => {
        console.log('🔌 SEMANTEST: WebSocket disconnected');
        this.isConnected = false;
        this.reconnect();
      };
      
    } catch (error) {
      console.error('❌ SEMANTEST: Failed to create WebSocket:', error);
      this.reconnect();
    }
  }
  
  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
      
      console.log(`🔄 SEMANTEST: Reconnecting in ${delay}ms... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('❌ SEMANTEST: Max reconnection attempts reached');
      this.notifyContentScript('connection-failed');
    }
  }
  
  handleServerMessage(message) {
    switch(message.type) {
      case 'semantest.execute':
        // Server wants us to execute something in ChatGPT
        console.log('🎯 SEMANTEST: Execute command:', message.payload);
        this.executeInChatGPT(message.payload);
        break;
        
      case 'semantest.query.state':
        // Server wants current state
        console.log('🔍 SEMANTEST: Server requesting state');
        this.sendCurrentState();
        break;
        
      case 'ping':
        // Heartbeat from server
        this.send('pong', {});
        break;
        
      default:
        console.log('❓ SEMANTEST: Unknown message type:', message.type);
    }
  }
  
  executeInChatGPT(payload) {
    // Send to content script for execution
    window.postMessage({
      source: 'semantest-websocket',
      type: 'EXECUTE_IN_CHATGPT',
      payload: payload
    }, '*');
  }
  
  sendCurrentState() {
    // Get state from DOM (Wences's MutationObserver can provide this)
    const textarea = document.querySelector('#prompt-textarea');
    const isIdle = textarea && !textarea.disabled;
    const isBusy = document.querySelector('.result-streaming') !== null;
    
    this.send('semantest.state.update', {
      idle: isIdle,
      busy: isBusy,
      textarea: {
        exists: !!textarea,
        disabled: textarea ? textarea.disabled : null,
        value: textarea ? textarea.value : ''
      },
      timestamp: new Date().toISOString()
    });
  }
  
  setupMessageListener() {
    // Listen for messages from content script
    window.addEventListener('message', (event) => {
      // Only accept messages from our own window
      if (event.source !== window) return;
      
      // Check if it's a SEMANTEST message
      if (event.data.source === 'semantest-content') {
        console.log('📤 SEMANTEST: Content script message:', event.data);
        
        switch(event.data.type) {
          case 'IDLE_DETECTED':
            this.send('semantest.idle.detected', event.data.payload);
            break;
            
          case 'BUSY_DETECTED':
            this.send('semantest.busy.detected', event.data.payload);
            break;
            
          case 'RESPONSE_CAPTURED':
            this.send('semantest.response.captured', event.data.payload);
            break;
            
          case 'ERROR_OCCURRED':
            this.send('semantest.error', event.data.payload);
            break;
        }
      }
    });
  }
  
  notifyContentScript(status) {
    window.postMessage({
      source: 'semantest-websocket',
      type: 'WEBSOCKET_STATUS',
      status: status
    }, '*');
  }
  
  send(type, payload) {
    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type: type,
        payload: payload,
        timestamp: new Date().toISOString(),
        source: 'extension'
      };
      
      console.log('📤 SEMANTEST: Sending to server:', message);
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ SEMANTEST: Cannot send, WebSocket not connected');
    }
  }
  
  // Public methods for content script
  sendMessage(text) {
    this.send('semantest.message.send', { text });
  }
  
  getConnectionStatus() {
    return this.isConnected;
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Initialize WebSocket client when content script loads
console.log('🚀 SEMANTEST: Initializing WebSocket client...');
const semantestWS = new SemantestWebSocketClient();

// Make it available globally for debugging
window.semantestWS = semantestWS;

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SemantestWebSocketClient, semantestWS };
}