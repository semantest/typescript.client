#!/usr/bin/env node

import { parseArguments, getHelpText } from './argumentParser';
import { ImageGenerationRequestedEvent } from '../events/ImageGenerationRequestedEvent';
import { EventSender } from '../http/eventSender';

export async function main(args: string[] = process.argv): Promise<void> {
  try {
    // Parse command line arguments
    const parsedArgs = parseArguments(args);

    // Display help if requested
    if (parsedArgs.help) {
      console.log(getHelpText());
      return;
    }

    // Display what we're doing
    console.log('📤 Sending SEMANTEST ImageGenerationRequestedEvent...');
    console.log(`Domain: ${parsedArgs.domain}`);
    console.log(`Prompt: ${parsedArgs.prompt}`);
    console.log(`Image Path: ${parsedArgs.imagePath}`);
    console.log(`Server: ${parsedArgs.serverUrl}`);
    console.log('');

    // Create the event with domain
    const event = new ImageGenerationRequestedEvent(
      parsedArgs.prompt!,
      parsedArgs.imagePath!,
      parsedArgs.domain
    );

    // Send the event to the server
    const sender = new EventSender(parsedArgs.serverUrl);
    const result = await sender.sendEvent(event);

    // Display success
    console.log('✅ Event sent successfully!');
    console.log(`Event ID: ${result.id || event.id}`);
    if (result.message) {
      console.log(`Message: ${result.message}`);
    }
  } catch (error) {
    // Handle errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('Missing required argument') || 
        errorMessage.includes('value is missing')) {
      console.error(`❌ Argument error: ${errorMessage}`);
      console.error('\nUse --help for usage information.');
    } else if (errorMessage.includes('Network') || 
               errorMessage.includes('Server error') ||
               errorMessage.includes('Failed to send event')) {
      console.error(`❌ Error sending event: ${errorMessage}`);
    } else {
      console.error(`❌ Error: ${errorMessage}`);
    }
    
    // Exit with error code
    if (typeof process !== 'undefined' && process.exit) {
      process.exit(1);
    }
  }
}

// Only run if this is the main module
if (require.main === module) {
  main();
}