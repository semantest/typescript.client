/**
 * @fileoverview Event Flow Documentation and Coordination
 * @description Defines the complete event flow from CLI to ChatGPT and back
 * @owner Carlos - Integration Specialist
 * @critical-bottleneck Wences - Idle/Busy Detection
 */

import { Event } from '@typescript-eda/domain';
import { TeamMember, IntegrationEventType } from './integration-monitor';

/**
 * CRITICAL BOTTLENECK: ChatGPT Idle/Busy Detection
 * Owner: Wences (Browser Specialist)
 * Priority: CRITICAL - Blocking entire event flow
 */
export interface ChatGPTStateDetection {
  /**
   * PROBLEM: Need to detect when ChatGPT is ready to receive input
   * Current blockers:
   * 1. Dynamic DOM changes when ChatGPT is processing
   * 2. No reliable API to check processing state
   * 3. Multiple UI states (idle, typing, thinking, error)
   */
  detectIdleState(): Promise<boolean>;
  
  /**
   * PROBLEM: Need to detect when ChatGPT is busy processing
   * Indicators to monitor:
   * - Typing animation dots
   * - "Stop generating" button presence
   * - Network activity to OpenAI endpoints
   * - DOM mutation patterns
   */
  detectBusyState(): Promise<boolean>;
  
  /**
   * SOLUTION IN PROGRESS: Multi-signal detection strategy
   * Combining:
   * - DOM mutation observers on key elements
   * - Network request interception
   * - Visual state detection
   * - Timing heuristics
   */
  getReliableState(): Promise<'idle' | 'busy' | 'error' | 'unknown'>;
}

/**
 * Event flow stages with team ownership
 */
export enum EventFlowStage {
  // Elena's domain
  CLI_INPUT_RECEIVED = 'cli.input.received',
  CLI_COMMAND_PARSED = 'cli.command.parsed',
  
  // Carlos's coordination points
  INTEGRATION_ROUTE_DETERMINED = 'integration.route.determined',
  INTEGRATION_EVENT_DISPATCHED = 'integration.event.dispatched',
  
  // Fran's domain (Backend Engineer)
  SERVER_CONNECTION_ESTABLISHED = 'server.connection.established',
  SERVER_WEBSOCKET_READY = 'server.websocket.ready',
  SERVER_REQUEST_QUEUED = 'server.request.queued',
  
  // Wences's domain - CRITICAL BOTTLENECK
  BROWSER_PAGE_LOADED = 'browser.page.loaded',
  BROWSER_STATE_CHECKING = 'browser.state.checking', // BOTTLENECK
  BROWSER_IDLE_DETECTED = 'browser.idle.detected',   // BOTTLENECK
  BROWSER_INPUT_INJECTED = 'browser.input.injected',
  BROWSER_SUBMIT_TRIGGERED = 'browser.submit.triggered',
  BROWSER_BUSY_DETECTED = 'browser.busy.detected',   // BOTTLENECK
  BROWSER_RESPONSE_DETECTED = 'browser.response.detected',
  BROWSER_RESPONSE_EXTRACTED = 'browser.response.extracted',
  
  // Return path
  SERVER_RESPONSE_RECEIVED = 'server.response.received',
  INTEGRATION_RESPONSE_ROUTED = 'integration.response.routed',
  CLI_OUTPUT_FORMATTED = 'cli.output.formatted',
  CLI_OUTPUT_DISPLAYED = 'cli.output.displayed',
  
  // Ana's monitoring checkpoints
  MONITOR_LATENCY_CHECK = 'monitor.latency.check',
  MONITOR_BOTTLENECK_ALERT = 'monitor.bottleneck.alert',
  MONITOR_PERFORMANCE_REPORT = 'monitor.performance.report'
}

/**
 * Complete event flow definition
 */
export class EventFlowDefinition {
  /**
   * Standard successful flow path
   */
  static readonly STANDARD_FLOW: EventFlowStage[] = [
    // Input phase (Elena)
    EventFlowStage.CLI_INPUT_RECEIVED,
    EventFlowStage.CLI_COMMAND_PARSED,
    
    // Routing phase (Carlos)
    EventFlowStage.INTEGRATION_ROUTE_DETERMINED,
    EventFlowStage.INTEGRATION_EVENT_DISPATCHED,
    
    // Server phase (Diego)
    EventFlowStage.SERVER_CONNECTION_ESTABLISHED,
    EventFlowStage.SERVER_WEBSOCKET_READY,
    EventFlowStage.SERVER_REQUEST_QUEUED,
    
    // Browser phase (Wences) - CONTAINS BOTTLENECKS
    EventFlowStage.BROWSER_PAGE_LOADED,
    EventFlowStage.BROWSER_STATE_CHECKING,      // BOTTLENECK START
    EventFlowStage.BROWSER_IDLE_DETECTED,       // BOTTLENECK END
    EventFlowStage.BROWSER_INPUT_INJECTED,
    EventFlowStage.BROWSER_SUBMIT_TRIGGERED,
    EventFlowStage.BROWSER_BUSY_DETECTED,       // BOTTLENECK START
    EventFlowStage.BROWSER_RESPONSE_DETECTED,   // BOTTLENECK END
    EventFlowStage.BROWSER_RESPONSE_EXTRACTED,
    
    // Response phase
    EventFlowStage.SERVER_RESPONSE_RECEIVED,
    EventFlowStage.INTEGRATION_RESPONSE_ROUTED,
    EventFlowStage.CLI_OUTPUT_FORMATTED,
    EventFlowStage.CLI_OUTPUT_DISPLAYED
  ];
  
  /**
   * Critical bottleneck stages that need immediate attention
   */
  static readonly BOTTLENECK_STAGES: EventFlowStage[] = [
    EventFlowStage.BROWSER_STATE_CHECKING,
    EventFlowStage.BROWSER_IDLE_DETECTED,
    EventFlowStage.BROWSER_BUSY_DETECTED,
    EventFlowStage.BROWSER_RESPONSE_DETECTED
  ];
  
  /**
   * Team ownership mapping
   */
  static readonly STAGE_OWNERSHIP: Map<EventFlowStage, TeamMember> = new Map([
    // Elena owns CLI stages
    [EventFlowStage.CLI_INPUT_RECEIVED, TeamMember.ELENA],
    [EventFlowStage.CLI_COMMAND_PARSED, TeamMember.ELENA],
    [EventFlowStage.CLI_OUTPUT_FORMATTED, TeamMember.ELENA],
    [EventFlowStage.CLI_OUTPUT_DISPLAYED, TeamMember.ELENA],
    
    // Carlos owns integration stages
    [EventFlowStage.INTEGRATION_ROUTE_DETERMINED, TeamMember.CARLOS],
    [EventFlowStage.INTEGRATION_EVENT_DISPATCHED, TeamMember.CARLOS],
    [EventFlowStage.INTEGRATION_RESPONSE_ROUTED, TeamMember.CARLOS],
    
    // Fran owns server stages (Backend Engineer)
    [EventFlowStage.SERVER_CONNECTION_ESTABLISHED, TeamMember.FRAN],
    [EventFlowStage.SERVER_WEBSOCKET_READY, TeamMember.FRAN],
    [EventFlowStage.SERVER_REQUEST_QUEUED, TeamMember.FRAN],
    [EventFlowStage.SERVER_RESPONSE_RECEIVED, TeamMember.FRAN],
    
    // Wences owns browser stages (INCLUDING BOTTLENECKS)
    [EventFlowStage.BROWSER_PAGE_LOADED, TeamMember.WENCES],
    [EventFlowStage.BROWSER_STATE_CHECKING, TeamMember.WENCES],
    [EventFlowStage.BROWSER_IDLE_DETECTED, TeamMember.WENCES],
    [EventFlowStage.BROWSER_INPUT_INJECTED, TeamMember.WENCES],
    [EventFlowStage.BROWSER_SUBMIT_TRIGGERED, TeamMember.WENCES],
    [EventFlowStage.BROWSER_BUSY_DETECTED, TeamMember.WENCES],
    [EventFlowStage.BROWSER_RESPONSE_DETECTED, TeamMember.WENCES],
    [EventFlowStage.BROWSER_RESPONSE_EXTRACTED, TeamMember.WENCES],
    
    // Ana owns monitoring stages
    [EventFlowStage.MONITOR_LATENCY_CHECK, TeamMember.ANA],
    [EventFlowStage.MONITOR_BOTTLENECK_ALERT, TeamMember.ANA],
    [EventFlowStage.MONITOR_PERFORMANCE_REPORT, TeamMember.ANA]
  ]);
  
  /**
   * Expected latency for each stage (milliseconds)
   */
  static readonly EXPECTED_LATENCY: Map<EventFlowStage, number> = new Map([
    [EventFlowStage.CLI_INPUT_RECEIVED, 10],
    [EventFlowStage.CLI_COMMAND_PARSED, 20],
    [EventFlowStage.INTEGRATION_ROUTE_DETERMINED, 5],
    [EventFlowStage.INTEGRATION_EVENT_DISPATCHED, 10],
    [EventFlowStage.SERVER_CONNECTION_ESTABLISHED, 100],
    [EventFlowStage.SERVER_WEBSOCKET_READY, 50],
    [EventFlowStage.SERVER_REQUEST_QUEUED, 10],
    [EventFlowStage.BROWSER_PAGE_LOADED, 2000],
    [EventFlowStage.BROWSER_STATE_CHECKING, 500],      // BOTTLENECK: Currently taking 2000-5000ms
    [EventFlowStage.BROWSER_IDLE_DETECTED, 100],       // BOTTLENECK: Unreliable, false positives
    [EventFlowStage.BROWSER_INPUT_INJECTED, 50],
    [EventFlowStage.BROWSER_SUBMIT_TRIGGERED, 20],
    [EventFlowStage.BROWSER_BUSY_DETECTED, 200],       // BOTTLENECK: Missing busy states
    [EventFlowStage.BROWSER_RESPONSE_DETECTED, 5000],  // BOTTLENECK: Variable, 2s-30s
    [EventFlowStage.BROWSER_RESPONSE_EXTRACTED, 100],
    [EventFlowStage.SERVER_RESPONSE_RECEIVED, 50],
    [EventFlowStage.INTEGRATION_RESPONSE_ROUTED, 10],
    [EventFlowStage.CLI_OUTPUT_FORMATTED, 30],
    [EventFlowStage.CLI_OUTPUT_DISPLAYED, 10]
  ]);
}

/**
 * Event flow tracker for debugging and optimization
 */
export class EventFlowTracker {
  private stageTimestamps: Map<EventFlowStage, Date> = new Map();
  private stageLatencies: Map<EventFlowStage, number> = new Map();
  private correlationId: string;
  private startTime: Date;
  
  constructor(correlationId: string) {
    this.correlationId = correlationId;
    this.startTime = new Date();
  }
  
  /**
   * Record entry into a flow stage
   */
  enterStage(stage: EventFlowStage): void {
    this.stageTimestamps.set(stage, new Date());
    console.log(`[${this.correlationId}] → ${stage} (Owner: ${EventFlowDefinition.STAGE_OWNERSHIP.get(stage)})`);
    
    // Check if this is a bottleneck stage
    if (EventFlowDefinition.BOTTLENECK_STAGES.includes(stage)) {
      console.warn(`⚠️ BOTTLENECK STAGE: ${stage} - Wences investigating`);
    }
  }
  
  /**
   * Record exit from a flow stage
   */
  exitStage(stage: EventFlowStage): void {
    const enterTime = this.stageTimestamps.get(stage);
    if (!enterTime) return;
    
    const latency = Date.now() - enterTime.getTime();
    this.stageLatencies.set(stage, latency);
    
    const expected = EventFlowDefinition.EXPECTED_LATENCY.get(stage) || 0;
    const status = latency > expected * 2 ? '🔴' : latency > expected ? '🟡' : '🟢';
    
    console.log(`[${this.correlationId}] ← ${stage} ${status} ${latency}ms (expected: ${expected}ms)`);
    
    // Alert on bottleneck stages exceeding thresholds
    if (EventFlowDefinition.BOTTLENECK_STAGES.includes(stage) && latency > expected * 2) {
      console.error(`🚨 BOTTLENECK ALERT: ${stage} took ${latency}ms (expected: ${expected}ms)`);
      console.error(`   Owner: Wences - Requires immediate attention`);
    }
  }
  
  /**
   * Get flow performance report
   */
  getReport(): {
    correlationId: string;
    totalLatency: number;
    stageLatencies: Map<EventFlowStage, number>;
    bottlenecks: Array<{stage: EventFlowStage; latency: number; severity: string}>;
  } {
    const totalLatency = Date.now() - this.startTime.getTime();
    const bottlenecks: Array<{stage: EventFlowStage; latency: number; severity: string}> = [];
    
    // Identify bottlenecks
    this.stageLatencies.forEach((latency, stage) => {
      const expected = EventFlowDefinition.EXPECTED_LATENCY.get(stage) || 0;
      if (latency > expected * 2) {
        bottlenecks.push({
          stage,
          latency,
          severity: latency > expected * 5 ? 'CRITICAL' : latency > expected * 3 ? 'HIGH' : 'MEDIUM'
        });
      }
    });
    
    return {
      correlationId: this.correlationId,
      totalLatency,
      stageLatencies: this.stageLatencies,
      bottlenecks
    };
  }
}

/**
 * Wences's bottleneck solution tracker
 * CRITICAL: This is the primary blocker for the entire system
 */
export class IdleBusyDetectionSolution {
  /**
   * Current implementation status
   */
  static readonly STATUS = {
    problem: 'ChatGPT idle/busy detection unreliable',
    impact: 'Entire event flow blocked or delayed',
    owner: 'Wences',
    priority: 'CRITICAL',
    currentApproach: 'Multi-signal detection combining DOM, network, and timing',
    blockers: [
      'Dynamic DOM structure changes with ChatGPT updates',
      'No official API for state detection',
      'Multiple UI states not clearly distinguishable',
      'Race conditions between state checks and user actions'
    ],
    proposedSolutions: [
      {
        approach: 'MutationObserver on specific DOM elements',
        status: 'IN_PROGRESS',
        confidence: 0.7
      },
      {
        approach: 'Network request interception for OpenAI API calls',
        status: 'TESTING',
        confidence: 0.8
      },
      {
        approach: 'Visual state detection using element visibility',
        status: 'PLANNED',
        confidence: 0.6
      },
      {
        approach: 'Hybrid approach combining all signals',
        status: 'DESIGNING',
        confidence: 0.9
      }
    ],
    estimatedResolution: '2-3 days with focused effort',
    dependencies: [
      'Access to ChatGPT DOM structure documentation',
      'Testing across different ChatGPT UI versions',
      'Coordination with Diego for WebSocket timing'
    ]
  };
}