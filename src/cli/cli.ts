#!/usr/bin/env node

import { CliArgumentParser } from './CliArgumentParser';
import { ImageGenerationRequestedEvent } from '../events/ImageGenerationRequestedEvent';
import { EventHttpClient } from '../http/EventHttpClient';

async function main(): Promise<void> {
  try {
    // Parse command line arguments
    const parser = new CliArgumentParser();
    const args = parser.parse();

    console.log('📸 Semantest Image Generation CLI');
    console.log('==================================');
    console.log(`📝 Prompt: ${args.prompt}`);
    console.log(`📁 Image Path: ${args.imagePath}`);
    console.log(`🌐 Server: ${args.serverUrl}`);
    console.log('');

    // Create the event
    const event = new ImageGenerationRequestedEvent(args.prompt, args.imagePath);
    console.log(`✅ Created event with ID: ${event.id}`);

    // Send the event to the server
    console.log('📤 Sending event to server...');
    const client = new EventHttpClient(args.serverUrl);
    
    const result = await client.sendEvent(event, {
      maxRetries: 3,
      retryDelay: 1000
    });

    if (result.success) {
      console.log('✅ Event sent successfully!');
      if (result.message) {
        console.log(`📬 Server response: ${result.message}`);
      }
      process.exit(0);
    } else {
      console.error('❌ Failed to send event');
      if (result.error) {
        console.error(`Error: ${result.error}`);
      }
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
    process.exit(1);
  }
}

// Only run if this is the main module
if (require.main === module) {
  main();
}

export { main };