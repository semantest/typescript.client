export interface CliArguments {
  prompt: string;
  imagePath: string;
  serverUrl: string;
}

export class CliArgumentParser {
  private readonly DEFAULT_SERVER_URL = 'http://localhost:8080';

  parse(): CliArguments {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
      this.displayHelp();
      process.exit(0);
    }

    const prompt = this.getArgValue(args, ['--prompt', '-p']);
    const imagePath = this.getArgValue(args, ['--image-path', '-i']);
    const serverUrl = this.getArgValue(args, ['--server', '-s']) || this.DEFAULT_SERVER_URL;

    if (!prompt) {
      throw new Error('Missing required argument: --prompt');
    }

    if (!imagePath) {
      throw new Error('Missing required argument: --image-path');
    }

    return {
      prompt,
      imagePath,
      serverUrl
    };
  }

  private getArgValue(args: string[], flags: string[]): string | null {
    for (const flag of flags) {
      const index = args.indexOf(flag);
      if (index !== -1 && index + 1 < args.length) {
        // Check if next arguments are part of the value (for multi-word values)
        let value = args[index + 1];
        let nextIndex = index + 2;
        
        // Continue collecting words until we hit another flag or end of args
        while (nextIndex < args.length && !args[nextIndex].startsWith('-')) {
          value += ' ' + args[nextIndex];
          nextIndex++;
        }
        
        return value;
      }
    }
    return null;
  }

  private displayHelp(): void {
    console.log(`
Usage: semantest-cli [OPTIONS]

Send an ImageGenerationRequestedEvent to an HTTP server.

OPTIONS:
  -p, --prompt <text>         The prompt for image generation (required)
  -i, --image-path <path>     The path where the image should be saved (required)
  -s, --server <url>          The server URL (default: ${this.DEFAULT_SERVER_URL})
  -h, --help                  Display this help message

EXAMPLES:
  semantest-cli --prompt "A sunset over mountains" --image-path /output/sunset.png
  semantest-cli -p "Abstract art" -i /tmp/art.png -s http://api.example.com
    `);
  }
}