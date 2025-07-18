"use strict";
/*
                        Web-Buddy Framework
                        Event-Driven TypeScript Client

    Copyright (C) 2025-today  rydnr@acm-sl.org

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowError = exports.EventSendError = exports.EventDrivenWebBuddyClient = void 0;
const types_1 = require("./types");
/**
 * Event-Driven Web-Buddy Client
 *
 * Pure event-driven interface following the Web-Buddy Framework's EDA principles.
 * All operations are performed by sending domain events and receiving event responses.
 */
class EventDrivenWebBuddyClient {
    constructor(config) {
        this.eventQueue = new Map();
        this.config = Object.assign({ timeout: 30000, retries: 3 }, config);
    }
    // === Core Event Sending Interface ===
    /**
     * Sends a domain event and waits for response
     * This is the low-level interface that all other methods use
     */
    sendEvent(event, extensionId, tabId) {
        return __awaiter(this, void 0, void 0, function* () {
            const correlationId = event.correlationId || this.generateCorrelationId();
            try {
                // Create the dispatch payload in Web-Buddy format
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
                // Send HTTP request to server
                const response = yield this.makeRequest('POST', '/api/dispatch', dispatchPayload);
                // Wait for and return the event response
                return yield this.waitForEventResponse(correlationId);
            }
            catch (error) {
                throw new EventSendError(`Failed to send event ${event.constructor.name}: ${error.message}`, event, error);
            }
        });
    }
    /**
     * Sends multiple events in sequence
     */
    sendEvents(events, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { parallel = false, stopOnError = true } = options || {};
            if (parallel) {
                const promises = events.map(({ event, extensionId, tabId }) => this.sendEvent(event, extensionId, tabId));
                return yield Promise.all(promises);
            }
            else {
                const results = [];
                for (const { event, extensionId, tabId } of events) {
                    try {
                        const result = yield this.sendEvent(event, extensionId, tabId);
                        results.push(result);
                    }
                    catch (error) {
                        if (stopOnError) {
                            throw error;
                        }
                        // Continue with next event if not stopping on error
                        console.warn(`Event ${event.constructor.name} failed:`, error);
                    }
                }
                return results;
            }
        });
    }
    // === High-Level Convenience Methods ===
    // These provide a more user-friendly interface while maintaining event-driven architecture
    /**
     * Requests ChatGPT project selection
     */
    requestProjectSelection(extensionId, tabId, projectName, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = new types_1.ProjectSelectionRequested(projectName, options === null || options === void 0 ? void 0 : options.selector, this.generateCorrelationId());
            return yield this.sendEvent(event, extensionId, tabId);
        });
    }
    /**
     * Requests chat selection
     */
    requestChatSelection(extensionId, tabId, chatTitle, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = new types_1.ChatSelectionRequested(chatTitle, options === null || options === void 0 ? void 0 : options.selector, this.generateCorrelationId());
            return yield this.sendEvent(event, extensionId, tabId);
        });
    }
    /**
     * Requests prompt submission
     */
    requestPromptSubmission(extensionId, tabId, promptText, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = new types_1.PromptSubmissionRequested(promptText, (options === null || options === void 0 ? void 0 : options.selector) || '#prompt-textarea', this.generateCorrelationId());
            return yield this.sendEvent(event, extensionId, tabId);
        });
    }
    /**
     * Requests response retrieval from ChatGPT
     */
    requestResponseRetrieval(extensionId, tabId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = new types_1.ResponseRetrievalRequested((options === null || options === void 0 ? void 0 : options.selector) || '[data-message-author-role="assistant"]', (options === null || options === void 0 ? void 0 : options.timeout) || 30000, this.generateCorrelationId());
            return yield this.sendEvent(event, extensionId, tabId);
        });
    }
    /**
     * Requests file download
     */
    requestFileDownload(extensionId, tabId, url, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = new types_1.FileDownloadRequested(url, options === null || options === void 0 ? void 0 : options.filename, options === null || options === void 0 ? void 0 : options.conflictAction, options === null || options === void 0 ? void 0 : options.saveAs, this.generateCorrelationId());
            return yield this.sendEvent(event, extensionId, tabId);
        });
    }
    /**
     * Requests training mode activation
     */
    requestTrainingMode(website) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = new types_1.TrainingModeRequested(website, this.generateCorrelationId());
            // Training mode requests go directly to server, not through extension
            return yield this.sendTrainingEvent(event);
        });
    }
    /**
     * Requests automation pattern list
     */
    requestAutomationPatterns(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = new types_1.AutomationPatternListRequested(filters, this.generateCorrelationId());
            return yield this.sendTrainingEvent(event);
        });
    }
    // === Workflow Convenience Methods ===
    /**
     * Complete ChatGPT workflow: select project, submit prompt, get response
     */
    executeFullChatGPTWorkflow(extensionId, tabId, workflow) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = {};
            // Step 1: Select project
            results.projectSelection = yield this.requestProjectSelection(extensionId, tabId, workflow.projectName);
            if (results.projectSelection instanceof types_1.ProjectSelectionFailed) {
                throw new WorkflowError('Project selection failed', results);
            }
            // Step 2: Select chat (optional)
            if (workflow.chatTitle) {
                results.chatSelection = yield this.requestChatSelection(extensionId, tabId, workflow.chatTitle);
                if (results.chatSelection instanceof types_1.ChatSelectionFailed) {
                    throw new WorkflowError('Chat selection failed', results);
                }
            }
            // Step 3: Submit prompt
            results.promptSubmission = yield this.requestPromptSubmission(extensionId, tabId, workflow.promptText);
            if (results.promptSubmission instanceof types_1.PromptSubmissionFailed) {
                throw new WorkflowError('Prompt submission failed', results);
            }
            // Step 4: Get response
            results.responseRetrieval = yield this.requestResponseRetrieval(extensionId, tabId);
            return results;
        });
    }
    // === Utility Methods ===
    /**
     * Tests connectivity with a simple ping event
     */
    ping() {
        return __awaiter(this, void 0, void 0, function* () {
            const start = Date.now();
            try {
                yield this.makeRequest('GET', '/docs/health');
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
        });
    }
    /**
     * Gets client configuration
     */
    getConfig() {
        return Object.assign({}, this.config);
    }
    /**
     * Updates client configuration
     */
    updateConfig(updates) {
        this.config = Object.assign(Object.assign({}, this.config), updates);
    }
    // === Private Helper Methods ===
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
        // Extract payload based on event type
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
        // Default payload extraction
        return Object.fromEntries(Object.entries(event).filter(([key]) => key !== 'correlationId'));
    }
    makeRequest(method, endpoint, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.config.baseUrl}${endpoint}`;
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`,
                'User-Agent': this.config.userAgent || 'WebBuddyEventDrivenSDK/1.0.0'
            };
            const options = {
                method,
                headers,
                body: data ? JSON.stringify(data) : undefined
            };
            const response = yield this.fetchWithRetry(url, options);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return yield response.json();
        });
    }
    fetchWithRetry(url, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let lastError;
            for (let attempt = 0; attempt < (this.config.retries || 3); attempt++) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout || 30000);
                    const response = yield fetch(url, Object.assign(Object.assign({}, options), { signal: controller.signal }));
                    clearTimeout(timeoutId);
                    return response;
                }
                catch (error) {
                    lastError = error;
                    if (attempt < (this.config.retries || 3) - 1) {
                        yield this.delay(Math.pow(2, attempt) * 1000);
                    }
                }
            }
            throw lastError;
        });
    }
    waitForEventResponse(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            // In a real implementation, this would listen for WebSocket responses
            // or poll for the response. For now, we'll simulate immediate response.
            // This is a placeholder - in the real implementation, this would:
            // 1. Listen on WebSocket for responses with matching correlationId
            // 2. Or poll a /api/responses/{correlationId} endpoint
            // 3. Or use Server-Sent Events for real-time updates
            return yield new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        correlationId,
                        success: true,
                        timestamp: new Date()
                    });
                }, 100);
            });
        });
    }
    sendTrainingEvent(event) {
        return __awaiter(this, void 0, void 0, function* () {
            // Training events go to specific training endpoints
            const endpoint = this.getTrainingEndpoint(event);
            const payload = this.extractEventPayload(event);
            const response = yield this.makeRequest('POST', endpoint, payload);
            return response;
        });
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
// === Custom Error Types ===
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
