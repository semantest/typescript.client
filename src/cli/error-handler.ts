import chalk from 'chalk';

/**
 * Error Handler following "Badass Users" philosophy
 * Errors are learning opportunities, not failures
 */

export interface ErrorContext {
  command?: string;
  options?: Record<string, any>;
  systemState?: {
    serverRunning?: boolean;
    websocketConnected?: boolean;
    browserExtensionActive?: boolean;
  };
}

export class UserFriendlyError extends Error {
  public readonly title: string;
  public readonly hint: string;
  public readonly learnMore?: string;
  public readonly context?: ErrorContext;
  
  constructor(
    title: string,
    message: string,
    hint: string,
    learnMore?: string,
    context?: ErrorContext
  ) {
    super(message);
    this.title = title;
    this.hint = hint;
    this.learnMore = learnMore;
    this.context = context;
    this.name = 'UserFriendlyError';
  }
}

export class ErrorHandler {
  private static readonly ERROR_PATTERNS = new Map<string, (error: any, context?: ErrorContext) => UserFriendlyError>([
    ['ECONNREFUSED', (error, context) => new UserFriendlyError(
      'Cannot connect to server',
      `The SEMANTEST server at ${error.address || 'localhost'}:${error.port || '8080'} is not responding.`,
      'Start the server first with: npm run server',
      'The server manages communication between the CLI and browser extension.',
      context
    )],
    
    ['ETIMEDOUT', (error, context) => new UserFriendlyError(
      'Request timed out',
      'The server took too long to respond. This might happen with complex prompts or when the server is busy.',
      'Try again with a longer timeout: --timeout 600',
      'Timeouts help prevent hanging requests. Default is 30 seconds.',
      context
    )],
    
    ['ENOTFOUND', (error, context) => new UserFriendlyError(
      'Server not found',
      `Cannot find server at ${error.hostname || 'the specified address'}.`,
      'Check the server URL. Default is: http://localhost:8080',
      'Use --server to specify a custom server URL.',
      context
    )],
    
    ['WebSocket', (error, context) => new UserFriendlyError(
      'WebSocket connection issue',
      'The real-time connection to the browser extension is not working.',
      'Make sure:\n  1. The server is running (npm run server)\n  2. The browser extension is installed and active\n  3. You have a browser tab open on the target domain',
      'WebSockets enable real-time communication between CLI, server, and browser.',
      context
    )],
    
    ['BrowserExtension', (error, context) => new UserFriendlyError(
      'Browser extension not responding',
      'The browser extension is not connected or not responding to events.',
      'Check that:\n  1. The extension is installed in your browser\n  2. The extension is enabled\n  3. You have a tab open on chatgpt.com (or your target domain)',
      'The browser extension executes commands in web pages.',
      context
    )],
    
    ['InvalidPrompt', (error, context) => new UserFriendlyError(
      'Invalid prompt',
      'The prompt you provided seems to be invalid or empty.',
      'Provide a descriptive prompt: semantest generate "a beautiful sunset" --output sunset.png',
      'Good prompts are specific and descriptive.',
      context
    )],
    
    ['OutputPath', (error, context) => new UserFriendlyError(
      'Cannot write to output path',
      `Cannot save the image to: ${error.path}`,
      'Make sure:\n  1. The directory exists\n  2. You have write permissions\n  3. There\'s enough disk space',
      'Use an absolute path or create the directory first.',
      context
    )],
    
    ['QueueFull', (error, context) => new UserFriendlyError(
      'Request queue is full',
      'Too many requests are waiting to be processed.',
      'Wait a moment and try again, or use --queue-strategy priority for important requests',
      'The queue prevents server overload. Premium users get priority.',
      context
    )]
  ]);
  
  /**
   * Convert any error into a user-friendly error with helpful context
   */
  static handle(error: any, context?: ErrorContext): UserFriendlyError {
    // Check if it's already a user-friendly error
    if (error instanceof UserFriendlyError) {
      return error;
    }
    
    // Try to match error patterns
    for (const [pattern, handler] of this.ERROR_PATTERNS) {
      if (error.code === pattern || error.message?.includes(pattern)) {
        return handler(error, context);
      }
    }
    
    // Generic error handling with helpful defaults
    return new UserFriendlyError(
      'Unexpected error',
      error.message || 'An unknown error occurred',
      'Try running with --verbose for more details, or check the logs',
      'If this persists, report it at: https://github.com/semantest/issues',
      context
    );
  }
  
  /**
   * Display error in a user-friendly way
   */
  static display(error: UserFriendlyError, verbose: boolean = false): void {
    console.error('');
    console.error(chalk.red(`❌ ${error.title}`));
    console.error(chalk.gray(`   ${error.message}`));
    console.error('');
    console.error(chalk.yellow(`💡 How to fix:`));
    error.hint.split('\n').forEach(line => {
      console.error(chalk.yellow(`   ${line}`));
    });
    
    if (error.learnMore) {
      console.error('');
      console.error(chalk.cyan(`📚 Learn more:`));
      console.error(chalk.gray(`   ${error.learnMore}`));
    }
    
    if (verbose && error.context) {
      console.error('');
      console.error(chalk.gray('Debug information:'));
      console.error(chalk.gray(JSON.stringify(error.context, null, 2)));
    }
    
    // Suggest next steps based on error type
    console.error('');
    console.error(chalk.green('Next steps:'));
    
    if (error.title.includes('connect') || error.title.includes('server')) {
      console.error(chalk.gray('  1. Start the server: npm run server'));
      console.error(chalk.gray('  2. Check server status: semantest status'));
      console.error(chalk.gray('  3. Try your command again'));
    } else if (error.title.includes('extension')) {
      console.error(chalk.gray('  1. Install the browser extension'));
      console.error(chalk.gray('  2. Open a browser tab on your target site'));
      console.error(chalk.gray('  3. Check connection: semantest status'));
    } else {
      console.error(chalk.gray('  1. Check the error message above'));
      console.error(chalk.gray('  2. Run: semantest help --advanced'));
      console.error(chalk.gray('  3. Visit docs: https://semantest.dev/docs'));
    }
  }
  
  /**
   * Provide contextual help based on what the user was trying to do
   */
  static getContextualHelp(command: string, error: Error): string[] {
    const helps: string[] = [];
    
    if (command === 'generate') {
      helps.push('semantest generate "prompt" --output file.png');
      helps.push('Make sure the server is running first');
      helps.push('Check that the browser extension is active');
    } else if (command === 'events') {
      helps.push('semantest events --follow  # Watch events');
      helps.push('The server must be running to see events');
    } else if (command === 'status') {
      helps.push('semantest status  # Check system health');
      helps.push('This shows if all components are working');
    }
    
    return helps;
  }
}

/**
 * Common error scenarios with solutions
 */
export const ERROR_SOLUTIONS = {
  'Server not running': {
    symptoms: ['ECONNREFUSED', 'Cannot connect'],
    solution: 'npm run server',
    explanation: 'The server bridges CLI and browser'
  },
  'Extension not installed': {
    symptoms: ['No browser connection', 'Extension not found'],
    solution: 'Install browser extension from Chrome Web Store',
    explanation: 'The extension executes commands in web pages'
  },
  'Wrong domain': {
    symptoms: ['No tab found', 'Domain mismatch'],
    solution: 'Open target website in browser or use --domain',
    explanation: 'Commands are sent to specific domains'
  },
  'Rate limited': {
    symptoms: ['429', 'Too many requests'],
    solution: 'Wait 60 seconds or upgrade to premium',
    explanation: 'Rate limits prevent abuse'
  }
};