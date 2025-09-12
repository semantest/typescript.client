"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventHttpClient = void 0;
const axios_1 = __importDefault(require("axios"));
class EventHttpClient {
    constructor(serverUrl) {
        // Remove trailing slash if present
        this.serverUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
    }
    getServerUrl() {
        return this.serverUrl;
    }
    async sendEvent(event, options = {}) {
        const { maxRetries = 1, retryDelay = 1000 } = options;
        let lastError = null;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const response = await axios_1.default.post(`${this.serverUrl}/events`, event.toJSON(), {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 5000,
                });
                return response.data;
            }
            catch (error) {
                lastError = this.handleError(error);
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
    handleError(error) {
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
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.EventHttpClient = EventHttpClient;
//# sourceMappingURL=EventHttpClient.js.map