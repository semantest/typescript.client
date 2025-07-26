"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationPatternListProvided = exports.AutomationPatternListRequested = exports.TrainingModeDisabled = exports.TrainingModeEnabled = exports.TrainingModeRequested = exports.FileDownloadProgress = exports.FileDownloadFailed = exports.FileDownloadCompleted = exports.FileDownloadStarted = exports.FileDownloadRequested = exports.ResponseRetrievalFailed = exports.ResponseRetrieved = exports.ResponseRetrievalRequested = exports.PromptSubmissionFailed = exports.PromptSubmitted = exports.PromptSubmissionRequested = exports.ChatSelectionFailed = exports.ChatSelected = exports.ChatSelectionRequested = exports.ProjectSelectionFailed = exports.ProjectSelected = exports.ProjectSelectionRequested = exports.EventResponse = exports.DomainEvent = void 0;
class DomainEvent {
    constructor(correlationId) {
        this.correlationId = correlationId;
        this.id = `${this.constructor.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.timestamp = new Date();
    }
}
exports.DomainEvent = DomainEvent;
class EventResponse {
    constructor(correlationId, success, timestamp = new Date()) {
        this.correlationId = correlationId;
        this.success = success;
        this.timestamp = timestamp;
    }
}
exports.EventResponse = EventResponse;
class ProjectSelectionRequested extends DomainEvent {
    constructor(projectName, selector, correlationId) {
        super(correlationId || `project-${Date.now()}`);
        this.projectName = projectName;
        this.selector = selector;
        this.eventType = 'ProjectSelectionRequested';
    }
}
exports.ProjectSelectionRequested = ProjectSelectionRequested;
class ProjectSelected extends EventResponse {
    constructor(projectName, actualSelector, correlationId) {
        super(correlationId, true);
        this.projectName = projectName;
        this.actualSelector = actualSelector;
        this.responseType = 'ProjectSelected';
    }
}
exports.ProjectSelected = ProjectSelected;
class ProjectSelectionFailed extends EventResponse {
    constructor(projectName, reason, selector, correlationId) {
        super(correlationId || '', false);
        this.projectName = projectName;
        this.reason = reason;
        this.selector = selector;
        this.responseType = 'ProjectSelectionFailed';
    }
}
exports.ProjectSelectionFailed = ProjectSelectionFailed;
class ChatSelectionRequested extends DomainEvent {
    constructor(chatTitle, selector, correlationId) {
        super(correlationId || `chat-${Date.now()}`);
        this.chatTitle = chatTitle;
        this.selector = selector;
        this.eventType = 'ChatSelectionRequested';
    }
}
exports.ChatSelectionRequested = ChatSelectionRequested;
class ChatSelected extends EventResponse {
    constructor(chatTitle, actualSelector, correlationId) {
        super(correlationId, true);
        this.chatTitle = chatTitle;
        this.actualSelector = actualSelector;
        this.responseType = 'ChatSelected';
    }
}
exports.ChatSelected = ChatSelected;
class ChatSelectionFailed extends EventResponse {
    constructor(chatTitle, reason, correlationId) {
        super(correlationId, false);
        this.chatTitle = chatTitle;
        this.reason = reason;
        this.responseType = 'ChatSelectionFailed';
    }
}
exports.ChatSelectionFailed = ChatSelectionFailed;
class PromptSubmissionRequested extends DomainEvent {
    constructor(promptText, selector = '#prompt-textarea', correlationId) {
        super(correlationId || `prompt-${Date.now()}`);
        this.promptText = promptText;
        this.selector = selector;
        this.eventType = 'PromptSubmissionRequested';
    }
}
exports.PromptSubmissionRequested = PromptSubmissionRequested;
class PromptSubmitted extends EventResponse {
    constructor(promptText, actualSelector, correlationId) {
        super(correlationId, true);
        this.promptText = promptText;
        this.actualSelector = actualSelector;
        this.responseType = 'PromptSubmitted';
    }
}
exports.PromptSubmitted = PromptSubmitted;
class PromptSubmissionFailed extends EventResponse {
    constructor(promptText, reason, correlationId) {
        super(correlationId, false);
        this.promptText = promptText;
        this.reason = reason;
        this.responseType = 'PromptSubmissionFailed';
    }
}
exports.PromptSubmissionFailed = PromptSubmissionFailed;
class ResponseRetrievalRequested extends DomainEvent {
    constructor(selector = '[data-message-author-role="assistant"]', timeout = 30000, correlationId) {
        super(correlationId || `response-${Date.now()}`);
        this.selector = selector;
        this.timeout = timeout;
        this.eventType = 'ResponseRetrievalRequested';
    }
}
exports.ResponseRetrievalRequested = ResponseRetrievalRequested;
class ResponseRetrieved extends EventResponse {
    constructor(content, metadata, correlationId) {
        super(correlationId, true);
        this.content = content;
        this.metadata = metadata;
        this.responseType = 'ResponseRetrieved';
    }
}
exports.ResponseRetrieved = ResponseRetrieved;
class ResponseRetrievalFailed extends EventResponse {
    constructor(reason, timeout, correlationId) {
        super(correlationId, false);
        this.reason = reason;
        this.timeout = timeout;
        this.responseType = 'ResponseRetrievalFailed';
    }
}
exports.ResponseRetrievalFailed = ResponseRetrievalFailed;
class FileDownloadRequested extends DomainEvent {
    constructor(url, filename, conflictAction, saveAs, correlationId) {
        super(correlationId || `download-${Date.now()}`);
        this.url = url;
        this.filename = filename;
        this.conflictAction = conflictAction;
        this.saveAs = saveAs;
        this.eventType = 'FileDownloadRequested';
    }
}
exports.FileDownloadRequested = FileDownloadRequested;
class FileDownloadStarted extends EventResponse {
    constructor(downloadId, url, filename, estimatedSize, correlationId) {
        super(correlationId || '', true);
        this.downloadId = downloadId;
        this.url = url;
        this.filename = filename;
        this.estimatedSize = estimatedSize;
        this.responseType = 'FileDownloadStarted';
    }
}
exports.FileDownloadStarted = FileDownloadStarted;
class FileDownloadCompleted extends EventResponse {
    constructor(downloadId, url, filename, filepath, fileSize, downloadTime, correlationId) {
        super(correlationId, true);
        this.downloadId = downloadId;
        this.url = url;
        this.filename = filename;
        this.filepath = filepath;
        this.fileSize = fileSize;
        this.downloadTime = downloadTime;
        this.responseType = 'FileDownloadCompleted';
    }
}
exports.FileDownloadCompleted = FileDownloadCompleted;
class FileDownloadFailed extends EventResponse {
    constructor(url, reason, downloadId, correlationId) {
        super(correlationId || '', false);
        this.url = url;
        this.reason = reason;
        this.downloadId = downloadId;
        this.responseType = 'FileDownloadFailed';
    }
}
exports.FileDownloadFailed = FileDownloadFailed;
class FileDownloadProgress extends EventResponse {
    constructor(downloadId, bytesReceived, totalBytes, percentage, speed, correlationId) {
        super(correlationId, true);
        this.downloadId = downloadId;
        this.bytesReceived = bytesReceived;
        this.totalBytes = totalBytes;
        this.percentage = percentage;
        this.speed = speed;
        this.responseType = 'FileDownloadProgress';
    }
}
exports.FileDownloadProgress = FileDownloadProgress;
class TrainingModeRequested extends DomainEvent {
    constructor(website, correlationId) {
        super(correlationId || `training-${Date.now()}`);
        this.website = website;
        this.eventType = 'TrainingModeRequested';
    }
}
exports.TrainingModeRequested = TrainingModeRequested;
class TrainingModeEnabled extends EventResponse {
    constructor(sessionId, website, existingPatterns, correlationId) {
        super(correlationId, true);
        this.sessionId = sessionId;
        this.website = website;
        this.existingPatterns = existingPatterns;
        this.responseType = 'TrainingModeEnabled';
    }
}
exports.TrainingModeEnabled = TrainingModeEnabled;
class TrainingModeDisabled extends EventResponse {
    constructor(sessionId, reason, patternsLearned, correlationId) {
        super(correlationId, true);
        this.sessionId = sessionId;
        this.reason = reason;
        this.patternsLearned = patternsLearned;
        this.responseType = 'TrainingModeDisabled';
    }
}
exports.TrainingModeDisabled = TrainingModeDisabled;
class AutomationPatternListRequested extends DomainEvent {
    constructor(filters, correlationId) {
        super(correlationId || `patterns-${Date.now()}`);
        this.filters = filters;
        this.eventType = 'AutomationPatternListRequested';
    }
}
exports.AutomationPatternListRequested = AutomationPatternListRequested;
class AutomationPatternListProvided extends EventResponse {
    constructor(patterns, totalCount, filters, correlationId) {
        super(correlationId, true);
        this.patterns = patterns;
        this.totalCount = totalCount;
        this.filters = filters;
        this.responseType = 'AutomationPatternListProvided';
    }
}
exports.AutomationPatternListProvided = AutomationPatternListProvided;
//# sourceMappingURL=types.js.map