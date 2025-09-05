import axios, { AxiosError } from 'axios';
import { ImageGenerationRequestedEvent } from '../events/ImageGenerationRequestedEvent';

export interface SendEventOptions {
  maxRetries?: number;
  retryDelay?: number;
}

export interface SendEventResponse {
  success: boolean;
  eventId?: string;
  message?: string;
  error?: string;
}

export class EventHttpClient {
  private serverUrl: string;

  constructor(serverUrl: string) {
    // Remove trailing slash if present
    this.serverUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
  }

  getServerUrl(): string {
    return this.serverUrl;
  }

  async sendEvent(
    event: ImageGenerationRequestedEvent,
    options: SendEventOptions = {}
  ): Promise<SendEventResponse> {
    const { maxRetries = 1, retryDelay = 1000 } = options;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await axios.post(
          `${this.serverUrl}/events`,
          event.toJSON(),
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 5000,
          }
        );

        return response.data;
      } catch (error) {
        lastError = this.handleError(error as AxiosError);
        
        // If it's the last attempt, throw the error
        if (attempt === maxRetries - 1) {
          if (maxRetries > 1) {
            throw new Error(`Failed to send event after ${maxRetries} retries: ${lastError.message}`);
          }
          throw lastError;
        }

        // Wait before retrying with exponential backoff
        await this.delay(retryDelay * Math.pow(2, attempt));
      }
    }

    // This should never be reached, but TypeScript needs it
    throw lastError || new Error('Failed to send event');
  }

  private handleError(error: AxiosError): Error {
    if (error.code === 'ECONNABORTED') {
      return new Error('Request timeout');
    }

    if (error.response) {
      return new Error(`Server responded with status ${error.response.status}`);
    }

    if (error.message) {
      return new Error(`Failed to send event: ${error.message}`);
    }

    return new Error('Failed to send event: Unknown error');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}