/**
 * SEMANTEST Integration Bridge
 * Connects Wences's MutationObserver with WebSocket
 * Owner: Carlos (Integration) + Wences (Browser)
 */

// This bridges the MutationObserver with WebSocket
class SemantestIntegrationBridge {
  constructor() {
    console.log('🌉 SEMANTEST: Initializing integration bridge...');
    this.setupBridge();
  }
  
  setupBridge() {
    // Listen for MutationObserver events from Wences's detector
    window.addEventListener('message', (event) => {
      if (event.source !== window) return;
      
      // Handle events from MutationObserver
      if (event.data.source === 'semantest-detector') {
        console.log('🔍 Bridge: Detector event:', event.data);
        
        // Forward to WebSocket
        window.postMessage({
          source: 'semantest-content',
          type: event.data.type,
          payload: event.data.payload
        }, '*');
      }
      
      // Handle commands from WebSocket
      if (event.data.source === 'semantest-websocket') {
        console.log('📨 Bridge: WebSocket command:', event.data);
        
        if (event.data.type === 'EXECUTE_IN_CHATGPT') {
          this.executeCommand(event.data.payload);
        }
      }
    });
  }
  
  executeCommand(payload) {
    console.log('🎯 SEMANTEST: Executing command:', payload);
    
    // Get the textarea
    const textarea = document.querySelector('#prompt-textarea');
    if (!textarea) {
      console.error('❌ SEMANTEST: Textarea not found');
      return;
    }
    
    // Check if idle
    if (textarea.disabled) {
      console.warn('⚠️ SEMANTEST: ChatGPT is busy, queuing command');
      // Wait for idle
      this.waitForIdle().then(() => {
        this.executeCommand(payload);
      });
      return;
    }
    
    // Set the text
    textarea.value = payload.text || payload.prompt || '';
    
    // Trigger input event
    const inputEvent = new Event('input', { bubbles: true });
    textarea.dispatchEvent(inputEvent);
    
    // Find and click submit button
    const submitButton = document.querySelector('button[data-testid="send-button"]') ||
                        document.querySelector('button[type="submit"]') ||
                        document.querySelector('button svg').parentElement;
    
    if (submitButton) {
      console.log('🚀 SEMANTEST: Clicking submit button');
      submitButton.click();
      
      // Notify WebSocket
      window.postMessage({
        source: 'semantest-content',
        type: 'MESSAGE_SENT',
        payload: {
          text: textarea.value,
          timestamp: new Date().toISOString()
        }
      }, '*');
    } else {
      console.error('❌ SEMANTEST: Submit button not found');
    }
  }
  
  waitForIdle() {
    return new Promise((resolve) => {
      const checkIdle = setInterval(() => {
        const textarea = document.querySelector('#prompt-textarea');
        if (textarea && !textarea.disabled) {
          clearInterval(checkIdle);
          resolve();
        }
      }, 500);
      
      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkIdle);
        resolve();
      }, 30000);
    });
  }
}

// Initialize bridge
console.log('🚀 SEMANTEST: Starting integration bridge...');
const semantestBridge = new SemantestIntegrationBridge();

// Make available for debugging
window.semantestBridge = semantestBridge;