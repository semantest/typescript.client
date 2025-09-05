import { main } from './cli';
import { CliArgumentParser } from './CliArgumentParser';
import { EventHttpClient } from '../http/EventHttpClient';
import { ImageGenerationRequestedEvent } from '../events/ImageGenerationRequestedEvent';

jest.mock('./CliArgumentParser');
jest.mock('../http/EventHttpClient');
jest.mock('../events/ImageGenerationRequestedEvent');

describe('CLI', () => {
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;
  let mockProcessExit: jest.SpyInstance;

  beforeEach(() => {
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
    mockProcessExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('Process exit');
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    mockProcessExit.mockRestore();
  });

  it('should successfully send an event', async () => {
    const mockArgs = {
      prompt: 'Test prompt',
      imagePath: '/test.png',
      serverUrl: 'http://localhost:8080'
    };

    const mockEventId = 'test-event-id';
    
    (CliArgumentParser as jest.MockedClass<typeof CliArgumentParser>).prototype.parse
      .mockReturnValue(mockArgs);
    
    (ImageGenerationRequestedEvent as jest.MockedClass<typeof ImageGenerationRequestedEvent>)
      .mockImplementation(() => ({
        id: mockEventId,
        eventType: 'ImageGenerationRequested',
        prompt: mockArgs.prompt,
        imagePath: mockArgs.imagePath,
        timestamp: new Date(),
        toJSON: jest.fn().mockReturnValue({
          id: mockEventId,
          eventType: 'ImageGenerationRequested',
          prompt: mockArgs.prompt,
          imagePath: mockArgs.imagePath,
          timestamp: new Date().toISOString()
        })
      } as any));

    (EventHttpClient as jest.MockedClass<typeof EventHttpClient>).prototype.sendEvent
      .mockResolvedValue({
        success: true,
        eventId: mockEventId,
        message: 'Event received'
      });

    await expect(main()).rejects.toThrow('Process exit');

    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Semantest Image Generation CLI'));
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Test prompt'));
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('/test.png'));
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('http://localhost:8080'));
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Event sent successfully'));
    expect(mockProcessExit).toHaveBeenCalledWith(0);
  });

  it('should handle event sending failure', async () => {
    const mockArgs = {
      prompt: 'Test prompt',
      imagePath: '/test.png',
      serverUrl: 'http://localhost:8080'
    };

    (CliArgumentParser as jest.MockedClass<typeof CliArgumentParser>).prototype.parse
      .mockReturnValue(mockArgs);
    
    (ImageGenerationRequestedEvent as jest.MockedClass<typeof ImageGenerationRequestedEvent>)
      .mockImplementation(() => ({
        id: 'test-id',
        toJSON: jest.fn()
      } as any));

    (EventHttpClient as jest.MockedClass<typeof EventHttpClient>).prototype.sendEvent
      .mockRejectedValue(new Error('Network error'));

    await expect(main()).rejects.toThrow('Process exit');

    expect(mockConsoleError).toHaveBeenCalledWith('❌ Error:', 'Network error');
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  it('should handle argument parsing errors', async () => {
    (CliArgumentParser as jest.MockedClass<typeof CliArgumentParser>).prototype.parse
      .mockImplementation(() => {
        throw new Error('Missing required argument: --prompt');
      });

    await expect(main()).rejects.toThrow('Process exit');

    expect(mockConsoleError).toHaveBeenCalledWith('❌ Error:', 'Missing required argument: --prompt');
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });
});