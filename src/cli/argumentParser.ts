export interface ParsedArguments {
  prompt?: string;
  imagePath?: string;
  domain: string;
  serverUrl: string;
  help?: boolean;
}

const DEFAULT_SERVER_URL = 'http://localhost:8080';
const DEFAULT_DOMAIN = 'chatgpt.com';

export function parseArguments(args: string[]): ParsedArguments {
  const result: ParsedArguments = {
    serverUrl: DEFAULT_SERVER_URL,
    domain: DEFAULT_DOMAIN
  };

  // Skip first two arguments (node and script path)
  const cliArgs = args.slice(2);

  for (let i = 0; i < cliArgs.length; i++) {
    const arg = cliArgs[i];

    if (arg === '--help' || arg === '-h') {
      result.help = true;
      return result;
    }

    if (arg === '--prompt' || arg === '-p') {
      // Collect all words until the next flag
      const promptParts: string[] = [];
      let j = i + 1;
      
      while (j < cliArgs.length && !cliArgs[j].startsWith('-')) {
        promptParts.push(cliArgs[j]);
        j++;
      }
      
      if (promptParts.length === 0) {
        throw new Error('Prompt value is missing');
      }
      
      result.prompt = promptParts.join(' ');
      i = j - 1; // Update index to skip processed arguments
    }

    if (arg === '--image-path' || arg === '-i') {
      if (i + 1 >= cliArgs.length || cliArgs[i + 1].startsWith('-')) {
        throw new Error('Image path value is missing');
      }
      result.imagePath = cliArgs[++i];
    }

    if (arg === '--server' || arg === '-s') {
      if (i + 1 >= cliArgs.length || cliArgs[i + 1].startsWith('-')) {
        throw new Error('Server URL value is missing');
      }
      result.serverUrl = cliArgs[++i];
    }

    if (arg === '--domain' || arg === '-d') {
      if (i + 1 >= cliArgs.length || cliArgs[i + 1].startsWith('-')) {
        throw new Error('Domain value is missing');
      }
      result.domain = cliArgs[++i];
    }
  }

  // Validate required arguments if not asking for help
  if (!result.help) {
    if (!result.prompt) {
      throw new Error('Missing required argument: --prompt');
    }
    
    if (!result.imagePath) {
      throw new Error('Missing required argument: --image-path');
    }
  }

  return result;
}

export function getHelpText(): string {
  return `
SEMANTEST CLI - Send events to SEMANTEST server

Usage: semantest-cli [options]

Required Options:
  -p, --prompt <text>        The prompt for image generation
  -i, --image-path <path>    The path where the image should be saved

Optional Options:
  -d, --domain <domain>      Target domain (default: chatgpt.com)
  -s, --server <url>         Server URL (default: http://localhost:8080)
  -h, --help                 Display this help message

Examples:
  semantest-cli --prompt "A beautiful sunset" --image-path /output/sunset.png
  semantest-cli -p "A cat playing" -i /images/cat.png -d custom-ai.com
  semantest-cli -p "Test" -i /test.png -s http://api.example.com:3000

This is the SEMANTEST event-driven system for browser tab interaction!
`;
}