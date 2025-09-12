import { parseArguments } from './argumentParser';

describe('CLI Argument Parser', () => {
  describe('parseArguments', () => {
    it('should parse prompt and image path from command line arguments', () => {
      const args = [
        'node',
        'cli.js',
        '--prompt',
        'A beautiful sunset',
        '--image-path',
        '/path/to/image.png'
      ];

      const result = parseArguments(args);

      expect(result.prompt).toBe('A beautiful sunset');
      expect(result.imagePath).toBe('/path/to/image.png');
    });

    it('should parse prompt with multiple words', () => {
      const args = [
        'node',
        'cli.js',
        '--prompt',
        'A cat playing with a ball in the garden',
        '--image-path',
        '/output/cat.png'
      ];

      const result = parseArguments(args);

      expect(result.prompt).toBe('A cat playing with a ball in the garden');
      expect(result.imagePath).toBe('/output/cat.png');
    });

    it('should parse server URL when provided', () => {
      const args = [
        'node',
        'cli.js',
        '--prompt',
        'Test prompt',
        '--image-path',
        '/test.png',
        '--server',
        'http://localhost:3000'
      ];

      const result = parseArguments(args);

      expect(result.prompt).toBe('Test prompt');
      expect(result.imagePath).toBe('/test.png');
      expect(result.serverUrl).toBe('http://localhost:3000');
    });

    it('should use default server URL when not provided', () => {
      const args = [
        'node',
        'cli.js',
        '--prompt',
        'Test prompt',
        '--image-path',
        '/test.png'
      ];

      const result = parseArguments(args);

      expect(result.serverUrl).toBe('http://localhost:8080');
    });

    it('should parse domain when provided', () => {
      const args = [
        'node',
        'cli.js',
        '--prompt',
        'Test prompt',
        '--image-path',
        '/test.png',
        '--domain',
        'custom-ai.com'
      ];

      const result = parseArguments(args);

      expect(result.domain).toBe('custom-ai.com');
    });

    it('should use default domain (chatgpt.com) when not provided', () => {
      const args = [
        'node',
        'cli.js',
        '--prompt',
        'Test prompt',
        '--image-path',
        '/test.png'
      ];

      const result = parseArguments(args);

      expect(result.domain).toBe('chatgpt.com');
    });

    it('should handle short flag for domain (-d)', () => {
      const args = [
        'node',
        'cli.js',
        '-p',
        'Test',
        '-i',
        '/test.png',
        '-d',
        'ai.example.com'
      ];

      const result = parseArguments(args);

      expect(result.domain).toBe('ai.example.com');
    });

    it('should throw error when prompt is missing', () => {
      const args = [
        'node',
        'cli.js',
        '--image-path',
        '/test.png'
      ];

      expect(() => parseArguments(args)).toThrow('Missing required argument: --prompt');
    });

    it('should throw error when image path is missing', () => {
      const args = [
        'node',
        'cli.js',
        '--prompt',
        'Test prompt'
      ];

      expect(() => parseArguments(args)).toThrow('Missing required argument: --image-path');
    });

    it('should handle short flags (-p for prompt, -i for image-path)', () => {
      const args = [
        'node',
        'cli.js',
        '-p',
        'Quick test',
        '-i',
        '/quick.png'
      ];

      const result = parseArguments(args);

      expect(result.prompt).toBe('Quick test');
      expect(result.imagePath).toBe('/quick.png');
    });

    it('should handle short flag for server (-s)', () => {
      const args = [
        'node',
        'cli.js',
        '-p',
        'Test',
        '-i',
        '/test.png',
        '-s',
        'http://example.com:3000'
      ];

      const result = parseArguments(args);

      expect(result.serverUrl).toBe('http://example.com:3000');
    });

    it('should display help when --help flag is present', () => {
      const args = ['node', 'cli.js', '--help'];

      const result = parseArguments(args);

      expect(result.help).toBe(true);
    });

    it('should display help when -h flag is present', () => {
      const args = ['node', 'cli.js', '-h'];

      const result = parseArguments(args);

      expect(result.help).toBe(true);
    });
  });
});