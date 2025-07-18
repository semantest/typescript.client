/**
 * @fileoverview Semantest TypeScript Client
 * @description Generic event-driven client for Semantest Web-Buddy Framework
 * @author Semantest Team
 */

// Export the generic event infrastructure
export { EventDrivenWebBuddyClient } from './event-driven-client';

// Export common types
export {
  DomainEvent,
  EventResponse,
  ClientConfig,
  // ChatGPT Automation Events
  ProjectSelectionRequested,
  ProjectSelected,
  ProjectSelectionFailed,
  ChatSelectionRequested,
  ChatSelected,
  ChatSelectionFailed,
  PromptSubmissionRequested,
  PromptSubmitted,
  PromptSubmissionFailed,
  ResponseRetrievalRequested,
  ResponseRetrieved,
  ResponseRetrievalFailed,
  // File Download Events
  FileDownloadRequested,
  FileDownloadStarted,
  FileDownloadCompleted,
  FileDownloadFailed,
  FileDownloadProgress,
  // Training Events
  TrainingModeRequested,
  TrainingModeEnabled,
  TrainingModeDisabled,
  AutomationPatternListRequested,
  AutomationPatternListProvided,
  // Pattern Management Types
  AutomationPattern,
  ExecutionContext,
  // Workflow Types
  ChatGPTWorkflow,
  ChatGPTWorkflowResult,
  // Error Types
  EventError,
  WorkflowError,
  // Union Types
  AutomationEvent,
  AutomationResponse,
  DownloadEvent,
  DownloadResponse,
  TrainingEvent,
  TrainingResponse,
  AllEvents,
  AllResponses
} from './types';

// Export custom error classes
export { EventSendError, WorkflowError as ClientWorkflowError } from './event-driven-client';
