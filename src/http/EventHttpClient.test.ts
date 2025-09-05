import axios from 'axios';
import { EventHttpClient } from './EventHttpClient';
import { ImageGenerationRequestedEvent } from '../events/ImageGenerationRequestedEvent';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('EventHttpClient', () => {
  let client: EventHttpClient;
  const serverUrl = 'http://localhost:8080';

  beforeEach(() => {
    client = new EventHttpClient(serverUrl);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create client with server URL', () => {
      expect(client).toBeDefined();
      expect(client.getServerUrl()).toBe(serverUrl);
    });

    it('should handle server URL with trailing slash', () => {
      const clientWithSlash = new EventHttpClient('http://localhost:8080/');
      expect(clientWithSlash.getServerUrl()).toBe('http://localhost:8080');
    });
  });

  describe('sendEvent', () => {
    it('should send event to correct endpoint', async () => {
      const event = new ImageGenerationRequestedEvent(
        'Test prompt',
        '/test/image.png'
      );

      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: { success: true, eventId: event.id }
      });

      const result = await client.sendEvent(event);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${serverUrl}/events`,
        event.toJSON(),
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        }
      );
      expect(result.success).toBe(true);
      expect(result.eventId).toBe(event.id);
    });

    it('should handle successful response', async () => {
      const event = new ImageGenerationRequestedEvent(
        'Success test',
        '/success.png'
      );

      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: { success: true, eventId: event.id, message: 'Event received' }
      });

      const result = await client.sendEvent(event);

      expect(result.success).toBe(true);
      expect(result.eventId).toBe(event.id);
      expect(result.message).toBe('Event received');
    });

    it('should handle network errors', async () => {
      const event = new ImageGenerationRequestedEvent(
        'Error test',
        '/error.png'
      );

      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      await expect(client.sendEvent(event)).rejects.toThrow('Failed to send event: Network error');
    });

    it('should handle server errors', async () => {
      const event = new ImageGenerationRequestedEvent(
        'Server error test',
        '/server-error.png'
      );

      const axiosError = {
        response: {
          status: 500,
          data: { error: 'Internal server error' }
        }
      };
      mockedAxios.post.mockRejectedValue(axiosError);

      await expect(client.sendEvent(event)).rejects.toThrow('Server responded with status 500');
    });

    it('should handle timeout', async () => {
      const event = new ImageGenerationRequestedEvent(
        'Timeout test',
        '/timeout.png'
      );

      const timeoutError = new Error('timeout of 5000ms exceeded');
      (timeoutError as any).code = 'ECONNABORTED';
      mockedAxios.post.mockRejectedValue(timeoutError);

      await expect(client.sendEvent(event)).rejects.toThrow('Request timeout');
    });

    it('should include event metadata in request', async () => {
      const event = new ImageGenerationRequestedEvent(
        'Metadata test',
        '/metadata.png'
      );

      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: { success: true }
      });

      await client.sendEvent(event);

      const sentData = mockedAxios.post.mock.calls[0][1];
      expect(sentData).toHaveProperty('id');
      expect(sentData).toHaveProperty('eventType', 'ImageGenerationRequested');
      expect(sentData).toHaveProperty('prompt', 'Metadata test');
      expect(sentData).toHaveProperty('imagePath', '/metadata.png');
      expect(sentData).toHaveProperty('timestamp');
    });
  });

  describe('retry logic', () => {
    it('should retry on failure with exponential backoff', async () => {
      const event = new ImageGenerationRequestedEvent(
        'Retry test',
        '/retry.png'
      );

      let attemptCount = 0;
      mockedAxios.post.mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.reject(new Error('Temporary failure'));
        }
        return Promise.resolve({
          status: 200,
          data: { success: true, eventId: event.id }
        });
      });

      const result = await client.sendEvent(event, { maxRetries: 3 });

      expect(mockedAxios.post).toHaveBeenCalledTimes(3);
      expect(result.success).toBe(true);
    });

    it('should fail after max retries', async () => {
      const event = new ImageGenerationRequestedEvent(
        'Max retry test',
        '/max-retry.png'
      );

      mockedAxios.post.mockRejectedValue(new Error('Persistent failure'));

      await expect(
        client.sendEvent(event, { maxRetries: 2 })
      ).rejects.toThrow('Failed to send event after 2 retries');

      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });
  });
});