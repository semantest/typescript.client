"use strict";
/**
 * @fileoverview Integration Monitoring System
 * @description Real-time monitoring and coordination of integration points
 * @owner Carlos - Integration Specialist
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrationMonitor = exports.IntegrationMonitor = exports.IntegrationStatus = exports.IntegrationEventType = exports.TeamMember = void 0;
const events_1 = require("events");
/**
 * Team member identifiers for tracking
 */
var TeamMember;
(function (TeamMember) {
    TeamMember["RAFA"] = "rafa-tech-lead";
    TeamMember["ANA"] = "ana-monitor";
    TeamMember["WENCES"] = "wences-browser";
    TeamMember["DIEGO"] = "diego-server";
    TeamMember["ELENA"] = "elena-cli";
    TeamMember["CARLOS"] = "carlos-integration";
})(TeamMember || (exports.TeamMember = TeamMember = {}));
/**
 * Integration event types
 */
var IntegrationEventType;
(function (IntegrationEventType) {
    // Component lifecycle
    IntegrationEventType["COMPONENT_STARTED"] = "component.started";
    IntegrationEventType["COMPONENT_READY"] = "component.ready";
    IntegrationEventType["COMPONENT_ERROR"] = "component.error";
    IntegrationEventType["COMPONENT_STOPPED"] = "component.stopped";
    // Event flow
    IntegrationEventType["EVENT_DISPATCHED"] = "event.dispatched";
    IntegrationEventType["EVENT_RECEIVED"] = "event.received";
    IntegrationEventType["EVENT_PROCESSED"] = "event.processed";
    IntegrationEventType["EVENT_FAILED"] = "event.failed";
    // Integration health
    IntegrationEventType["INTEGRATION_HEALTHY"] = "integration.healthy";
    IntegrationEventType["INTEGRATION_DEGRADED"] = "integration.degraded";
    IntegrationEventType["INTEGRATION_CRITICAL"] = "integration.critical";
    // Bottlenecks
    IntegrationEventType["BOTTLENECK_DETECTED"] = "bottleneck.detected";
    IntegrationEventType["BOTTLENECK_RESOLVED"] = "bottleneck.resolved";
})(IntegrationEventType || (exports.IntegrationEventType = IntegrationEventType = {}));
/**
 * Integration status levels
 */
var IntegrationStatus;
(function (IntegrationStatus) {
    IntegrationStatus["HEALTHY"] = "healthy";
    IntegrationStatus["DEGRADED"] = "degraded";
    IntegrationStatus["CRITICAL"] = "critical";
    IntegrationStatus["UNKNOWN"] = "unknown";
})(IntegrationStatus || (exports.IntegrationStatus = IntegrationStatus = {}));
/**
 * Integration Monitor - Carlos's coordination system
 */
class IntegrationMonitor extends events_1.EventEmitter {
    constructor() {
        super();
        this.componentHealth = new Map();
        this.activeFlows = new Map();
        this.bottlenecks = new Map();
        this.eventHistory = [];
        this.initializeComponents();
    }
    /**
     * Initialize component health tracking
     */
    initializeComponents() {
        Object.values(TeamMember).forEach(member => {
            this.componentHealth.set(member, {
                component: member,
                status: IntegrationStatus.UNKNOWN,
                uptime: 0,
                lastHeartbeat: new Date(),
                metrics: {
                    eventsProcessed: 0,
                    eventsFailde: 0,
                    averageLatency: 0,
                    errorRate: 0
                }
            });
        });
    }
    /**
     * Start monitoring integration health
     */
    startMonitoring() {
        console.log('🎯 Carlos: Starting integration monitoring...');
        this.monitoringInterval = setInterval(() => {
            this.checkComponentHealth();
            this.detectBottlenecks();
            this.analyzeEventFlows();
        }, 5000); // Check every 5 seconds
        this.emit('monitoring.started');
    }
    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = undefined;
        }
        this.emit('monitoring.stopped');
    }
    /**
     * Record an integration event
     */
    recordEvent(event) {
        // Store event
        this.eventHistory.push(event);
        // Update component metrics
        this.updateComponentMetrics(event);
        // Track event flow
        this.trackEventFlow(event);
        // Check for bottlenecks
        this.checkForBottlenecks(event);
        // Emit for subscribers
        this.emit('integration.event', event);
    }
    /**
     * Track event flow through components
     */
    trackEventFlow(event) {
        const { correlationId, source, target } = event;
        let flow = this.activeFlows.get(correlationId);
        if (!flow) {
            // New flow
            flow = {
                correlationId,
                startTime: new Date(),
                path: [source],
                currentPosition: source,
                status: 'in-progress',
                bottlenecks: []
            };
            this.activeFlows.set(correlationId, flow);
        }
        else {
            // Update existing flow
            if (target && !flow.path.includes(target)) {
                flow.path.push(target);
            }
            flow.currentPosition = target || source;
            // Check if flow is complete
            if (event.type === IntegrationEventType.EVENT_PROCESSED) {
                flow.status = 'completed';
                flow.endTime = new Date();
                flow.totalLatency = flow.endTime.getTime() - flow.startTime.getTime();
                this.emit('flow.completed', flow);
            }
            else if (event.type === IntegrationEventType.EVENT_FAILED) {
                flow.status = 'failed';
                flow.endTime = new Date();
                this.emit('flow.failed', flow);
            }
        }
    }
    /**
     * Update component health metrics
     */
    updateComponentMetrics(event) {
        const health = this.componentHealth.get(event.source);
        if (!health)
            return;
        health.lastHeartbeat = new Date();
        if (event.type === IntegrationEventType.EVENT_PROCESSED) {
            health.metrics.eventsProcessed++;
        }
        else if (event.type === IntegrationEventType.EVENT_FAILED) {
            health.metrics.eventsFailde++;
        }
        // Update average latency
        if (event.metadata?.latency) {
            const currentAvg = health.metrics.averageLatency;
            const totalEvents = health.metrics.eventsProcessed + health.metrics.eventsFailde;
            health.metrics.averageLatency =
                (currentAvg * (totalEvents - 1) + event.metadata.latency) / totalEvents;
        }
        // Calculate error rate
        const total = health.metrics.eventsProcessed + health.metrics.eventsFailde;
        health.metrics.errorRate = total > 0 ? health.metrics.eventsFailde / total : 0;
        // Update status based on metrics
        if (health.metrics.errorRate > 0.1) {
            health.status = IntegrationStatus.CRITICAL;
        }
        else if (health.metrics.errorRate > 0.05) {
            health.status = IntegrationStatus.DEGRADED;
        }
        else {
            health.status = IntegrationStatus.HEALTHY;
        }
    }
    /**
     * Check for integration bottlenecks
     */
    checkForBottlenecks(event) {
        const latency = event.metadata?.latency || 0;
        const errorRate = event.metadata?.errorCount || 0;
        // Detect high latency bottleneck
        if (latency > 1000) { // > 1 second
            const bottleneck = {
                id: `bottleneck-${Date.now()}`,
                detectedAt: new Date(),
                component: event.source,
                severity: latency > 5000 ? 'critical' : latency > 2000 ? 'high' : 'medium',
                description: `High latency detected in ${event.source}`,
                impact: `Event processing delayed by ${latency}ms`,
                suggestedFix: 'Consider implementing caching or optimizing processing logic',
                metrics: {
                    affectedEvents: 1,
                    latencyIncrease: latency,
                    errorIncrease: 0
                }
            };
            this.bottlenecks.set(bottleneck.id, bottleneck);
            this.emit('bottleneck.detected', bottleneck);
        }
        // Detect high error rate bottleneck
        if (errorRate > 5) {
            const bottleneck = {
                id: `bottleneck-error-${Date.now()}`,
                detectedAt: new Date(),
                component: event.source,
                severity: errorRate > 20 ? 'critical' : errorRate > 10 ? 'high' : 'medium',
                description: `High error rate in ${event.source}`,
                impact: `${errorRate} errors detected`,
                suggestedFix: 'Review error logs and implement proper error handling',
                metrics: {
                    affectedEvents: errorRate,
                    latencyIncrease: 0,
                    errorIncrease: errorRate
                }
            };
            this.bottlenecks.set(bottleneck.id, bottleneck);
            this.emit('bottleneck.detected', bottleneck);
        }
    }
    /**
     * Check overall component health
     */
    checkComponentHealth() {
        const now = new Date();
        this.componentHealth.forEach((health, component) => {
            const timeSinceLastHeartbeat = now.getTime() - health.lastHeartbeat.getTime();
            // Component is considered unhealthy if no heartbeat for 30 seconds
            if (timeSinceLastHeartbeat > 30000) {
                health.status = IntegrationStatus.CRITICAL;
                this.emit('component.unhealthy', {
                    component,
                    lastSeen: health.lastHeartbeat,
                    timeSinceLastHeartbeat
                });
            }
        });
    }
    /**
     * Detect system-wide bottlenecks
     */
    detectBottlenecks() {
        // Check for stuck flows
        this.activeFlows.forEach((flow, correlationId) => {
            if (flow.status === 'in-progress') {
                const age = Date.now() - flow.startTime.getTime();
                if (age > 60000) { // Stuck for more than 1 minute
                    const bottleneck = {
                        id: `stuck-flow-${correlationId}`,
                        detectedAt: new Date(),
                        component: flow.currentPosition,
                        severity: 'high',
                        description: `Event flow stuck at ${flow.currentPosition}`,
                        impact: `Flow ${correlationId} has been stuck for ${Math.round(age / 1000)}s`,
                        suggestedFix: 'Check component logs and restart if necessary',
                        metrics: {
                            affectedEvents: 1,
                            latencyIncrease: age,
                            errorIncrease: 0
                        }
                    };
                    this.bottlenecks.set(bottleneck.id, bottleneck);
                    this.emit('bottleneck.detected', bottleneck);
                }
            }
        });
    }
    /**
     * Analyze event flow patterns
     */
    analyzeEventFlows() {
        const completedFlows = Array.from(this.activeFlows.values())
            .filter(f => f.status === 'completed');
        if (completedFlows.length === 0)
            return;
        // Calculate average flow time
        const avgFlowTime = completedFlows.reduce((sum, flow) => sum + (flow.totalLatency || 0), 0) / completedFlows.length;
        // Find slowest path
        const slowestFlow = completedFlows.reduce((slowest, flow) => (flow.totalLatency || 0) > (slowest.totalLatency || 0) ? flow : slowest);
        // Emit analytics
        this.emit('flow.analytics', {
            totalFlows: this.activeFlows.size,
            completedFlows: completedFlows.length,
            averageFlowTime: avgFlowTime,
            slowestPath: slowestFlow.path,
            slowestTime: slowestFlow.totalLatency
        });
    }
    /**
     * Get current integration health report
     */
    getHealthReport() {
        // Calculate overall status
        const statuses = Array.from(this.componentHealth.values())
            .map(h => h.status);
        let overall = IntegrationStatus.HEALTHY;
        if (statuses.includes(IntegrationStatus.CRITICAL)) {
            overall = IntegrationStatus.CRITICAL;
        }
        else if (statuses.includes(IntegrationStatus.DEGRADED)) {
            overall = IntegrationStatus.DEGRADED;
        }
        // Calculate metrics
        const totalProcessed = Array.from(this.componentHealth.values())
            .reduce((sum, h) => sum + h.metrics.eventsProcessed, 0);
        const totalFailed = Array.from(this.componentHealth.values())
            .reduce((sum, h) => sum + h.metrics.eventsFailde, 0);
        const avgLatency = Array.from(this.componentHealth.values())
            .reduce((sum, h) => sum + h.metrics.averageLatency, 0) / this.componentHealth.size;
        return {
            overall,
            components: Array.from(this.componentHealth.values()),
            activeFlows: this.activeFlows.size,
            bottlenecks: Array.from(this.bottlenecks.values())
                .filter(b => !b.resolvedAt),
            metrics: {
                totalEvents: totalProcessed + totalFailed,
                successRate: totalProcessed / (totalProcessed + totalFailed) || 0,
                averageLatency: avgLatency
            }
        };
    }
    /**
     * Resolve a bottleneck
     */
    resolveBottleneck(bottleneckId) {
        const bottleneck = this.bottlenecks.get(bottleneckId);
        if (bottleneck) {
            bottleneck.resolvedAt = new Date();
            this.emit('bottleneck.resolved', bottleneck);
        }
    }
    /**
     * Get event history for debugging
     */
    getEventHistory(filter) {
        let events = this.eventHistory;
        if (filter) {
            if (filter.source) {
                events = events.filter(e => e.source === filter.source);
            }
            if (filter.target) {
                events = events.filter(e => e.target === filter.target);
            }
            if (filter.type) {
                events = events.filter(e => e.type === filter.type);
            }
            if (filter.since) {
                events = events.filter(e => e.timestamp >= filter.since);
            }
        }
        return events;
    }
    /**
     * Clear old data to prevent memory issues
     */
    cleanup(olderThan) {
        // Clean up event history
        this.eventHistory = this.eventHistory.filter(e => e.timestamp > olderThan);
        // Clean up completed flows
        this.activeFlows.forEach((flow, correlationId) => {
            if (flow.endTime && flow.endTime < olderThan) {
                this.activeFlows.delete(correlationId);
            }
        });
        // Clean up resolved bottlenecks
        this.bottlenecks.forEach((bottleneck, id) => {
            if (bottleneck.resolvedAt && bottleneck.resolvedAt < olderThan) {
                this.bottlenecks.delete(id);
            }
        });
    }
}
exports.IntegrationMonitor = IntegrationMonitor;
// Export singleton instance for Carlos's coordination
exports.integrationMonitor = new IntegrationMonitor();
//# sourceMappingURL=integration-monitor.js.map