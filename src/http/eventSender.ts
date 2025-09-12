import axios, { AxiosError } from 'axios';
import { ImageGenerationRequestedEvent } from '../events/ImageGenerationRequestedEvent';

export interface EventResponse {
  success: boolean;
  id?: string;
  message?: string;
  error?: string;
}

export class EventSender {
  private serverUrl: string;
  private readonly timeout = 30000; // 30 seconds

  constructor(serverUrl: string) {
    if (!serverUrl || serverUrl.trim() === '') {
      throw new Error('Server URL cannot be empty');
    }

    // Validate URL format
    try {
      new URL(serverUrl);
    } catch {
      throw new Error('Invalid server URL');
    }

    // Remove trailing slash if present
    this.serverUrl = serverUrl.replace(/\/$/, '');
  }

  getServerUrl(): string {
    return this.serverUrl;
  }

  async sendEvent(event: ImageGenerationRequestedEvent): Promise<EventResponse> {
    const endpoint = `${this.serverUrl}/events`;
    
    try {
      const response = await axios.post<EventResponse>(
        endpoint,
        event.toJSON(),
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: this.timeout
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const errorMessage = error.response.data?.error || error.response.statusText;
        throw new Error(`Server error (${status}): ${errorMessage}`);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error(`Failed to send event: ${error.message}`);
      } else {
        // Generic error
        throw new Error(`Failed to send event: ${error.message || 'Unknown error'}`);
      }
    }
  }
}