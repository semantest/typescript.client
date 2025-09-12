#!/usr/bin/env node

import axios from 'axios';
import { randomUUID } from 'crypto';

/**
 * SEMANTEST CLI - Event-driven system for browser tab interaction
 * Sends events to HTTP server which routes them via WebSocket to browser extension
 */
class SemantestCLI {
  private serverUrl: string;

  constructor(serverUrl: string = 'http://localhost:8080') {
    this.serverUrl = serverUrl;
  }

  /**
   * Send a SEMANTEST event to the server
   */
  async sendEvent(type: string, payload: any): Promise<any> {
    const event = {
      id: randomUUID(),
      type,
      payload: {
        ...payload,
        correlationId: randomUUID(),
        timestamp: Date.now()
      }
    };

    console.log('📤 Sending SEMANTEST event:', JSON.stringify(event, null, 2));

    try {
      const response = await axios.post(
        `${this.serverUrl}/events`,
        event,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      console.log('✅ Event sent successfully!');
      if (response.data) {
        console.log('📬 Server response:', response.data);
      }

      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error('❌ Server error:', error.response.status, error.response.data);
        throw new Error(`Server error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error('❌ Network error: No response from server');
        throw new Error('Network error: No response from server');
      } else {
        console.error('❌ Error:', error.message);
        throw error;
      }
    }
  }

  /**
   * Request image generation via SEMANTEST event
   * CRITICAL: Must include domain for tab routing!
   */
  async requestImageGeneration(prompt: string, outputPath: string, domain: string = 'chatgpt.com'): Promise<any> {
    return this.sendEvent('ImageGenerationRequestedEvent', {
      domain,  // CRITICAL: This tells the system which tab to target!
      prompt,
      outputPath,
      imagePath: outputPath  // Support both field names
    });
  }

  /**
   * Send a text input event to a specific domain
   */
  async sendTextInput(domain: string, text: string, selector?: string): Promise<any> {
    return this.sendEvent('TextInputEvent', {
      domain,
      text,
      selector: selector || 'textarea'
    });
  }

  /**
   * Send a click event to a specific domain
   */
  async sendClick(domain: string, selector: string): Promise<any> {
    return this.sendEvent('ClickEvent', {
      domain,
      selector
    });
  }

  /**
   * Send a generic SEMANTEST event
   */
  async sendCustomEvent(eventType: string, domain: string, data: any): Promise<any> {
    return this.sendEvent(eventType, {
      domain,
      ...data
    });
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(): { command?: string; args: string[]; options: Record<string, string> } {
  const args = process.argv.slice(2);
  const result: { command?: string; args: string[]; options: Record<string, string> } = {
    args: [],
    options: {}
  };

  let i = 0;
  if (args[0] && !args[0].startsWith('-')) {
    result.command = args[0];
    i = 1;
  }

  for (; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        result.options[key] = args[++i];
      } else {
        result.options[key] = 'true';
      }
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1);
      if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        result.options[key] = args[++i];
      } else {
        result.options[key] = 'true';
      }
    } else {
      result.args.push(arg);
    }
  }

  return result;
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
🚀 SEMANTEST CLI - Event-driven browser automation

Usage: semantest [command] [options]

Commands:
  send <EventType>           Send a custom event
  image-generation           Send ImageGenerationRequestedEvent
  text-input                 Send TextInputEvent
  click                      Send ClickEvent

Options:
  --domain <domain>          Target domain (default: chatgpt.com)
  --prompt <text>            Prompt for image generation
  --output-path <path>       Output path for generated image
  --text <text>              Text to input
  --selector <selector>      CSS selector for element
  --server <url>             Server URL (default: http://localhost:8080)
  --help, -h                 Show this help

Examples:
  # Image generation (MOST COMMON)
  semantest image-generation --prompt "a beautiful sunset" --output-path /tmp/sunset.png
  
  # Custom domain
  semantest image-generation --prompt "a cat" --output-path /tmp/cat.png --domain custom-ai.com
  
  # Send text input
  semantest text-input --domain chatgpt.com --text "Hello, AI!" --selector "textarea"
  
  # Send click event
  semantest click --domain chatgpt.com --selector "button[type=submit]"
  
  # Send custom event
  semantest send CustomEvent --domain chatgpt.com --data '{"key": "value"}'

CRITICAL: Always include --domain (defaults to chatgpt.com) for tab routing!
`);
}

/**
 * Main CLI entry point
 */
async function main() {
  const { command, options } = parseArgs();

  if (options.help || options.h || !command) {
    showHelp();
    process.exit(0);
  }

  const serverUrl = options.server || 'http://localhost:8080';
  const domain = options.domain || 'chatgpt.com';
  const cli = new SemantestCLI(serverUrl);

  try {
    console.log('🌐 SEMANTEST CLI');
    console.log(`📡 Server: ${serverUrl}`);
    console.log(`🎯 Domain: ${domain}`);
    console.log('');

    switch (command) {
      case 'image-generation':
      case 'ImageGenerationRequestedEvent':
        if (!options.prompt) {
          console.error('❌ Error: --prompt is required for image generation');
          process.exit(1);
        }
        if (!options['output-path'] && !options.outputPath) {
          console.error('❌ Error: --output-path is required for image generation');
          process.exit(1);
        }
        const outputPath = options['output-path'] || options.outputPath;
        await cli.requestImageGeneration(options.prompt, outputPath, domain);
        break;

      case 'text-input':
      case 'TextInputEvent':
        if (!options.text) {
          console.error('❌ Error: --text is required for text input');
          process.exit(1);
        }
        await cli.sendTextInput(domain, options.text, options.selector);
        break;

      case 'click':
      case 'ClickEvent':
        if (!options.selector) {
          console.error('❌ Error: --selector is required for click event');
          process.exit(1);
        }
        await cli.sendClick(domain, options.selector);
        break;

      case 'send':
        const eventType = options.type || process.argv[3];
        if (!eventType) {
          console.error('❌ Error: Event type is required');
          process.exit(1);
        }
        let data = {};
        if (options.data) {
          try {
            data = JSON.parse(options.data);
          } catch (e) {
            console.error('❌ Error: Invalid JSON in --data');
            process.exit(1);
          }
        }
        await cli.sendCustomEvent(eventType, domain, data);
        break;

      default:
        console.error(`❌ Error: Unknown command '${command}'`);
        showHelp();
        process.exit(1);
    }

    console.log('✨ Done!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if main module
if (require.main === module) {
  main();
}

// Export for testing
export { SemantestCLI, parseArgs, main };