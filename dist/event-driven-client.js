"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowError = exports.EventSendError = exports.EventDrivenWebBuddyClient = void 0;
const types_1 = require("./types");
class EventDrivenWebBuddyClient {
    constructor(config) {
        this.config = {
            timeout: 30000,
            retries: 3,
            ...config
        };
    }
    async sendEvent(event, extensionId, tabId) {
        const correlationId = event.correlationId || this.generateCorrelationId();
        try {
            const dispatchPayload = {
                target: {
                    extensionId,
                    tabId
                },
                message: {
                    action: this.mapEventToAction(event),
                    payload: this.extractEventPayload(event),
                    correlationId
                }
            };
            await this.makeRequest('POST', '/api/dispatch', dispatchPayload);
            return await this.waitForEventResponse(correlationId);
        }
        catch (error) {
            throw new EventSendError(`Failed to send event ${event.constructor.name}: ${error instanceof Error ? error.message : String(error)}`, event, error instanceof Error ? error : undefined);
        }
    }
    async sendEvents(events, options) {
        const { parallel = false, stopOnError = true } = options || {};
        if (parallel) {
            const promises = events.map(({ event, extensionId, tabId }) => this.sendEvent(event, extensionId, tabId));
            return await Promise.all(promises);
        }
        else {
            const results = [];
            for (const { event, extensionId, tabId } of events) {
                try {
                    const result = await this.sendEvent(event, extensionId, tabId);
                    results.push(result);
                }
                catch (error) {
                    if (stopOnError) {
                        throw error;
                    }
                    console.warn(`Event ${event.constructor.name} failed:`, error);
                }
            }
            return results;
        }
    }
    async requestProjectSelection(extensionId, tabId, projectName, options) {
        const event = new types_1.ProjectSelectionRequested(projectName, options?.selector, this.generateCorrelationId());
        return await this.sendEvent(event, extensionId, tabId);
    }
    async requestChatSelection(extensionId, tabId, chatTitle, options) {
        const event = new types_1.ChatSelectionRequested(chatTitle, options?.selector, this.generateCorrelationId());
        return await this.sendEvent(event, extensionId, tabId);
    }
    async requestPromptSubmission(extensionId, tabId, promptText, options) {
        const event = new types_1.PromptSubmissionRequested(promptText, options?.selector || '#prompt-textarea', this.generateCorrelationId());
        return await this.sendEvent(event, extensionId, tabId);
    }
    async requestResponseRetrieval(extensionId, tabId, options) {
        const event = new types_1.ResponseRetrievalRequested(options?.selector || '[data-message-author-role="assistant"]', options?.timeout || 30000, this.generateCorrelationId());
        return await this.sendEvent(event, extensionId, tabId);
    }
    async requestFileDownload(extensionId, tabId, url, options) {
        const event = new types_1.FileDownloadRequested(url, options?.filename, options?.conflictAction, options?.saveAs, this.generateCorrelationId());
        return await this.sendEvent(event, extensionId, tabId);
    }
    async requestTrainingMode(website) {
        const event = new types_1.TrainingModeRequested(website, this.generateCorrelationId());
        return await this.sendTrainingEvent(event);
    }
    async requestAutomationPatterns(filters) {
        const event = new types_1.AutomationPatternListRequested(filters, this.generateCorrelationId());
        return await this.sendTrainingEvent(event);
    }
    async executeFullChatGPTWorkflow(extensionId, tabId, workflow) {
        const results = {};
        results.projectSelection = await this.requestProjectSelection(extensionId, tabId, workflow.projectName);
        if (results.projectSelection instanceof types_1.ProjectSelectionFailed) {
            throw new WorkflowError('Project selection failed', results);
        }
        if (workflow.chatTitle) {
            results.chatSelection = await this.requestChatSelection(extensionId, tabId, workflow.chatTitle);
            if (results.chatSelection instanceof types_1.ChatSelectionFailed) {
                throw new WorkflowError('Chat selection failed', results);
            }
        }
        results.promptSubmission = await this.requestPromptSubmission(extensionId, tabId, workflow.promptText);
        if (results.promptSubmission instanceof types_1.PromptSubmissionFailed) {
            throw new WorkflowError('Prompt submission failed', results);
        }
        results.responseRetrieval = await this.requestResponseRetrieval(extensionId, tabId);
        return results;
    }
    async ping() {
        const start = Date.now();
        try {
            await this.makeRequest('GET', '/docs/health');
            return {
                success: true,
                latency: Date.now() - start
            };
        }
        catch (error) {
            return {
                success: false,
                latency: Date.now() - start
            };
        }
    }
    getConfig() {
        return { ...this.config };
    }
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
    }
    generateCorrelationId() {
        return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    mapEventToAction(event) {
        const eventTypeMap = {
            'ProjectSelectionRequested': 'SELECT_PROJECT',
            'ChatSelectionRequested': 'SELECT_CHAT',
            'PromptSubmissionRequested': 'FILL_PROMPT',
            'ResponseRetrievalRequested': 'GET_RESPONSE',
            'FileDownloadRequested': 'DOWNLOAD_FILE'
        };
        const action = eventTypeMap[event.constructor.name];
        if (!action) {
            throw new Error(`No action mapping found for event type: ${event.constructor.name}`);
        }
        return action;
    }
    extractEventPayload(event) {
        if (event instanceof types_1.ProjectSelectionRequested) {
            return {
                selector: event.selector || `[data-project-name="${event.projectName}"]`
            };
        }
        if (event instanceof types_1.PromptSubmissionRequested) {
            return {
                selector: event.selector,
                value: event.promptText
            };
        }
        if (event instanceof types_1.FileDownloadRequested) {
            return {
                url: event.url,
                filename: event.filename,
                conflictAction: event.conflictAction,
                saveAs: event.saveAs
            };
        }
        return Object.fromEntries(Object.entries(event).filter(([key]) => key !== 'correlationId'));
    }
    async makeRequest(method, endpoint, data) {
        const url = `${this.config.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
            'User-Agent': this.config.userAgent || 'WebBuddyEventDrivenSDK/1.0.0'
        };
        const options = {
            method,
            headers,
            body: data ? JSON.stringify(data) : null
        };
        const response = await this.fetchWithRetry(url, options);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    }
    async fetchWithRetry(url, options) {
        let lastError;
        for (let attempt = 0; attempt < (this.config.retries || 3); attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.config.timeout || 30000);
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                return response;
            }
            catch (error) {
                lastError = error;
                if (attempt < (this.config.retries || 3) - 1) {
                    await this.delay(Math.pow(2, attempt) * 1000);
                }
            }
        }
        throw lastError;
    }
    async waitForEventResponse(correlationId) {
        return await new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    correlationId,
                    success: true,
                    timestamp: new Date()
                });
            }, 100);
        });
    }
    async sendTrainingEvent(event) {
        const endpoint = this.getTrainingEndpoint(event);
        const payload = this.extractEventPayload(event);
        const response = await this.makeRequest('POST', endpoint, payload);
        return response;
    }
    getTrainingEndpoint(event) {
        if (event instanceof types_1.TrainingModeRequested) {
            return '/api/training/enable';
        }
        if (event instanceof types_1.AutomationPatternListRequested) {
            return '/api/training/patterns';
        }
        throw new Error(`No training endpoint for event: ${event.constructor.name}`);
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.EventDrivenWebBuddyClient = EventDrivenWebBuddyClient;
class EventSendError extends Error {
    constructor(message, event, cause) {
        super(message);
        this.event = event;
        this.cause = cause;
        this.name = 'EventSendError';
    }
}
exports.EventSendError = EventSendError;
class WorkflowError extends Error {
    constructor(message, partialResults) {
        super(message);
        this.partialResults = partialResults;
        this.name = 'WorkflowError';
    }
}
exports.WorkflowError = WorkflowError;
exports.default = EventDrivenWebBuddyClient;
//# sourceMappingURL=event-driven-client.js.map