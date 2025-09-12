/**
 * @fileoverview Integration Monitoring System
 * @description Real-time monitoring and coordination of integration points
 * @owner Carlos - Integration Specialist
 */
import { EventEmitter } from 'events';
/**
 * Team member identifiers for tracking
 */
export declare enum TeamMember {
    RAFA = "rafa-tech-lead",
    ANA = "ana-monitor",
    WENCES = "wences-browser",
    DIEGO = "diego-server",
    ELENA = "elena-cli",
    CARLOS = "carlos-integration"
}
/**
 * Integration event types
 */
export declare enum IntegrationEventType {
    COMPONENT_STARTED = "component.started",
    COMPONENT_READY = "component.ready",
    COMPONENT_ERROR = "component.error",
    COMPONENT_STOPPED = "component.stopped",
    EVENT_DISPATCHED = "event.dispatched",
    EVENT_RECEIVED = "event.received",
    EVENT_PROCESSED = "event.processed",
    EVENT_FAILED = "event.failed",
    INTEGRATION_HEALTHY = "integration.healthy",
    INTEGRATION_DEGRADED = "integration.degraded",
    INTEGRATION_CRITICAL = "integration.critical",
    BOTTLENECK_DETECTED = "bottleneck.detected",
    BOTTLENECK_RESOLVED = "bottleneck.resolved"
}
/**
 * Integration status levels
 */
export declare enum IntegrationStatus {
    HEALTHY = "healthy",
    DEGRADED = "degraded",
    CRITICAL = "critical",
    UNKNOWN = "unknown"
}
/**
 * Integration event structure
 */
export interface IntegrationEvent {
    id: string;
    correlationId: string;
    timestamp: Date;
    type: IntegrationEventType;
    source: TeamMember;
    target?: TeamMember;
    status: IntegrationStatus;
    payload: any;
    metadata?: {
        latency?: number;
        errorCount?: number;
        retryCount?: number;
        [key: string]: any;
    };
}
/**
 * Component health information
 */
export interface ComponentHealth {
    component: TeamMember;
    status: IntegrationStatus;
    uptime: number;
    lastHeartbeat: Date;
    metrics: {
        eventsProcessed: number;
        eventsFailde: number;
        averageLatency: number;
        errorRate: number;
    };
}
/**
 * Bottleneck information
 */
export interface IntegrationBottleneck {
    id: string;
    detectedAt: Date;
    resolvedAt?: Date;
    component: TeamMember;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: string;
    suggestedFix?: string;
    metrics: {
        affectedEvents: number;
        latencyIncrease: number;
        errorIncrease: number;
    };
}
/**
 * Event flow tracking
 */
export interface EventFlow {
    correlationId: string;
    startTime: Date;
    endTime?: Date;
    path: TeamMember[];
    currentPosition: TeamMember;
    status: 'in-progress' | 'completed' | 'failed';
    totalLatency?: number;
    bottlenecks: IntegrationBottleneck[];
}
/**
 * Integration Monitor - Carlos's coordination system
 */
export declare class IntegrationMonitor extends EventEmitter {
    private componentHealth;
    private activeFlows;
    private bottlenecks;
    private eventHistory;
    private monitoringInterval?;
    constructor();
    /**
     * Initialize component health tracking
     */
    private initializeComponents;
    /**
     * Start monitoring integration health
     */
    startMonitoring(): void;
    /**
     * Stop monitoring
     */
    stopMonitoring(): void;
    /**
     * Record an integration event
     */
    recordEvent(event: IntegrationEvent): void;
    /**
     * Track event flow through components
     */
    private trackEventFlow;
    /**
     * Update component health metrics
     */
    private updateComponentMetrics;
    /**
     * Check for integration bottlenecks
     */
    private checkForBottlenecks;
    /**
     * Check overall component health
     */
    private checkComponentHealth;
    /**
     * Detect system-wide bottlenecks
     */
    private detectBottlenecks;
    /**
     * Analyze event flow patterns
     */
    private analyzeEventFlows;
    /**
     * Get current integration health report
     */
    getHealthReport(): {
        overall: IntegrationStatus;
        components: ComponentHealth[];
        activeFlows: number;
        bottlenecks: IntegrationBottleneck[];
        metrics: {
            totalEvents: number;
            successRate: number;
            averageLatency: number;
        };
    };
    /**
     * Resolve a bottleneck
     */
    resolveBottleneck(bottleneckId: string): void;
    /**
     * Get event history for debugging
     */
    getEventHistory(filter?: {
        source?: TeamMember;
        target?: TeamMember;
        type?: IntegrationEventType;
        since?: Date;
    }): IntegrationEvent[];
    /**
     * Clear old data to prevent memory issues
     */
    cleanup(olderThan: Date): void;
}
export declare const integrationMonitor: IntegrationMonitor;
//# sourceMappingURL=integration-monitor.d.ts.map