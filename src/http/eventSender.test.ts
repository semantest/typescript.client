import axios from 'axios';
import { EventSender } from './eventSender';
import { ImageGenerationRequestedEvent } from '../events/ImageGenerationRequestedEvent';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('EventSender', () => {
  let eventSender: EventSender;
  const serverUrl = 'http://localhost:8080';

  beforeEach(() => {
    eventSender = new EventSender(serverUrl);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create an instance with the provided server URL', () => {
      expect(eventSender).toBeDefined();
      expect(eventSender.getServerUrl()).toBe(serverUrl);
    });

    it('should handle server URL with trailing slash', () => {
      const sender = new EventSender('http://localhost:8080/');
      expect(sender.getServerUrl()).toBe('http://localhost:8080');
    });
  });

  describe('sendEvent', () => {
    it('should send event to the correct endpoint', async () => {
      const event = new ImageGenerationRequestedEvent(
        'Test prompt',
        '/test/path.png'
      );

      mockedAxios.post.mockResolvedValueOnce({
        data: { success: true, id: event.id },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      const result = await eventSender.sendEvent(event);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${serverUrl}/events`,
        event.toJSON(),
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
      expect(result.success).toBe(true);
      expect(result.id).toBe(event.id);
    });

    it('should handle successful response', async () => {
      const event = new ImageGenerationRequestedEvent(
        'Beautiful landscape',
        '/output/landscape.png'
      );

      mockedAxios.post.mockResolvedValueOnce({
        data: { success: true, id: event.id, message: 'Event received' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      const result = await eventSender.sendEvent(event);

      expect(result.success).toBe(true);
      expect(result.id).toBe(event.id);
      expect(result.message).toBe('Event received');
    });

    it('should handle network errors', async () => {
      const event = new ImageGenerationRequestedEvent(
        'Test prompt',
        '/test.png'
      );

      const networkError = new Error('Network Error');
      mockedAxios.post.mockRejectedValueOnce(networkError);

      await expect(eventSender.sendEvent(event)).rejects.toThrow('Failed to send event: Network Error');
    });

    it('should handle server errors with response', async () => {
      const event = new ImageGenerationRequestedEvent(
        'Test prompt',
        '/test.png'
      );

      const serverError = {
        response: {
          data: { error: 'Server error message' },
          status: 500,
          statusText: 'Internal Server Error'
        },
        message: 'Request failed with status code 500'
      };

      mockedAxios.post.mockRejectedValueOnce(serverError);

      await expect(eventSender.sendEvent(event)).rejects.toThrow('Server error (500): Server error message');
    });

    it('should handle server errors without detailed message', async () => {
      const event = new ImageGenerationRequestedEvent(
        'Test prompt',
        '/test.png'
      );

      const serverError = {
        response: {
          status: 503,
          statusText: 'Service Unavailable'
        },
        message: 'Request failed with status code 503'
      };

      mockedAxios.post.mockRejectedValueOnce(serverError);

      await expect(eventSender.sendEvent(event)).rejects.toThrow('Server error (503): Service Unavailable');
    });

    it('should include timeout in request', async () => {
      const event = new ImageGenerationRequestedEvent(
        'Test prompt',
        '/test.png'
      );

      mockedAxios.post.mockResolvedValueOnce({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      await eventSender.sendEvent(event);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        })
      );
    });
  });

  describe('validation', () => {
    it('should throw error if server URL is empty', () => {
      expect(() => new EventSender('')).toThrow('Server URL cannot be empty');
    });

    it('should throw error if server URL is invalid', () => {
      expect(() => new EventSender('not-a-url')).toThrow('Invalid server URL');
    });

    it('should accept valid HTTP URLs', () => {
      expect(() => new EventSender('http://example.com')).not.toThrow();
      expect(() => new EventSender('http://localhost:3000')).not.toThrow();
      expect(() => new EventSender('https://api.example.com')).not.toThrow();
    });
  });
});