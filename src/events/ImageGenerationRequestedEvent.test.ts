import { ImageGenerationRequestedEvent } from './ImageGenerationRequestedEvent';

describe('ImageGenerationRequestedEvent', () => {
  describe('constructor', () => {
    it('should create an event with prompt and imagePath', () => {
      const prompt = 'A beautiful sunset over mountains';
      const imagePath = '/path/to/output/image.png';
      
      const event = new ImageGenerationRequestedEvent(prompt, imagePath);
      
      expect(event.prompt).toBe(prompt);
      expect(event.imagePath).toBe(imagePath);
      expect(event.eventType).toBe('ImageGenerationRequested');
      expect(event.timestamp).toBeDefined();
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('should generate a unique event ID', () => {
      const event1 = new ImageGenerationRequestedEvent('prompt1', '/path1');
      const event2 = new ImageGenerationRequestedEvent('prompt2', '/path2');
      
      expect(event1.id).toBeDefined();
      expect(event2.id).toBeDefined();
      expect(event1.id).not.toBe(event2.id);
    });
  });

  describe('toJSON', () => {
    it('should serialize the event to JSON format', () => {
      const prompt = 'A futuristic city';
      const imagePath = '/output/city.png';
      const event = new ImageGenerationRequestedEvent(prompt, imagePath);
      
      const json = event.toJSON();
      
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('eventType', 'ImageGenerationRequested');
      expect(json).toHaveProperty('prompt', prompt);
      expect(json).toHaveProperty('imagePath', imagePath);
      expect(json).toHaveProperty('timestamp');
    });
  });

  describe('validation', () => {
    it('should throw error if prompt is empty', () => {
      expect(() => {
        new ImageGenerationRequestedEvent('', '/path/to/image.png');
      }).toThrow('Prompt cannot be empty');
    });

    it('should throw error if imagePath is empty', () => {
      expect(() => {
        new ImageGenerationRequestedEvent('Valid prompt', '');
      }).toThrow('Image path cannot be empty');
    });
  });
});