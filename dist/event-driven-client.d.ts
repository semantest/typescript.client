import { DomainEvent, EventResponse, ClientConfig, ProjectSelected, ProjectSelectionFailed, ChatSelected, ChatSelectionFailed, PromptSubmitted, PromptSubmissionFailed, ResponseRetrieved, ResponseRetrievalFailed, FileDownloadStarted, FileDownloadFailed, TrainingModeEnabled, AutomationPatternListProvided } from './types';
export declare class EventDrivenWebBuddyClient {
    private config;
    constructor(config: ClientConfig);
    sendEvent<TEvent extends DomainEvent, TResponse extends EventResponse>(event: TEvent, extensionId: string, tabId: number): Promise<TResponse>;
    sendEvents<TResponse extends EventResponse>(events: Array<{
        event: DomainEvent;
        extensionId: string;
        tabId: number;
    }>, options?: {
        parallel?: boolean;
        stopOnError?: boolean;
    }): Promise<TResponse[]>;
    requestProjectSelection(extensionId: string, tabId: number, projectName: string, options?: {
        selector?: string;
    }): Promise<ProjectSelected | ProjectSelectionFailed>;
    requestChatSelection(extensionId: string, tabId: number, chatTitle: string, options?: {
        selector?: string;
    }): Promise<ChatSelected | ChatSelectionFailed>;
    requestPromptSubmission(extensionId: string, tabId: number, promptText: string, options?: {
        selector?: string;
    }): Promise<PromptSubmitted | PromptSubmissionFailed>;
    requestResponseRetrieval(extensionId: string, tabId: number, options?: {
        selector?: string;
        timeout?: number;
    }): Promise<ResponseRetrieved | ResponseRetrievalFailed>;
    requestFileDownload(extensionId: string, tabId: number, url: string, options?: {
        filename?: string;
        conflictAction?: 'uniquify' | 'overwrite' | 'prompt';
        saveAs?: boolean;
    }): Promise<FileDownloadStarted | FileDownloadFailed>;
    requestTrainingMode(website: string): Promise<TrainingModeEnabled>;
    requestAutomationPatterns(filters?: {
        website?: string;
        messageType?: string;
        confidenceThreshold?: number;
    }): Promise<AutomationPatternListProvided>;
    executeFullChatGPTWorkflow(extensionId: string, tabId: number, workflow: {
        projectName: string;
        promptText: string;
        chatTitle?: string;
    }): Promise<{
        projectSelection: ProjectSelected | ProjectSelectionFailed;
        chatSelection?: ChatSelected | ChatSelectionFailed;
        promptSubmission: PromptSubmitted | PromptSubmissionFailed;
        responseRetrieval: ResponseRetrieved | ResponseRetrievalFailed;
    }>;
    ping(): Promise<{
        success: boolean;
        latency: number;
    }>;
    getConfig(): ClientConfig;
    updateConfig(updates: Partial<ClientConfig>): void;
    private generateCorrelationId;
    private mapEventToAction;
    private extractEventPayload;
    private makeRequest;
    private fetchWithRetry;
    private waitForEventResponse;
    private sendTrainingEvent;
    private getTrainingEndpoint;
    private delay;
}
export declare class EventSendError extends Error {
    readonly event: DomainEvent;
    readonly cause?: Error | undefined;
    constructor(message: string, event: DomainEvent, cause?: Error | undefined);
}
export declare class WorkflowError extends Error {
    readonly partialResults: any;
    constructor(message: string, partialResults: any);
}
export default EventDrivenWebBuddyClient;
//# sourceMappingURL=event-driven-client.d.ts.map