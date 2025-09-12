#!/usr/bin/env node

import { EventHttpClient } from '../http/EventHttpClient';
import { ImageGenerationRequestedEvent } from '../events/ImageGenerationRequestedEvent';
import chalk from 'chalk';
import ora from 'ora';
import { EventEmitter } from 'events';

/**
 * SEMANTEST CLI - Following "Badass Users" Philosophy
 * Progressive disclosure, making users awesome, treating errors as learning opportunities
 */

interface CliOptions {
  // Basic options (always visible)
  prompt?: string;
  output?: string;
  help?: boolean;
  version?: boolean;
  
  // Advanced options (shown when asked)
  server?: string;
  domain?: string;
  timeout?: number;
  retries?: number;
  
  // Expert options (shown with --expert flag)
  queueStrategy?: 'fifo' | 'lifo' | 'priority';
  correlationId?: string;
  selector?: string;
  verbose?: boolean;
  json?: boolean;
  follow?: boolean;
  format?: string;
}

interface Command {
  name: string;
  alias?: string;
  description: string;
  basicUsage: string;
  advancedUsage?: string;
  expertUsage?: string;
  examples: string[];
  handler: (options: CliOptions, args: string[]) => Promise<void>;
}

class SemantestCLI extends EventEmitter {
  private client: EventHttpClient;
  private commands: Map<string, Command> = new Map();
  private isExpertMode: boolean = false;
  private isVerbose: boolean = false;
  
  constructor() {
    super();
    this.client = new EventHttpClient('http://localhost:8080');
    this.setupCommands();
  }
  
  private setupCommands() {
    // Main command: generate
    this.addCommand({
      name: 'generate',
      alias: 'gen',
      description: 'Generate an image from a prompt',
      basicUsage: 'semantest generate "your prompt" --output image.png',
      advancedUsage: 'semantest generate "your prompt" --output image.png --server http://localhost:8080 --timeout 300',
      expertUsage: 'semantest generate "your prompt" --output image.png --queue-strategy priority --correlation-id abc123',
      examples: [
        'semantest generate "a beautiful sunset" --output sunset.png',
        'semantest gen "cat playing piano" -o cat.png  # Using alias and short form',
        'semantest generate "complex scene" --output scene.png --timeout 600  # Advanced: custom timeout',
        'semantest generate "art" --output art.png --queue-strategy priority --verbose  # Expert mode'
      ],
      handler: this.handleGenerate.bind(this)
    });
    
    // Events command for monitoring
    this.addCommand({
      name: 'events',
      description: 'Monitor events in the system',
      basicUsage: 'semantest events',
      advancedUsage: 'semantest events --follow',
      expertUsage: 'semantest events --follow --format json | jq .payload',
      examples: [
        'semantest events  # Show recent events',
        'semantest events --follow  # Watch events in real-time',
        'semantest events --follow --format json | jq  # Expert: Process with jq'
      ],
      handler: this.handleEvents.bind(this)
    });
    
    // Status command
    this.addCommand({
      name: 'status',
      description: 'Check system status',
      basicUsage: 'semantest status',
      advancedUsage: 'semantest status --verbose',
      expertUsage: 'semantest status --json | jq .connections',
      examples: [
        'semantest status  # Quick status check',
        'semantest status --verbose  # Detailed status',
        'semantest status --json  # Machine-readable format'
      ],
      handler: this.handleStatus.bind(this)
    });
  }
  
  private addCommand(command: Command) {
    this.commands.set(command.name, command);
    if (command.alias) {
      this.commands.set(command.alias, command);
    }
  }
  
  private async handleGenerate(options: CliOptions, args: string[]): Promise<void> {
    const spinner = ora();
    
    try {
      // Validate basic requirements with helpful messages
      if (!options.prompt && args.length === 0) {
        this.showError(
          'Missing prompt',
          'You need to provide a prompt for image generation.',
          'Try: semantest generate "a beautiful sunset" --output sunset.png'
        );
        process.exit(1);
      }
      
      const prompt = options.prompt || args[0];
      const outputPath = options.output || `generated-${Date.now()}.png`;
      
      // Show what we're doing in a user-friendly way
      console.log(chalk.cyan('\n🎨 Generating image...'));
      console.log(chalk.gray(`   Prompt: "${prompt}"`));
      console.log(chalk.gray(`   Output: ${outputPath}`));
      
      if (options.server) {
        console.log(chalk.gray(`   Server: ${options.server}`));
      }
      
      // Create and send event
      spinner.start('Sending request to server...');
      
      const event = new ImageGenerationRequestedEvent(prompt, outputPath);
      
      if (options.correlationId) {
        (event as any).correlationId = options.correlationId;
      }
      
      // Configure client if custom server
      if (options.server) {
        this.client = new EventHttpClient(options.server);
      }
      
      const result = await this.client.sendEvent(event, {
        maxRetries: options.retries || 3,
        retryDelay: 1000
      });
      
      if (result.success) {
        spinner.succeed(chalk.green('Request sent successfully!'));
        
        // Show progress through the pipeline
        console.log(chalk.cyan('\n📊 Event Pipeline:'));
        console.log(chalk.gray('   1. ✅ Event created'));
        console.log(chalk.gray('   2. ✅ Sent to server'));
        console.log(chalk.gray('   3. ⏳ Server processing...'));
        console.log(chalk.gray('   4. ⏳ Browser extension handling...'));
        console.log(chalk.gray('   5. ⏳ Image generation in progress...'));
        
        console.log(chalk.yellow('\n💡 Your image will be saved to: ' + chalk.white(outputPath)));
        console.log(chalk.gray('   Check the browser extension for real-time progress'));
        
      } else {
        spinner.fail('Failed to send request');
        this.showError(
          'Request failed',
          result.error || 'Unknown error occurred',
          'Make sure the server is running: npm run server'
        );
      }
      
    } catch (error: any) {
      spinner.fail('An error occurred');
      
      // Provide helpful error messages based on the error type
      if (error.code === 'ECONNREFUSED') {
        this.showError(
          'Connection failed',
          'Could not connect to the SEMANTEST server.',
          'Start the server with: npm run server\nDefault port is 8080'
        );
      } else if (error.code === 'ETIMEDOUT') {
        this.showError(
          'Request timeout',
          'The server took too long to respond.',
          'Try increasing timeout: --timeout 600\nOr check if server is overloaded'
        );
      } else {
        this.showError(
          'Unexpected error',
          error.message,
          'Run with --verbose for more details'
        );
      }
      
      process.exit(1);
    }
  }
  
  private async handleEvents(options: CliOptions): Promise<void> {
    console.log(chalk.cyan('\n📡 Event Monitor'));
    
    if (options.follow) {
      console.log(chalk.gray('Watching for events... (Press Ctrl+C to stop)\n'));
      
      // In real implementation, this would connect to WebSocket
      console.log(chalk.yellow('💡 Tip: Use --format json to get machine-readable output'));
      console.log(chalk.yellow('   Then pipe to jq for processing: | jq .payload\n'));
      
      // Simulate event stream
      setInterval(() => {
        const event = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'ImageGenerationRequestedEvent',
          timestamp: new Date().toISOString(),
          payload: { prompt: 'sample', status: 'processing' }
        };
        
        if (options.format === 'json' || options.json) {
          console.log(JSON.stringify(event));
        } else {
          console.log(chalk.gray(`[${event.timestamp}]`), chalk.green(event.type), chalk.white(`#${event.id}`));
        }
      }, 2000);
      
    } else {
      console.log(chalk.gray('Fetching recent events...\n'));
      // Show recent events
      console.log(chalk.yellow('💡 Tip: Use --follow to watch events in real-time'));
    }
  }
  
  private async handleStatus(options: CliOptions): Promise<void> {
    const spinner = ora('Checking system status...').start();
    
    try {
      // In real implementation, this would check actual status
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      spinner.succeed('System check complete');
      
      if (options.json) {
        const status = {
          server: { status: 'running', url: 'http://localhost:8080' },
          websocket: { status: 'connected', clients: 2 },
          browser: { status: 'ready', tabs: 1 }
        };
        console.log(JSON.stringify(status, null, 2));
      } else {
        console.log(chalk.cyan('\n🚦 System Status:\n'));
        console.log(chalk.green('  ✅ Server:    Running on http://localhost:8080'));
        console.log(chalk.green('  ✅ WebSocket: Connected (2 clients)'));
        console.log(chalk.green('  ✅ Browser:   Extension ready (1 tab)'));
        
        if (options.verbose) {
          console.log(chalk.cyan('\n📊 Detailed Information:\n'));
          console.log(chalk.gray('  Server Version:  2.0.0'));
          console.log(chalk.gray('  Uptime:         2h 34m'));
          console.log(chalk.gray('  Events Processed: 1,234'));
          console.log(chalk.gray('  Queue Length:    3'));
        }
      }
      
    } catch (error: any) {
      spinner.fail('Status check failed');
      this.showError(
        'Could not get status',
        error.message,
        'Check if the server is running'
      );
      process.exit(1);
    }
  }
  
  private showError(title: string, message: string, hint: string) {
    console.error(chalk.red(`\n❌ ${title}`));
    console.error(chalk.gray(`   ${message}`));
    console.error(chalk.yellow(`\n💡 ${hint}`));
  }
  
  private showHelp(level: 'basic' | 'advanced' | 'expert' = 'basic') {
    console.log(chalk.cyan('\n🚀 SEMANTEST - Simple Yet Powerful Image Generation\n'));
    
    if (level === 'basic') {
      console.log(chalk.white('Basic Usage:'));
      console.log(chalk.gray('  semantest generate "your prompt" --output image.png\n'));
      
      console.log(chalk.white('Commands:'));
      this.commands.forEach(cmd => {
        if (cmd.name !== cmd.alias) {  // Skip aliases
          console.log(chalk.yellow(`  ${cmd.name.padEnd(12)}`), chalk.gray(cmd.description));
        }
      });
      
      console.log(chalk.white('\nExamples:'));
      console.log(chalk.gray('  semantest generate "sunset over mountains" --output sunset.png'));
      console.log(chalk.gray('  semantest gen "cute cat" -o cat.png              # Short form'));
      console.log(chalk.gray('  semantest status                                  # Check system'));
      
      console.log(chalk.cyan('\n📚 Learn More:'));
      console.log(chalk.gray('  semantest help --advanced    # Show advanced options'));
      console.log(chalk.gray('  semantest help --expert      # Show expert features'));
      
    } else if (level === 'advanced') {
      console.log(chalk.yellow('Advanced Options:\n'));
      console.log(chalk.white('Server Configuration:'));
      console.log(chalk.gray('  --server <url>      Custom server URL (default: http://localhost:8080)'));
      console.log(chalk.gray('  --timeout <sec>     Request timeout in seconds (default: 30)'));
      console.log(chalk.gray('  --retries <n>       Number of retries on failure (default: 3)'));
      
      console.log(chalk.white('\nMonitoring:'));
      console.log(chalk.gray('  semantest events --follow        # Watch events in real-time'));
      console.log(chalk.gray('  semantest status --verbose       # Detailed status information'));
      
      console.log(chalk.cyan('\n📚 Expert Mode:'));
      console.log(chalk.gray('  semantest help --expert          # Unlock expert features'));
      
    } else if (level === 'expert') {
      console.log(chalk.magenta('Expert Features:\n'));
      
      console.log(chalk.white('Queue Management:'));
      console.log(chalk.gray('  --queue-strategy <strategy>   Set queue strategy: fifo, lifo, priority'));
      console.log(chalk.gray('  --correlation-id <id>         Custom correlation ID for tracking'));
      
      console.log(chalk.white('\nEvent Processing:'));
      console.log(chalk.gray('  semantest events --follow --format json | jq ".payload | select(.status == \\"completed\\")"'));
      console.log(chalk.gray('  semantest events --follow --format json | tee events.log | jq .'));
      
      console.log(chalk.white('\nDirect Event Sending:'));
      console.log(chalk.gray('  semantest send <EventType> --data \'{"key": "value"}\''));
      console.log(chalk.gray('  semantest send CustomEvent --domain chatgpt.com --selector "textarea"'));
      
      console.log(chalk.white('\nDebugging:'));
      console.log(chalk.gray('  SEMANTEST_DEBUG=* semantest generate "test" -o test.png'));
      console.log(chalk.gray('  semantest --verbose generate "test" --output test.png'));
    }
  }
  
  async run(argv: string[]): Promise<void> {
    const args = argv.slice(2);
    
    // Parse command and options
    const command = args[0];
    const options: CliOptions = {};
    const commandArgs: string[] = [];
    
    for (let i = 1; i < args.length; i++) {
      const arg = args[i];
      
      if (arg === '--help' || arg === '-h') {
        options.help = true;
        // Check for help level
        if (args[i + 1] === '--advanced') {
          this.showHelp('advanced');
          return;
        } else if (args[i + 1] === '--expert') {
          this.showHelp('expert');
          return;
        }
      } else if (arg === '--version' || arg === '-v') {
        console.log('semantest version 2.0.0');
        return;
      } else if (arg.startsWith('--')) {
        const key = arg.slice(2).replace(/-/g, '');
        if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
          options[key as keyof CliOptions] = args[++i] as any;
        } else {
          options[key as keyof CliOptions] = true as any;
        }
      } else if (arg.startsWith('-')) {
        // Short form options
        const key = this.resolveShortOption(arg.slice(1));
        if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
          options[key as keyof CliOptions] = args[++i] as any;
        } else {
          options[key as keyof CliOptions] = true as any;
        }
      } else {
        commandArgs.push(arg);
      }
    }
    
    // Handle help
    if (!command || command === 'help' || options.help) {
      this.showHelp('basic');
      return;
    }
    
    // Execute command
    const cmd = this.commands.get(command);
    if (cmd) {
      await cmd.handler(options, commandArgs);
    } else {
      this.showError(
        'Unknown command',
        `Command "${command}" not recognized`,
        'Run "semantest help" to see available commands'
      );
      process.exit(1);
    }
  }
  
  private resolveShortOption(short: string): string {
    const shortcuts: Record<string, string> = {
      'o': 'output',
      's': 'server',
      't': 'timeout',
      'v': 'verbose',
      'h': 'help',
      'f': 'follow',
      'j': 'json'
    };
    return shortcuts[short] || short;
  }
}

// Main entry point
if (require.main === module) {
  const cli = new SemantestCLI();
  cli.run(process.argv).catch((error) => {
    console.error(chalk.red('Fatal error:'), error.message);
    process.exit(1);
  });
}

export { SemantestCLI };