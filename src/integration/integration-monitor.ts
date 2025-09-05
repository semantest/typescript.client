/**
 * @fileoverview Integration Monitoring System
 * @description Real-time monitoring and coordination of integration points
 * @owner Carlos - Integration Specialist
 */

import { Event } from '@typescript-eda/domain';
import { EventEmitter } from 'events';

/**
 * Team member identifiers for tracking
 */
export enum TeamMember {
  RAFA = 'rafa-tech-lead',
  ANA = 'ana-monitor',
  WENCES = 'wences-browser',
  FRAN = 'fran-backend',  // Backend Engineer (WebSocket Server)
  ELENA = 'elena-cli',
  CARLOS = 'carlos-integration',
  DIEGO = 'diego-fullstack'  // Full-Stack Developer (future needs)
}

/**
 * Integration event types
 */
export enum IntegrationEventType {
  // Component lifecycle
  COMPONENT_STARTED = 'component.started',
  COMPONENT_READY = 'component.ready',
  COMPONENT_ERROR = 'component.error',
  COMPONENT_STOPPED = 'component.stopped',
  
  // Event flow
  EVENT_DISPATCHED = 'event.dispatched',
  EVENT_RECEIVED = 'event.received',
  EVENT_PROCESSED = 'event.processed',
  EVENT_FAILED = 'event.failed',
  
  // Integration health
  INTEGRATION_HEALTHY = 'integration.healthy',
  INTEGRATION_DEGRADED = 'integration.degraded',
  INTEGRATION_CRITICAL = 'integration.critical',
  
  // Bottlenecks
  BOTTLENECK_DETECTED = 'bottleneck.detected',
  BOTTLENECK_RESOLVED = 'bottleneck.resolved'
}

/**
 * Integration status levels
 */
export enum IntegrationStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  CRITICAL = 'critical',
  UNKNOWN = 'unknown'
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
export class IntegrationMonitor extends EventEmitter {
  private componentHealth: Map<TeamMember, ComponentHealth>;
  private activeFlows: Map<string, EventFlow>;
  private bottlenecks: Map<string, IntegrationBottleneck>;
  private eventHistory: IntegrationEvent[];
  private monitoringInterval?: NodeJS.Timeout;

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
  private initializeComponents(): void {
    Object.values(TeamMember).forEach(member => {
      this.componentHealth.set(member as TeamMember, {
        component: member as TeamMember,
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
  public startMonitoring(): void {
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
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.emit('monitoring.stopped');
  }

  /**
   * Record an integration event
   */
  public recordEvent(event: IntegrationEvent): void {
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
  private trackEventFlow(event: IntegrationEvent): void {
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
    } else {
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
      } else if (event.type === IntegrationEventType.EVENT_FAILED) {
        flow.status = 'failed';
        flow.endTime = new Date();
        
        this.emit('flow.failed', flow);
      }
    }
  }

  /**
   * Update component health metrics
   */
  private updateComponentMetrics(event: IntegrationEvent): void {
    const health = this.componentHealth.get(event.source);
    if (!health) return;
    
    health.lastHeartbeat = new Date();
    
    if (event.type === IntegrationEventType.EVENT_PROCESSED) {
      health.metrics.eventsProcessed++;
    } else if (event.type === IntegrationEventType.EVENT_FAILED) {
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
    } else if (health.metrics.errorRate > 0.05) {
      health.status = IntegrationStatus.DEGRADED;
    } else {
      health.status = IntegrationStatus.HEALTHY;
    }
  }

  /**
   * Check for integration bottlenecks
   */
  private checkForBottlenecks(event: IntegrationEvent): void {
    const latency = event.metadata?.latency || 0;
    const errorRate = event.metadata?.errorCount || 0;
    
    // Detect high latency bottleneck
    if (latency > 1000) { // > 1 second
      const bottleneck: IntegrationBottleneck = {
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
      const bottleneck: IntegrationBottleneck = {
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
  private checkComponentHealth(): void {
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
  private detectBottlenecks(): void {
    // Check for stuck flows
    this.activeFlows.forEach((flow, correlationId) => {
      if (flow.status === 'in-progress') {
        const age = Date.now() - flow.startTime.getTime();
        
        if (age > 60000) { // Stuck for more than 1 minute
          const bottleneck: IntegrationBottleneck = {
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
  private analyzeEventFlows(): void {
    const completedFlows = Array.from(this.activeFlows.values())
      .filter(f => f.status === 'completed');
    
    if (completedFlows.length === 0) return;
    
    // Calculate average flow time
    const avgFlowTime = completedFlows.reduce((sum, flow) => 
      sum + (flow.totalLatency || 0), 0) / completedFlows.length;
    
    // Find slowest path
    const slowestFlow = completedFlows.reduce((slowest, flow) => 
      (flow.totalLatency || 0) > (slowest.totalLatency || 0) ? flow : slowest);
    
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
  public getHealthReport(): {
    overall: IntegrationStatus;
    components: ComponentHealth[];
    activeFlows: number;
    bottlenecks: IntegrationBottleneck[];
    metrics: {
      totalEvents: number;
      successRate: number;
      averageLatency: number;
    };
  } {
    // Calculate overall status
    const statuses = Array.from(this.componentHealth.values())
      .map(h => h.status);
    
    let overall: IntegrationStatus = IntegrationStatus.HEALTHY;
    if (statuses.includes(IntegrationStatus.CRITICAL)) {
      overall = IntegrationStatus.CRITICAL;
    } else if (statuses.includes(IntegrationStatus.DEGRADED)) {
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
  public resolveBottleneck(bottleneckId: string): void {
    const bottleneck = this.bottlenecks.get(bottleneckId);
    if (bottleneck) {
      bottleneck.resolvedAt = new Date();
      this.emit('bottleneck.resolved', bottleneck);
    }
  }

  /**
   * Get event history for debugging
   */
  public getEventHistory(
    filter?: {
      source?: TeamMember;
      target?: TeamMember;
      type?: IntegrationEventType;
      since?: Date;
    }
  ): IntegrationEvent[] {
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
  public cleanup(olderThan: Date): void {
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

// Export singleton instance for Carlos's coordination
export const integrationMonitor = new IntegrationMonitor();