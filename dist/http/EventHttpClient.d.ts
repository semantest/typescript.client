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
export declare class EventHttpClient {
    private serverUrl;
    constructor(serverUrl: string);
    getServerUrl(): string;
    sendEvent(event: ImageGenerationRequestedEvent, options?: SendEventOptions): Promise<SendEventResponse>;
    private handleError;
    private delay;
}
//# sourceMappingURL=EventHttpClient.d.ts.map