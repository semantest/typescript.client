export interface ImageGenerationRequestedEventData {
    id: string;
    eventType: string;
    prompt: string;
    imagePath: string;
    timestamp: string;
}
export declare class ImageGenerationRequestedEvent {
    readonly id: string;
    readonly eventType: string;
    readonly prompt: string;
    readonly imagePath: string;
    readonly timestamp: Date;
    constructor(prompt: string, imagePath: string);
    toJSON(): ImageGenerationRequestedEventData;
}
//# sourceMappingURL=ImageGenerationRequestedEvent.d.ts.map