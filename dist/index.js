"use strict";
/**
 * @fileoverview ChatGPT-Buddy Client Example
 * @description Example usage of the ChatGPT-Buddy client SDK
 * @author rydnr
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
exports.createChatGPTBuddyClient = void 0;
exports.main = main;
const chatgpt_buddy_client_1 = require("./chatgpt-buddy-client");
Object.defineProperty(exports, "createChatGPTBuddyClient", { enumerable: true, get: function () { return chatgpt_buddy_client_1.createChatGPTBuddyClient; } });
// Client configuration
const config = {
    serverUrl: 'http://localhost:3003',
    defaultModel: 'gpt-4',
    enableWebSocket: true,
    timeout: 30000,
    // apiKey: 'your-api-key-here' // Optional for authenticated servers
};
function demonstrateChatGPTIntegration() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🤖 ChatGPT-Buddy Client Demo');
        console.log('=============================\n');
        try {
            // Initialize the client
            console.log('1. Initializing ChatGPT-Buddy client...');
            const client = yield (0, chatgpt_buddy_client_1.createChatGPTBuddyClient)(config);
            // Check server health
            console.log('\n2. Checking server health...');
            const serverInfo = yield client.getServerInfo();
            console.log('Server info:', JSON.stringify(serverInfo, null, 2));
            // Simple ChatGPT interaction
            console.log('\n3. Testing ChatGPT interaction...');
            const chatResponse = yield client.chat({
                prompt: "Explain the benefits of event-driven architecture in web automation",
                model: "gpt-4",
                interactionOptions: {
                    maxTokens: 500,
                    temperature: 0.7,
                    enableLearning: true
                }
            });
            console.log('ChatGPT Response:');
            console.log('Content:', chatResponse.content);
            console.log('Model used:', chatResponse.modelUsed);
            console.log('Response time:', `${chatResponse.responseTime}ms`);
            console.log('Token usage:', chatResponse.usage);
            // Enable pattern learning
            console.log('\n4. Enabling pattern learning...');
            yield client.setPatternLearning({
                enabled: true,
                sessionType: 'demo_session',
                learningLevel: 'intermediate'
            });
            // AI-enhanced automation example
            console.log('\n5. Testing AI-enhanced automation...');
            const automationResult = yield client.automateWithAI({
                task: "Research information about TypeScript decorators",
                instructions: [
                    "Search for TypeScript decorator documentation",
                    "Extract key concepts and examples",
                    "Summarize the main use cases"
                ],
                automationOptions: {
                    enableLearning: true,
                    aiInsights: true,
                    crossSiteAdaptation: true
                }
            });
            console.log('Automation Result:');
            console.log('Success:', automationResult.success);
            console.log('AI Insights:', automationResult.aiInsights);
            console.log('Performance:', automationResult.performance);
            // Get learned patterns
            console.log('\n6. Retrieving learned patterns...');
            const patterns = yield client.getPatterns();
            console.log(`Found ${patterns.length} automation patterns`);
            patterns.forEach((pattern, index) => {
                console.log(`  ${index + 1}. ${pattern.name} (confidence: ${pattern.confidence})`);
            });
            // Multi-model interaction example
            console.log('\n7. Testing with different AI models...');
            const gpt35Response = yield client.chat({
                prompt: "What is the difference between TypeScript and JavaScript?",
                model: "gpt-3.5-turbo",
                interactionOptions: {
                    maxTokens: 200,
                    temperature: 0.5
                }
            });
            console.log('GPT-3.5 Response length:', gpt35Response.content.length);
            console.log('Tokens used:', gpt35Response.usage.totalTokens);
            // Conversational context example
            console.log('\n8. Testing contextual conversation...');
            const contextualResponse = yield client.chat({
                prompt: "Can you give me a practical example?",
                context: {
                    previousInteraction: "We were discussing TypeScript vs JavaScript",
                    userPreferences: {
                        codeExamples: true,
                        detailLevel: "intermediate"
                    }
                },
                interactionOptions: {
                    contextRetention: true
                }
            });
            console.log('Contextual response:', contextualResponse.content.substring(0, 200) + '...');
            // Clean up
            console.log('\n9. Cleaning up...');
            yield client.setPatternLearning({ enabled: false });
            yield client.disconnect();
            console.log('\n✅ Demo completed successfully!');
        }
        catch (error) {
            console.error('\n❌ Demo failed:', error);
        }
    });
}
function demonstrateAdvancedFeatures() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('\n🚀 Advanced Features Demo');
        console.log('==========================\n');
        try {
            const client = yield (0, chatgpt_buddy_client_1.createChatGPTBuddyClient)(config);
            // Intelligent model selection based on task
            console.log('1. Testing intelligent model selection...');
            // Complex reasoning task (use GPT-4)
            const reasoningResponse = yield client.chat({
                prompt: "Design a scalable architecture for a real-time collaboration platform",
                interactionOptions: {
                    maxTokens: 1000,
                    enableLearning: true
                }
            });
            console.log('Complex task model:', reasoningResponse.modelUsed);
            // Simple task (could use GPT-3.5)
            const simpleResponse = yield client.chat({
                prompt: "What is 2 + 2?",
                model: "gpt-3.5-turbo"
            });
            console.log('Simple task model:', simpleResponse.modelUsed);
            // Workflow automation with AI insights
            console.log('\n2. Advanced workflow automation...');
            const workflowResult = yield client.automateWithAI({
                task: "Create a comprehensive research report",
                instructions: [
                    "Search for recent articles on AI automation",
                    "Extract key statistics and trends",
                    "Generate executive summary",
                    "Create actionable recommendations"
                ],
                automationOptions: {
                    enableLearning: true,
                    aiInsights: true,
                    errorRecovery: true
                }
            });
            console.log('Workflow insights:', workflowResult.aiInsights.length);
            console.log('Learned patterns:', workflowResult.learnedPatterns.length);
            console.log('Performance score:', workflowResult.performance.optimizationScore);
            yield client.disconnect();
            console.log('\n✅ Advanced demo completed!');
        }
        catch (error) {
            console.error('\n❌ Advanced demo failed:', error);
        }
    });
}
// Run the demonstrations
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield demonstrateChatGPTIntegration();
        yield demonstrateAdvancedFeatures();
    });
}
// Run if this file is executed directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Unhandled error:', error);
        process.exit(1);
    });
}
