/**
 * @fileoverview Semantest TypeScript Client
 * @description Generic event-driven client for Semantest Web-Buddy Framework
 * @author Semantest Team
 */
// Export main modules for library usage
export { ImageGenerationRequestedEvent } from './events/ImageGenerationRequestedEvent';
export type { ImageGenerationRequestedEventData } from './events/ImageGenerationRequestedEvent';

export { EventHttpClient } from './http/EventHttpClient';
export type { SendEventOptions, SendEventResponse } from './http/EventHttpClient';

export { CliArgumentParser } from './cli/CliArgumentParser';
export type { CliArguments } from './cli/CliArgumentParser';
