import { CliArgumentParser } from './CliArgumentParser';

describe('CliArgumentParser', () => {
  let originalArgv: string[];

  beforeEach(() => {
    originalArgv = process.argv;
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  describe('parse', () => {
    it('should parse prompt and image path from command line arguments', () => {
      process.argv = [
        'node',
        'cli.js',
        '--prompt',
        'A beautiful landscape',
        '--image-path',
        '/output/landscape.png'
      ];

      const parser = new CliArgumentParser();
      const args = parser.parse();

      expect(args.prompt).toBe('A beautiful landscape');
      expect(args.imagePath).toBe('/output/landscape.png');
    });

    it('should parse server URL when provided', () => {
      process.argv = [
        'node',
        'cli.js',
        '--prompt',
        'Test prompt',
        '--image-path',
        '/test.png',
        '--server',
        'http://localhost:3000'
      ];

      const parser = new CliArgumentParser();
      const args = parser.parse();

      expect(args.serverUrl).toBe('http://localhost:3000');
    });

    it('should use default server URL when not provided', () => {
      process.argv = [
        'node',
        'cli.js',
        '--prompt',
        'Test prompt',
        '--image-path',
        '/test.png'
      ];

      const parser = new CliArgumentParser();
      const args = parser.parse();

      expect(args.serverUrl).toBe('http://localhost:8080');
    });

    it('should handle short flags', () => {
      process.argv = [
        'node',
        'cli.js',
        '-p',
        'Short prompt',
        '-i',
        '/short.png',
        '-s',
        'http://example.com'
      ];

      const parser = new CliArgumentParser();
      const args = parser.parse();

      expect(args.prompt).toBe('Short prompt');
      expect(args.imagePath).toBe('/short.png');
      expect(args.serverUrl).toBe('http://example.com');
    });

    it('should throw error when prompt is missing', () => {
      process.argv = [
        'node',
        'cli.js',
        '--image-path',
        '/test.png'
      ];

      const parser = new CliArgumentParser();
      
      expect(() => parser.parse()).toThrow('Missing required argument: --prompt');
    });

    it('should throw error when image path is missing', () => {
      process.argv = [
        'node',
        'cli.js',
        '--prompt',
        'Test prompt'
      ];

      const parser = new CliArgumentParser();
      
      expect(() => parser.parse()).toThrow('Missing required argument: --image-path');
    });

    it('should handle multi-word prompts', () => {
      process.argv = [
        'node',
        'cli.js',
        '--prompt',
        'A very complex prompt with multiple words',
        '--image-path',
        '/output.png'
      ];

      const parser = new CliArgumentParser();
      const args = parser.parse();

      expect(args.prompt).toBe('A very complex prompt with multiple words');
    });

    it('should display help when --help flag is provided', () => {
      process.argv = ['node', 'cli.js', '--help'];
      
      const parser = new CliArgumentParser();
      const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit');
      });

      expect(() => parser.parse()).toThrow('Process exit');
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
      
      mockConsoleLog.mockRestore();
      mockExit.mockRestore();
    });
  });
});