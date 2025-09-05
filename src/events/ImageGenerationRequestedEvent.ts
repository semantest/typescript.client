import { randomUUID } from 'crypto';

export interface ImageGenerationRequestedEventData {
  id: string;
  eventType: string;
  prompt: string;
  imagePath: string;
  timestamp: string;
}

export class ImageGenerationRequestedEvent {
  public readonly id: string;
  public readonly eventType: string = 'ImageGenerationRequested';
  public readonly prompt: string;
  public readonly imagePath: string;
  public readonly timestamp: Date;

  constructor(prompt: string, imagePath: string) {
    if (!prompt || prompt.trim() === '') {
      throw new Error('Prompt cannot be empty');
    }
    
    if (!imagePath || imagePath.trim() === '') {
      throw new Error('Image path cannot be empty');
    }

    this.id = randomUUID();
    this.prompt = prompt;
    this.imagePath = imagePath;
    this.timestamp = new Date();
  }

  toJSON(): ImageGenerationRequestedEventData {
    return {
      id: this.id,
      eventType: this.eventType,
      prompt: this.prompt,
      imagePath: this.imagePath,
      timestamp: this.timestamp.toISOString(),
    };
  }
}