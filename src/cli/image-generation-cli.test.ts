import { main } from './image-generation-cli';
import { EventSender } from '../http/eventSender';
import { ImageGenerationRequestedEvent } from '../events/ImageGenerationRequestedEvent';
import * as argumentParser from './argumentParser';

// Mock dependencies
jest.mock('../http/eventSender');
jest.mock('./argumentParser');

const mockedEventSender = EventSender as jest.MockedClass<typeof EventSender>;
const mockedParseArguments = argumentParser.parseArguments as jest.MockedFunction<typeof argumentParser.parseArguments>;
const mockedGetHelpText = argumentParser.getHelpText as jest.MockedFunction<typeof argumentParser.getHelpText>;

// Mock console methods
describe('Image Generation CLI Integration', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('main', () => {
    it('should successfully send an event with valid arguments', async () => {
      const mockArgs = {
        prompt: 'A beautiful sunset',
        imagePath: '/output/sunset.png',
        serverUrl: 'http://localhost:8080'
      };

      mockedParseArguments.mockReturnValue(mockArgs);
      
      const mockSendEvent = jest.fn().mockResolvedValue({
        success: true,
        id: 'test-id-123',
        message: 'Event received successfully'
      });

      mockedEventSender.prototype.sendEvent = mockSendEvent;

      await main(['node', 'cli.js', '--prompt', 'A beautiful sunset', '--image-path', '/output/sunset.png']);

      expect(mockedParseArguments).toHaveBeenCalledWith(['node', 'cli.js', '--prompt', 'A beautiful sunset', '--image-path', '/output/sunset.png']);
      expect(mockedEventSender).toHaveBeenCalledWith('http://localhost:8080');
      expect(mockSendEvent).toHaveBeenCalledWith(expect.any(ImageGenerationRequestedEvent));
      
      const eventArg = mockSendEvent.mock.calls[0][0];
      expect(eventArg.prompt).toBe('A beautiful sunset');
      expect(eventArg.imagePath).toBe('/output/sunset.png');
      
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('✅ Event sent successfully'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Event ID: test-id-123'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Message: Event received successfully'));
      expect(processExitSpy).not.toHaveBeenCalled();
    });

    it('should display help when --help flag is used', async () => {
      mockedParseArguments.mockReturnValue({
        help: true,
        serverUrl: 'http://localhost:8080'
      });

      mockedGetHelpText.mockReturnValue('Help text here');

      await main(['node', 'cli.js', '--help']);

      expect(consoleLogSpy).toHaveBeenCalledWith('Help text here');
      expect(mockedEventSender).not.toHaveBeenCalled();
      expect(processExitSpy).not.toHaveBeenCalled();
    });

    it('should handle network errors gracefully', async () => {
      const mockArgs = {
        prompt: 'Test prompt',
        imagePath: '/test.png',
        serverUrl: 'http://localhost:8080'
      };

      mockedParseArguments.mockReturnValue(mockArgs);
      
      const mockSendEvent = jest.fn().mockRejectedValue(new Error('Network Error: Connection refused'));
      mockedEventSender.prototype.sendEvent = mockSendEvent;

      await main(['node', 'cli.js', '--prompt', 'Test prompt', '--image-path', '/test.png']);

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('❌ Error sending event:'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Network Error: Connection refused'));
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle server errors gracefully', async () => {
      const mockArgs = {
        prompt: 'Test prompt',
        imagePath: '/test.png',
        serverUrl: 'http://localhost:8080'
      };

      mockedParseArguments.mockReturnValue(mockArgs);
      
      const mockSendEvent = jest.fn().mockRejectedValue(new Error('Server error (500): Internal Server Error'));
      mockedEventSender.prototype.sendEvent = mockSendEvent;

      await main(['node', 'cli.js', '--prompt', 'Test prompt', '--image-path', '/test.png']);

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('❌ Error sending event:'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Server error (500): Internal Server Error'));
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle argument parsing errors', async () => {
      mockedParseArguments.mockImplementation(() => {
        throw new Error('Missing required argument: --prompt');
      });

      await main(['node', 'cli.js', '--image-path', '/test.png']);

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('❌ Argument error:'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Missing required argument: --prompt'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Use --help for usage information'));
      expect(mockedEventSender).not.toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should use custom server URL when provided', async () => {
      const mockArgs = {
        prompt: 'Custom server test',
        imagePath: '/custom.png',
        serverUrl: 'http://api.example.com:3000'
      };

      mockedParseArguments.mockReturnValue(mockArgs);
      
      const mockSendEvent = jest.fn().mockResolvedValue({
        success: true,
        id: 'custom-id'
      });

      mockedEventSender.prototype.sendEvent = mockSendEvent;

      await main(['node', 'cli.js', '-p', 'Custom server test', '-i', '/custom.png', '-s', 'http://api.example.com:3000']);

      expect(mockedEventSender).toHaveBeenCalledWith('http://api.example.com:3000');
    });

    it('should display event details in console output', async () => {
      const mockArgs = {
        prompt: 'Detailed output test',
        imagePath: '/detail.png',
        serverUrl: 'http://localhost:8080'
      };

      mockedParseArguments.mockReturnValue(mockArgs);
      
      const mockSendEvent = jest.fn().mockResolvedValue({
        success: true,
        id: 'detail-id-456'
      });

      mockedEventSender.prototype.sendEvent = mockSendEvent;

      await main(['node', 'cli.js', '--prompt', 'Detailed output test', '--image-path', '/detail.png']);

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('📤 Sending image generation request...'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Prompt: Detailed output test'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Image Path: /detail.png'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Server: http://localhost:8080'));
    });
  });
});