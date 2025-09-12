"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageGenerationRequestedEvent = void 0;
const crypto_1 = require("crypto");
class ImageGenerationRequestedEvent {
    constructor(prompt, imagePath) {
        this.eventType = 'ImageGenerationRequested';
        if (!prompt || prompt.trim() === '') {
            throw new Error('Prompt cannot be empty');
        }
        if (!imagePath || imagePath.trim() === '') {
            throw new Error('Image path cannot be empty');
        }
        this.id = (0, crypto_1.randomUUID)();
        this.prompt = prompt;
        this.imagePath = imagePath;
        this.timestamp = new Date();
    }
    toJSON() {
        return {
            id: this.id,
            eventType: this.eventType,
            prompt: this.prompt,
            imagePath: this.imagePath,
            timestamp: this.timestamp.toISOString(),
        };
    }
}
exports.ImageGenerationRequestedEvent = ImageGenerationRequestedEvent;
//# sourceMappingURL=ImageGenerationRequestedEvent.js.map