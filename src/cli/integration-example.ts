#!/usr/bin/env node

/**
 * Integration example showing how the new UX-improved CLI
 * works with the existing SEMANTEST infrastructure
 */

import { SemantestCLI } from './semantest-cli';
import { FeedbackSystem, InteractiveProgress } from './feedback-system';
import { ErrorHandler, UserFriendlyError } from './error-handler';
import { EventHttpClient } from '../http/EventHttpClient';
import { ImageGenerationRequestedEvent } from '../events/ImageGenerationRequestedEvent';

/**
 * Example: Image generation with rich feedback
 */
async function generateImageWithFeedback(prompt: string, outputPath: string) {
  // Create feedback system for visual progress
  const progress = new InteractiveProgress([
    'validate',
    'send', 
    'queue',
    'route',
    'execute',
    'generate',
    'save'
  ], true);
  
  try {
    // Start the operation with clear title
    progress.start('🎨 Generating Image from Prompt');
    
    // Validate input
    progress.update('Checking prompt and output path');
    if (!prompt || prompt.trim().length === 0) {
      throw new UserFriendlyError(
        'Invalid prompt',
        'The prompt cannot be empty',
        'Provide a descriptive prompt like: "a beautiful sunset over mountains"',
        'Good prompts are specific and descriptive'
      );
    }
    
    // Move to send stage
    progress.next('Connecting to server');
    
    // Create event
    const event = new ImageGenerationRequestedEvent(prompt, outputPath);
    progress.update(`Event ID: ${event.id.slice(0, 8)}`);
    
    // Send to server
    const client = new EventHttpClient('http://localhost:8080');
    
    try {
      progress.next('Sending request');
      const result = await client.sendEvent(event, {
        maxRetries: 3,
        retryDelay: 1000
      });
      
      if (result.success) {
        // Simulate pipeline progress
        progress.next('Request queued');
        await simulateProgress(progress, 'queue', 2000);
        
        progress.next('Routing to browser');
        await simulateProgress(progress, 'route', 1500);
        
        progress.next('Browser processing');
        await simulateProgress(progress, 'execute', 3000);
        
        progress.next('Generating image');
        await simulateGenerationProgress(progress);
        
        progress.next('Saving to disk');
        await simulateProgress(progress, 'save', 1000);
        
        // Complete successfully
        progress.complete('Image generated successfully!');
        
        console.log('\n📁 Output saved to:', outputPath);
        console.log('📊 Total time: 35 seconds');
        
      } else {
        throw new Error(result.error || 'Server rejected the request');
      }
      
    } catch (error: any) {
      // Handle connection errors with helpful messages
      const userError = ErrorHandler.handle(error, {
        command: 'generate',
        options: { prompt, output: outputPath }
      });
      
      progress.fail(userError.title, userError.hint);
      ErrorHandler.display(userError, true);
      process.exit(1);
    }
    
  } catch (error: any) {
    if (error instanceof UserFriendlyError) {
      ErrorHandler.display(error);
    } else {
      const userError = ErrorHandler.handle(error);
      ErrorHandler.display(userError);
    }
    process.exit(1);
  }
}

/**
 * Simulate progress for a stage
 */
async function simulateProgress(
  progress: InteractiveProgress,
  stage: string,
  duration: number
) {
  const steps = 10;
  const stepDuration = duration / steps;
  
  for (let i = 1; i <= steps; i++) {
    progress.progress(i, steps, `Processing ${stage}`);
    await new Promise(resolve => setTimeout(resolve, stepDuration));
  }
}

/**
 * Simulate image generation with realistic progress
 */
async function simulateGenerationProgress(progress: InteractiveProgress) {
  const stages = [
    { label: 'Parsing prompt', duration: 2000 },
    { label: 'Loading AI model', duration: 3000 },
    { label: 'Generating initial composition', duration: 5000 },
    { label: 'Refining details', duration: 8000 },
    { label: 'Applying style', duration: 4000 },
    { label: 'Final rendering', duration: 3000 }
  ];
  
  let totalProgress = 0;
  const totalDuration = stages.reduce((sum, s) => sum + s.duration, 0);
  
  for (const stage of stages) {
    const steps = Math.floor(stage.duration / 200);
    const stepSize = stage.duration / totalDuration * 100 / steps;
    
    for (let i = 0; i < steps; i++) {
      totalProgress += stepSize;
      progress.progress(
        Math.min(Math.round(totalProgress), 100),
        100,
        stage.label
      );
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
}

/**
 * Example: Monitor events with live feedback
 */
async function monitorEventsWithFeedback() {
  const feedback = new FeedbackSystem(true);
  
  // Show connection status first
  feedback.showConnectionStatus({
    server: true,
    websocket: true,
    browser: false  // Not connected yet
  });
  
  console.log('\n');
  
  // Create mock event emitter for demo
  const { EventEmitter } = require('events');
  const eventStream = new EventEmitter();
  
  // Start streaming
  feedback.streamEvents(eventStream);
  
  // Simulate events
  setTimeout(() => {
    eventStream.emit('event', {
      id: 'abc123def',
      type: 'ImageGenerationRequestedEvent',
      payload: { prompt: 'sunset', status: 'pending' }
    });
  }, 1000);
  
  setTimeout(() => {
    eventStream.emit('event', {
      id: 'def456ghi',
      type: 'EventRoutedEvent',
      payload: { targetDomain: 'chatgpt.com', status: 'routed' }
    });
  }, 2000);
  
  setTimeout(() => {
    eventStream.emit('event', {
      id: 'ghi789jkl',
      type: 'GenerationCompletedEvent',
      payload: { outputPath: '/tmp/image.png', status: 'completed' }
    });
  }, 3000);
  
  // Keep running
  await new Promise(() => {});
}

/**
 * Main function - run examples based on command line args
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'generate-demo') {
    // Run image generation demo
    await generateImageWithFeedback(
      'a beautiful sunset over mountains',
      '/tmp/sunset-demo.png'
    );
    
  } else if (command === 'monitor-demo') {
    // Run event monitoring demo
    await monitorEventsWithFeedback();
    
  } else {
    console.log('SEMANTEST CLI Integration Examples\n');
    console.log('Usage:');
    console.log('  npm run cli-demo generate-demo   # Show image generation with rich feedback');
    console.log('  npm run cli-demo monitor-demo    # Show event monitoring with live updates');
  }
}

// Run if main module
if (require.main === module) {
  main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

export { generateImageWithFeedback, monitorEventsWithFeedback };