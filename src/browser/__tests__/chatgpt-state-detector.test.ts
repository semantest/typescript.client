/**
 * @fileoverview TDD Tests for ChatGPT State Detection - RED Phase 🔴
 * @description Following Ana's TDD cycle: First write FAILING tests
 * @owner Wences - Browser Specialist
 * @critical This is the primary bottleneck for the entire system
 */

import { ChatGPTStateDetector } from '../chatgpt-state-detector';
import { JSDOM } from 'jsdom';

describe('ChatGPTStateDetector - TDD Red Phase 🔴', () => {
  let detector: ChatGPTStateDetector;
  let dom: JSDOM;
  let document: Document;
  
  beforeEach(() => {
    // Set up a minimal DOM environment
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'https://chat.openai.com',
      pretendToBeVisual: true
    });
    document = dom.window.document;
    detector = new ChatGPTStateDetector(document);
  });
  
  afterEach(() => {
    dom.window.close();
  });
  
  describe('Idle State Detection 🔴', () => {
    test('detects idle when textarea is enabled and no spinner present', () => {
      // Arrange: Set up DOM with enabled textarea and no spinner
      document.body.innerHTML = `
        <div id="__next">
          <main>
            <div class="relative">
              <textarea 
                id="prompt-textarea"
                class="m-0 w-full"
                placeholder="Send a message"
                tabindex="0"
                style=""
              ></textarea>
              <button type="submit" class="absolute" disabled="false">
                <svg>Send</svg>
              </button>
            </div>
          </main>
        </div>
      `;
      
      // Act
      const state = detector.detectIdleState();
      
      // Assert - This SHOULD FAIL in RED phase
      expect(state).toBe(true);
    });
    
    test('returns false when textarea is disabled', () => {
      // Arrange: Disabled textarea indicates busy state
      document.body.innerHTML = `
        <div id="__next">
          <main>
            <textarea 
              id="prompt-textarea"
              disabled
              class="m-0 w-full"
            ></textarea>
          </main>
        </div>
      `;
      
      // Act
      const state = detector.detectIdleState();
      
      // Assert - This SHOULD FAIL in RED phase
      expect(state).toBe(false);
    });
    
    test('returns false when processing indicator is present', () => {
      // Arrange: Processing dots/spinner present
      document.body.innerHTML = `
        <div id="__next">
          <main>
            <div class="result-streaming">
              <span class="result-thinking">●●●</span>
            </div>
            <textarea id="prompt-textarea"></textarea>
          </main>
        </div>
      `;
      
      // Act
      const state = detector.detectIdleState();
      
      // Assert - This SHOULD FAIL in RED phase
      expect(state).toBe(false);
    });
  });
  
  describe('Busy State Detection 🔴', () => {
    test('detects busy when spinner/dots are visible', () => {
      // Arrange: Thinking dots visible
      document.body.innerHTML = `
        <div id="__next">
          <main>
            <div class="text-token-text-secondary">
              <div class="flex items-center">
                <div class="dot-flashing"></div>
              </div>
            </div>
          </main>
        </div>
      `;
      
      // Act
      const state = detector.detectBusyState();
      
      // Assert - This SHOULD FAIL in RED phase
      expect(state).toBe(true);
    });
    
    test('detects busy when textarea is disabled', () => {
      // Arrange: Textarea disabled during processing
      document.body.innerHTML = `
        <div id="__next">
          <main>
            <textarea 
              id="prompt-textarea"
              disabled
              class="m-0 w-full opacity-50"
            ></textarea>
          </main>
        </div>
      `;
      
      // Act
      const state = detector.detectBusyState();
      
      // Assert - This SHOULD FAIL in RED phase
      expect(state).toBe(true);
    });
    
    test('detects busy when "Stop generating" button is present', () => {
      // Arrange: Stop button visible during generation
      document.body.innerHTML = `
        <div id="__next">
          <main>
            <button class="btn relative btn-neutral">
              <div class="flex items-center">
                <svg class="h-3 w-3"></svg>
                <span>Stop generating</span>
              </div>
            </button>
          </main>
        </div>
      `;
      
      // Act
      const state = detector.detectBusyState();
      
      // Assert - This SHOULD FAIL in RED phase
      expect(state).toBe(true);
    });
    
    test('returns false when in idle state with enabled textarea', () => {
      // Arrange: Clear idle state
      document.body.innerHTML = `
        <div id="__next">
          <main>
            <textarea 
              id="prompt-textarea"
              class="m-0 w-full"
              placeholder="Send a message"
            ></textarea>
          </main>
        </div>
      `;
      
      // Act
      const state = detector.detectBusyState();
      
      // Assert - This SHOULD FAIL in RED phase
      expect(state).toBe(false);
    });
  });
  
  describe('Reliable State Detection 🔴', () => {
    test('returns "idle" for clear idle state', async () => {
      // Arrange: Perfect idle conditions
      document.body.innerHTML = `
        <div id="__next">
          <main>
            <textarea 
              id="prompt-textarea"
              class="m-0 w-full"
              placeholder="Send a message"
            ></textarea>
            <button type="submit" class="absolute">Send</button>
          </main>
        </div>
      `;
      
      // Act
      const state = await detector.getReliableState();
      
      // Assert - This SHOULD FAIL in RED phase
      expect(state).toBe('idle');
    });
    
    test('returns "busy" for clear busy state', async () => {
      // Arrange: Multiple busy indicators
      document.body.innerHTML = `
        <div id="__next">
          <main>
            <div class="dot-flashing"></div>
            <textarea id="prompt-textarea" disabled></textarea>
            <button>Stop generating</button>
          </main>
        </div>
      `;
      
      // Act
      const state = await detector.getReliableState();
      
      // Assert - This SHOULD FAIL in RED phase
      expect(state).toBe('busy');
    });
    
    test('returns "error" when error message is displayed', async () => {
      // Arrange: Error state
      document.body.innerHTML = `
        <div id="__next">
          <main>
            <div class="text-red-500">
              Something went wrong. Please try again.
            </div>
            <textarea id="prompt-textarea"></textarea>
          </main>
        </div>
      `;
      
      // Act
      const state = await detector.getReliableState();
      
      // Assert - This SHOULD FAIL in RED phase
      expect(state).toBe('error');
    });
    
    test('returns "unknown" for ambiguous state', async () => {
      // Arrange: Conflicting signals
      document.body.innerHTML = `
        <div id="__next">
          <main>
            <!-- Mixed signals: enabled textarea but spinner present -->
            <textarea id="prompt-textarea"></textarea>
            <div class="spinner-border"></div>
          </main>
        </div>
      `;
      
      // Act
      const state = await detector.getReliableState();
      
      // Assert - This SHOULD FAIL in RED phase
      expect(state).toBe('unknown');
    });
  });
  
  describe('State Change Detection 🔴', () => {
    test('detects transition from idle to busy', async () => {
      // Arrange: Start in idle
      document.body.innerHTML = `
        <textarea id="prompt-textarea"></textarea>
      `;
      
      const callback = jest.fn();
      detector.onStateChange(callback);
      
      // Act: Simulate state change to busy
      document.body.innerHTML = `
        <textarea id="prompt-textarea" disabled></textarea>
        <div class="dot-flashing"></div>
      `;
      
      // Trigger mutation observer
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Assert - This SHOULD FAIL in RED phase
      expect(callback).toHaveBeenCalledWith('idle', 'busy');
    });
    
    test('detects transition from busy to idle', async () => {
      // Arrange: Start in busy
      document.body.innerHTML = `
        <textarea id="prompt-textarea" disabled></textarea>
        <div class="dot-flashing"></div>
      `;
      
      const callback = jest.fn();
      detector.onStateChange(callback);
      
      // Act: Simulate state change to idle
      document.body.innerHTML = `
        <textarea id="prompt-textarea"></textarea>
      `;
      
      // Trigger mutation observer
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Assert - This SHOULD FAIL in RED phase
      expect(callback).toHaveBeenCalledWith('busy', 'idle');
    });
  });
  
  describe('Performance Requirements 🔴', () => {
    test('detects state within 100ms', async () => {
      // Arrange
      document.body.innerHTML = `
        <textarea id="prompt-textarea"></textarea>
      `;
      
      // Act
      const startTime = Date.now();
      await detector.getReliableState();
      const duration = Date.now() - startTime;
      
      // Assert - This SHOULD FAIL in RED phase
      expect(duration).toBeLessThan(100);
    });
    
    test('handles rapid state changes without missing transitions', async () => {
      // Arrange
      const stateChanges: string[] = [];
      detector.onStateChange((from, to) => {
        stateChanges.push(`${from}->${to}`);
      });
      
      // Act: Rapid state changes
      for (let i = 0; i < 10; i++) {
        document.body.innerHTML = i % 2 === 0
          ? '<textarea id="prompt-textarea"></textarea>'
          : '<textarea id="prompt-textarea" disabled></textarea>';
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // Assert - This SHOULD FAIL in RED phase
      expect(stateChanges.length).toBeGreaterThanOrEqual(9);
    });
  });
});

/**
 * Integration Tests with Carlos's Event Flow 🔴
 */
describe('ChatGPTStateDetector Integration - TDD Red Phase 🔴', () => {
  test('integrates with EventFlowTracker', async () => {
    // This test verifies integration with Carlos's event flow system
    // It SHOULD FAIL until implementation is complete
    
    const detector = new ChatGPTStateDetector(document);
    const tracker = {
      enterStage: jest.fn(),
      exitStage: jest.fn()
    };
    
    // Connect detector to tracker
    detector.connectToEventFlow(tracker);
    
    // Trigger state detection
    await detector.getReliableState();
    
    // Should track the bottleneck stages
    expect(tracker.enterStage).toHaveBeenCalledWith('browser.state.checking');
    expect(tracker.exitStage).toHaveBeenCalledWith('browser.idle.detected');
  });
});