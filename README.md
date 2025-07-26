# @semantest/typescript.client

## 📦 Overview

Generic TypeScript client library for Semantest framework. This module provides foundational client functionality that can be used across multiple domains.

⚠️ **Important**: This module follows **Domain-Driven Design (DDD)** principles and contains **NO domain-specific logic**. Domain-specific functionality belongs in dedicated domain modules.

## 🏗️ Module Architecture

### What This Module Contains
- **Generic Event-Driven Client**: Base patterns for event-driven communication
- **Common Types**: Shared type definitions used across domains
- **Utility Functions**: Generic client utilities
- **Base Infrastructure**: Client infrastructure patterns

### What This Module Does NOT Contain
- **Domain Events**: These belong in domain modules (e.g., `@semantest/images.google.com`)
- **Domain Logic**: Business logic belongs in domain modules
- **Specific Integrations**: These belong in domain modules

## 📁 Module Structure

```
typescript.client/
├── src/
│   ├── event-driven-client.ts    # Generic event-driven client
│   ├── types.ts                  # Generic types ONLY
│   ├── utils/                    # Generic utilities
│   └── index.ts                  # Module exports
├── tests/                        # Generic client tests
├── package.json                  # Dependencies (NO domain modules)
└── README.md
```

## 🔗 Dependencies

### Allowed Dependencies
- `@semantest/core` - Core framework utilities
- Standard libraries (no domain-specific dependencies)

### Forbidden Dependencies
- `@semantest/images.google.com` - Domain module (circular dependency)
- `@semantest/chatgpt.com` - Domain module (circular dependency)
- Any other domain modules

## 🚀 Usage

### Generic Event-Driven Client
```typescript
import { EventDrivenClient } from '@semantest/typescript.client';

// Create generic client
const client = new EventDrivenClient({
  serverUrl: 'http://localhost:3000',
  timeout: 5000
});

// Use with domain-specific events (imported from domain modules)
import { GoogleImageDownloadRequested } from '@semantest/images.google.com/domain/events';

const result = await client.sendEvent(
  new GoogleImageDownloadRequested(imageUrl, searchQuery, options)
);
```

### Common Types
```typescript
import { ClientConfig, EventResponse } from '@semantest/typescript.client';

const config: ClientConfig = {
  serverUrl: 'http://localhost:3000',
  timeout: 5000,
  retries: 3
};

function handleResponse(response: EventResponse) {
  if (response.success) {
    console.log('Event processed successfully');
  }
}
```

### Utility Functions
```typescript
import { validateEventData, createCorrelationId } from '@semantest/typescript.client';

// Generic validation
const isValid = validateEventData(eventData);

// Generate correlation ID
const correlationId = createCorrelationId();
```

## 🔧 API Reference

### EventDrivenClient

#### Constructor
```typescript
constructor(config: ClientConfig)
```

#### Methods
```typescript
// Send generic event
sendEvent<T extends DomainEvent>(event: T): Promise<EventResponse>

// Subscribe to event responses
subscribe<T>(eventType: string, handler: (event: T) => void): void

// Unsubscribe from events
unsubscribe(eventType: string, handler: Function): void

// Close client connection
close(): Promise<void>
```

### Types

#### ClientConfig
```typescript
interface ClientConfig {
  serverUrl: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}
```

#### EventResponse
```typescript
interface EventResponse {
  success: boolean;
  correlationId: string;
  timestamp: Date;
  data?: any;
  error?: string;
}
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- event-driven-client.test.ts
```

### Test Structure
```
tests/
├── unit/
│   ├── event-driven-client.test.ts
│   ├── types.test.ts
│   └── utils.test.ts
├── integration/
│   └── client-integration.test.ts
└── setup.ts
```

## 🔒 Security

### Security Boundaries
- **No domain data exposure**: Generic client doesn't expose domain-specific data
- **Event validation**: All events must pass generic validation
- **Connection security**: Secure WebSocket/HTTP connections
- **No credential storage**: Credentials handled by infrastructure layer

### Best Practices
- Use correlation IDs for event tracking
- Implement proper error handling
- Validate all input data
- Use secure connection protocols

## 📈 Performance

### Optimization Features
- **Connection pooling**: Reuse connections across events
- **Event batching**: Batch multiple events for efficiency
- **Caching**: Cache frequently used data
- **Lazy loading**: Load resources on demand

### Monitoring
- **Event latency**: Track event processing time
- **Connection health**: Monitor connection status
- **Error rates**: Track failure rates
- **Memory usage**: Monitor resource consumption

## 🚀 Development

### Build Commands
```bash
# Build TypeScript
npm run build

# Build and watch for changes
npm run build:watch

# Clean build artifacts
npm run clean
```

### Development Workflow
1. Make changes to TypeScript files
2. Run tests to ensure functionality
3. Build the module
4. Test integration with domain modules
5. Update documentation if needed

## 📚 Related Documentation

### Architecture
- **[Architecture Overview](../docs/architecture/README.org)** - System architecture
- **[Domain Design](../docs/architecture/domain-design.md)** - DDD principles
- **[Migration Guide](../docs/migration-guide/README.org)** - Migration instructions

### Domain Modules
- **[Google Images Module](../images.google.com/README.md)** - Google Images domain
- **[ChatGPT Module](../chatgpt.com/README.md)** - ChatGPT domain
- **[Google Search Module](../google.com/README.md)** - Google Search domain

### Development
- **[Contributing Guide](../CONTRIBUTING.md)** - Contribution guidelines
- **[Testing Guide](../docs/testing/README.md)** - Testing strategies
- **[Security Guide](../docs/security/README.md)** - Security patterns

## 🤝 Contributing

### Guidelines
1. **Follow DDD principles**: No domain-specific code in this module
2. **Maintain clean dependencies**: Only depend on `@semantest/core`
3. **Write tests**: All new functionality must have tests
4. **Update documentation**: Keep README and API docs current

### Common Mistakes to Avoid
```typescript
// ❌ DON'T - Domain events in generic client
export class GoogleImageDownloadRequested extends DomainEvent {
  // This belongs in @semantest/images.google.com
}

// ❌ DON'T - Domain-specific logic
export class GoogleImagesClient {
  // This belongs in @semantest/images.google.com
}

// ✅ DO - Generic functionality
export class EventDrivenClient {
  // Generic client that works with any domain
}
```

## 📋 Migration Notes

### From Legacy Architecture
If you're migrating from the legacy architecture:

1. **Remove domain events** from `types.ts`
2. **Move domain logic** to appropriate domain modules
3. **Update import paths** in consuming code
4. **Test cross-module integration**

### Example Migration
```typescript
// OLD: Everything in typescript.client
import { 
  GoogleImageDownloadRequested,
  GoogleImagesClient 
} from '@semantest/typescript.client';

// NEW: Domain-specific imports
import { GoogleImageDownloadRequested } from '@semantest/images.google.com/domain/events';
import { GoogleImagesClient } from '@semantest/images.google.com/application';
import { EventDrivenClient } from '@semantest/typescript.client';
```

## 📞 Support

### Getting Help
- **Documentation**: Check the docs/ directory
- **Issues**: Create GitHub issues for bugs
- **Discussion**: Use GitHub discussions for questions
- **Architecture**: Contact architecture team for design questions

### Version Information
- **Current Version**: 2.0.0
- **Node.js**: 18+ required
- **TypeScript**: 5.5+ required
- **Dependencies**: See package.json

---

**Module**: @semantest/typescript.client  
**Version**: 2.0.0  
**Architecture**: Domain-Driven Design  
**Last Updated**: July 18, 2025