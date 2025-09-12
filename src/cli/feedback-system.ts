import chalk from 'chalk';
import ora, { Ora } from 'ora';
import { EventEmitter } from 'events';

/**
 * Feedback System - Making async operations feel responsive
 * Following "Badass Users" philosophy
 */

export interface EventProgress {
  stage: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  message?: string;
  detail?: string;
  timestamp: number;
}

export interface PipelineStage {
  name: string;
  description: string;
  estimatedTime?: number; // in seconds
  icon: string;
}

export class FeedbackSystem extends EventEmitter {
  private spinner?: Ora;
  private stages: Map<string, PipelineStage>;
  private currentStage?: string;
  private startTime: number = 0;
  private verbose: boolean = false;
  
  constructor(verbose: boolean = false) {
    super();
    this.verbose = verbose;
    this.stages = new Map();
    this.setupDefaultStages();
  }
  
  private setupDefaultStages() {
    // Default pipeline stages for image generation
    this.addStage('validate', {
      name: 'validate',
      description: 'Validating request',
      estimatedTime: 1,
      icon: '🔍'
    });
    
    this.addStage('send', {
      name: 'send',
      description: 'Sending to server',
      estimatedTime: 2,
      icon: '📤'
    });
    
    this.addStage('queue', {
      name: 'queue',
      description: 'Queued for processing',
      estimatedTime: 5,
      icon: '📋'
    });
    
    this.addStage('route', {
      name: 'route',
      description: 'Routing to browser',
      estimatedTime: 2,
      icon: '🔀'
    });
    
    this.addStage('execute', {
      name: 'execute',
      description: 'Executing in browser',
      estimatedTime: 10,
      icon: '🌐'
    });
    
    this.addStage('generate', {
      name: 'generate',
      description: 'Generating image',
      estimatedTime: 30,
      icon: '🎨'
    });
    
    this.addStage('save', {
      name: 'save',
      description: 'Saving result',
      estimatedTime: 2,
      icon: '💾'
    });
    
    this.addStage('complete', {
      name: 'complete',
      description: 'Complete!',
      estimatedTime: 0,
      icon: '✨'
    });
  }
  
  addStage(id: string, stage: PipelineStage) {
    this.stages.set(id, stage);
  }
  
  /**
   * Start showing progress for an operation
   */
  startOperation(title: string, showPipeline: boolean = true) {
    this.startTime = Date.now();
    console.log(chalk.cyan(`\n${title}\n`));
    
    if (showPipeline) {
      this.showPipeline();
    }
    
    this.spinner = ora({
      text: 'Initializing...',
      spinner: 'dots'
    }).start();
  }
  
  /**
   * Show the pipeline visualization
   */
  private showPipeline() {
    console.log(chalk.gray('Pipeline stages:'));
    const stageArray = Array.from(this.stages.values());
    
    stageArray.forEach((stage, index) => {
      const isLast = index === stageArray.length - 1;
      const connector = isLast ? '' : ' → ';
      process.stdout.write(chalk.gray(`${stage.icon} ${stage.name}${connector}`));
    });
    console.log('\n');
  }
  
  /**
   * Update progress to a new stage
   */
  updateStage(stageName: string, status: 'in-progress' | 'completed' | 'failed', message?: string) {
    const stage = this.stages.get(stageName);
    if (!stage) return;
    
    this.currentStage = stageName;
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    
    if (status === 'in-progress') {
      if (this.spinner) {
        this.spinner.text = `${stage.icon} ${stage.description}...`;
        if (message) {
          this.spinner.text += chalk.gray(` (${message})`);
        }
        if (stage.estimatedTime && this.verbose) {
          this.spinner.text += chalk.gray(` [~${stage.estimatedTime}s]`);
        }
      }
    } else if (status === 'completed') {
      if (this.spinner) {
        this.spinner.succeed(chalk.green(`${stage.icon} ${stage.description}`));
        // Start spinner for next stage if not complete
        if (stageName !== 'complete') {
          this.spinner = ora().start();
        }
      }
      
      // Emit progress event
      this.emit('progress', {
        stage: stageName,
        status: 'completed',
        timestamp: Date.now(),
        elapsed
      });
    } else if (status === 'failed') {
      if (this.spinner) {
        this.spinner.fail(chalk.red(`${stage.icon} ${stage.description} - ${message || 'Failed'}`));
      }
      
      // Show what was completed
      this.showCompletedStages(stageName);
      
      // Emit error event
      this.emit('error', {
        stage: stageName,
        message,
        timestamp: Date.now(),
        elapsed
      });
    }
  }
  
  /**
   * Show live updates for long-running operations
   */
  showLiveUpdate(message: string, detail?: string) {
    if (this.spinner && this.spinner.isSpinning) {
      const stage = this.stages.get(this.currentStage || '');
      if (stage) {
        this.spinner.text = `${stage.icon} ${stage.description}: ${chalk.yellow(message)}`;
        if (detail && this.verbose) {
          this.spinner.text += chalk.gray(` (${detail})`);
        }
      }
    }
  }
  
  /**
   * Show progress percentage for measurable operations
   */
  showProgress(current: number, total: number, label?: string) {
    if (this.spinner && this.spinner.isSpinning) {
      const percentage = Math.round((current / total) * 100);
      const progressBar = this.createProgressBar(percentage);
      const stage = this.stages.get(this.currentStage || '');
      
      if (stage) {
        this.spinner.text = `${stage.icon} ${stage.description}: ${progressBar} ${percentage}%`;
        if (label) {
          this.spinner.text += chalk.gray(` (${label})`);
        }
      }
    }
  }
  
  /**
   * Create a visual progress bar
   */
  private createProgressBar(percentage: number): string {
    const width = 20;
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    
    const filledChar = chalk.green('█');
    const emptyChar = chalk.gray('░');
    
    return filledChar.repeat(filled) + emptyChar.repeat(empty);
  }
  
  /**
   * Show which stages were completed before failure
   */
  private showCompletedStages(failedStage: string) {
    console.log(chalk.yellow('\nCompleted stages:'));
    
    let foundFailed = false;
    for (const [id, stage] of this.stages) {
      if (id === failedStage) {
        foundFailed = true;
        console.log(chalk.red(`  ✗ ${stage.name} - Failed here`));
        break;
      }
      console.log(chalk.green(`  ✓ ${stage.name}`));
    }
    
    if (foundFailed) {
      console.log(chalk.gray('\nRemaining stages:'));
      let pastFailed = false;
      for (const [id, stage] of this.stages) {
        if (pastFailed) {
          console.log(chalk.gray(`  - ${stage.name} (not reached)`));
        }
        if (id === failedStage) {
          pastFailed = true;
        }
      }
    }
  }
  
  /**
   * Complete the operation successfully
   */
  complete(message: string, details?: string[]) {
    if (this.spinner) {
      this.spinner.succeed(chalk.green('✨ ' + message));
    }
    
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    console.log(chalk.gray(`\nCompleted in ${this.formatTime(elapsed)}`));
    
    if (details && details.length > 0) {
      console.log(chalk.cyan('\nDetails:'));
      details.forEach(detail => {
        console.log(chalk.gray(`  • ${detail}`));
      });
    }
    
    this.emit('complete', {
      elapsed,
      timestamp: Date.now()
    });
  }
  
  /**
   * Show error with helpful context
   */
  error(message: string, hint?: string) {
    if (this.spinner) {
      this.spinner.fail(chalk.red(message));
    }
    
    if (hint) {
      console.log(chalk.yellow(`\n💡 ${hint}`));
    }
    
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    console.log(chalk.gray(`\nFailed after ${this.formatTime(elapsed)}`));
  }
  
  /**
   * Format time in a readable way
   */
  private formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  /**
   * Show real-time event stream
   */
  streamEvents(eventStream: EventEmitter) {
    console.log(chalk.cyan('\n📡 Live Event Stream\n'));
    console.log(chalk.gray('Listening for events... (Press Ctrl+C to stop)\n'));
    
    eventStream.on('event', (event: any) => {
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      const eventType = chalk.green(event.type);
      const eventId = chalk.gray(`#${event.id?.slice(0, 8)}`);
      
      console.log(`[${chalk.gray(timestamp)}] ${eventType} ${eventId}`);
      
      if (this.verbose && event.payload) {
        console.log(chalk.gray('  Payload:'), JSON.stringify(event.payload, null, 2));
      }
    });
    
    eventStream.on('error', (error: any) => {
      console.log(chalk.red(`[ERROR] ${error.message}`));
    });
  }
  
  /**
   * Show connection status with visual feedback
   */
  showConnectionStatus(components: {
    server: boolean;
    websocket: boolean;
    browser: boolean;
  }) {
    console.log(chalk.cyan('\n🚦 System Status\n'));
    
    const statusIcon = (connected: boolean) => connected ? chalk.green('✓') : chalk.red('✗');
    const statusText = (connected: boolean) => connected ? chalk.green('Connected') : chalk.red('Disconnected');
    
    console.log(`  ${statusIcon(components.server)} Server:    ${statusText(components.server)}`);
    console.log(`  ${statusIcon(components.websocket)} WebSocket: ${statusText(components.websocket)}`);
    console.log(`  ${statusIcon(components.browser)} Browser:   ${statusText(components.browser)}`);
    
    const allConnected = Object.values(components).every(v => v);
    
    if (allConnected) {
      console.log(chalk.green('\n✅ All systems operational!'));
    } else {
      console.log(chalk.yellow('\n⚠️  Some components are not connected'));
      console.log(chalk.gray('Run "semantest help" for troubleshooting'));
    }
  }
}

/**
 * Interactive progress reporter for complex operations
 */
export class InteractiveProgress {
  private feedback: FeedbackSystem;
  private stages: string[] = [];
  private currentIndex: number = 0;
  
  constructor(stages: string[], verbose: boolean = false) {
    this.feedback = new FeedbackSystem(verbose);
    this.stages = stages;
  }
  
  start(title: string) {
    this.feedback.startOperation(title);
    this.next();
  }
  
  next(message?: string) {
    if (this.currentIndex > 0) {
      this.feedback.updateStage(this.stages[this.currentIndex - 1], 'completed');
    }
    
    if (this.currentIndex < this.stages.length) {
      this.feedback.updateStage(this.stages[this.currentIndex], 'in-progress', message);
      this.currentIndex++;
    }
  }
  
  fail(message: string, hint?: string) {
    if (this.currentIndex > 0) {
      this.feedback.updateStage(this.stages[this.currentIndex - 1], 'failed', message);
    }
    if (hint) {
      console.log(chalk.yellow(`\n💡 ${hint}`));
    }
  }
  
  complete(message: string) {
    if (this.currentIndex > 0) {
      this.feedback.updateStage(this.stages[this.currentIndex - 1], 'completed');
    }
    this.feedback.complete(message);
  }
  
  update(message: string, detail?: string) {
    this.feedback.showLiveUpdate(message, detail);
  }
  
  progress(current: number, total: number, label?: string) {
    this.feedback.showProgress(current, total, label);
  }
}