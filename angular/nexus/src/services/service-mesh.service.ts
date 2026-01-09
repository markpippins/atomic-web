import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, interval, BehaviorSubject, of, firstValueFrom } from 'rxjs';
import { switchMap, map, catchError, tap, shareReplay, takeUntil } from 'rxjs/operators';
import { HostProfileService } from './host-profile.service.js';
import { HostProfile } from '../models/host-profile.model.js';
import {
  Framework,
  ServiceInstance,
  Server,
  Deployment,
  ServiceConfiguration,
  ServiceDependency,
  ServiceMeshSummary,
  FrameworkGroup,
  ServiceUpdate,
  OperationRequest,
  OperationResult,
  HealthStatus,
  DeploymentStatus,
  ServerEnvironment,
  ServiceOperation
} from '../models/service-mesh.model.js';

export interface ServiceMeshConnection {
  profileId: string;
  profile: HostProfile;
  baseUrl: string;
  connected: boolean;
  lastError?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceMeshService {
  private http = inject(HttpClient);
  private hostProfileService = inject(HostProfileService);

  private destroy$ = new Subject<void>();
  private pollInterval = 10000; // 10 seconds

  // Reactive state
  private _frameworks = signal<Framework[]>([]);
  private _services = signal<ServiceInstance[]>([]);
  private _servers = signal<Server[]>([]);
  private _deployments = signal<Deployment[]>([]);
  private _dependencies = signal<ServiceDependency[]>([]);
  private _connections = signal<Map<string, ServiceMeshConnection>>(new Map());
  private _isPolling = signal(false);
  private _lastUpdated = signal<Date | null>(null);

  // Selection State
  private _selectedService = signal<ServiceInstance | null>(null);
  private _selectedPlatformNode = signal<{ type: string, baseUrl: string } | null>(null);
  private _selectedServiceConfigurations = signal<ServiceConfiguration[]>([]);

  // Public readonly signals
  readonly frameworks = this._frameworks.asReadonly();
  readonly services = this._services.asReadonly();
  readonly servers = this._servers.asReadonly();
  readonly selectedPlatformNode = this._selectedPlatformNode.asReadonly();
  readonly deployments = this._deployments.asReadonly();
  readonly dependencies = this._dependencies.asReadonly();
  readonly connections = this._connections.asReadonly();
  readonly isPolling = this._isPolling.asReadonly();
  readonly lastUpdated = this._lastUpdated.asReadonly();

  readonly selectedService = this._selectedService.asReadonly();
  readonly selectedServiceConfigurations = this._selectedServiceConfigurations.asReadonly();

  constructor() {
    // Auto-connect to all host profiles on startup/change
    effect(() => {
      const profiles = this.hostProfileService.profiles();
      // Simple strategy: try to connect to all of them if not already connected
      profiles.forEach(profile => {
        if (!this._connections().has(profile.id)) {
          this.connectToProfile(profile);
        }
      });
    }, { allowSignalWrites: true });

    this.startPolling();
  }

  // Computed summary
  readonly summary = computed<ServiceMeshSummary>(() => {
    const services = this._services();
    const deployments = this._deployments();
    const servers = this._servers();
    const frameworks = this._frameworks();

    const activeServices = services.filter(s => s.status === 'ACTIVE').length;
    const healthyDeployments = deployments.filter(d => d.healthStatus === 'HEALTHY').length;
    const unhealthyDeployments = deployments.filter(d => d.healthStatus === 'UNHEALTHY').length;
    const activeServers = servers.filter(s => s.status === 'ACTIVE').length;

    const frameworkBreakdown = frameworks.map(f => ({
      framework: f.name,
      count: services.filter(s => s.framework?.id === f.id).length
    })).filter(fb => fb.count > 0);

    const environments: ServerEnvironment[] = ['DEVELOPMENT', 'STAGING', 'PRODUCTION', 'TEST'];
    const environmentBreakdown = environments.map(env => ({
      environment: env,
      count: deployments.filter(d => d.environment === env).length
    })).filter(eb => eb.count > 0);

    return {
      totalServices: services.length,
      activeServices,
      healthyDeployments,
      unhealthyDeployments,
      totalServers: servers.length,
      activeServers,
      frameworkBreakdown,
      environmentBreakdown
    };
  });

  // Computed grouped services by framework
  readonly frameworkGroups = computed<FrameworkGroup[]>(() => {
    const frameworks = this._frameworks();
    const services = this._services();
    const deployments = this._deployments();

    return frameworks.map(framework => {
      const frameworkServices = services.filter(s => s.framework?.id === framework.id);
      const frameworkDeployments = deployments.filter(d =>
        frameworkServices.some(s => s.id === d.service?.id)
      );

      const healthy = frameworkDeployments.filter(d => d.healthStatus === 'HEALTHY').length;
      const unhealthy = frameworkDeployments.filter(d => d.healthStatus === 'UNHEALTHY').length;
      const unknown = frameworkDeployments.filter(d =>
        d.healthStatus === 'UNKNOWN' || d.healthStatus === 'DEGRADED'
      ).length;

      return {
        framework,
        services: frameworkServices,
        deployments: frameworkDeployments,
        healthySummary: { healthy, unhealthy, unknown }
      };
    }).filter(g => g.services.length > 0);
  });

  // Service updates subject for real-time notifications
  private serviceUpdates$ = new Subject<ServiceUpdate>();

  // =========================================================================
  // Connection Management
  // =========================================================================

  private getBaseUrl(profile: HostProfile): string {
    let baseUrl = profile.hostServerUrl;
    if (!baseUrl.startsWith('http')) {
      baseUrl = `http://${baseUrl}`;
    }
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    return baseUrl;
  }

  async connectToProfile(profile: HostProfile): Promise<boolean> {
    const baseUrl = this.getBaseUrl(profile);

    try {
      await firstValueFrom(this.http.get(`${baseUrl}/api/frameworks`));

      const connection: ServiceMeshConnection = {
        profileId: profile.id,
        profile,
        baseUrl,
        connected: true
      };

      this._connections.update(map => {
        const newMap = new Map(map);
        newMap.set(profile.id, connection);
        return newMap;
      });

      // Trigger initial data fetch for this profile
      void this.fetchAllData();

      return true;
    } catch (error) {
      const connection: ServiceMeshConnection = {
        profileId: profile.id,
        profile,
        baseUrl,
        connected: false,
        lastError: (error as Error).message
      };

      this._connections.update(map => {
        const newMap = new Map(map);
        newMap.set(profile.id, connection);
        return newMap;
      });

      return false;
    }
  }

  disconnectFromProfile(profileId: string): void {
    this._connections.update(map => {
      const newMap = new Map(map);
      newMap.delete(profileId);
      return newMap;
    });
  }

  // =========================================================================
  // Selection Management
  // =========================================================================

  async selectService(service: ServiceInstance | null): Promise<void> {
    if (service) {
      this._selectedPlatformNode.set(null);
    }

    this._selectedService.set(service);

    if (service) {
      // Find a connected profile to fetch detailed configurations
      // Ideally we would know which profile the service belongs to, but for now we look for any connected profile
      // or iterate through them.
      // Since ServiceInstance does not explicitly store 'originProfileId' in its basic interface currently,
      // we might just try the first connected profile or all.

      const connections = Array.from(this._connections().values()).filter(c => c.connected);
      if (connections.length > 0) {
        // Try to fetch configurations from the first available connection
        // Refinement: We should probably store which profile a service came from.
        const connection = connections[0];
        const configs = await this.getServiceConfigurations(service.id, connection.baseUrl);
        this._selectedServiceConfigurations.set(configs);
      } else {
        this._selectedServiceConfigurations.set([]);
      }
    } else {
      this._selectedServiceConfigurations.set([]);
    }
  }

  async selectPlatformNode(type: string, baseUrl: string): Promise<void> {
    this._selectedService.set(null);
    this._selectedPlatformNode.set({ type, baseUrl });
  }

  // =========================================================================
  // Data Fetching
  // =========================================================================

  async fetchAllData(): Promise<void> {
    const connections = Array.from(this._connections().values())
      .filter(c => c.connected);

    if (connections.length === 0) {
      return;
    }

    const allFrameworks: Framework[] = [];
    const allServices: ServiceInstance[] = [];
    const allServers: Server[] = [];
    const allDeployments: Deployment[] = [];
    const allDependencies: ServiceDependency[] = [];

    for (const connection of connections) {
      try {
        const [frameworks, services, servers, deployments, dependencies] = await Promise.all([
          this.fetchFrameworks(connection.baseUrl),
          this.fetchServices(connection.baseUrl),
          this.fetchServers(connection.baseUrl),
          this.fetchDeployments(connection.baseUrl),
          this.fetchDependencies(connection.baseUrl)
        ]);

        allFrameworks.push(...frameworks);
        allServices.push(...services);
        allServers.push(...servers);
        allDeployments.push(...deployments);
        allDependencies.push(...dependencies);
      } catch (error) {
        console.error(`Failed to fetch data from ${connection.profile.name}:`, error);
      }
    }

    this._frameworks.set(allFrameworks);
    this._services.set(allServices);
    this._servers.set(allServers);
    this._deployments.set(allDeployments);
    this._dependencies.set(allDependencies);
    this._lastUpdated.set(new Date());
  }

  private async fetchFrameworks(baseUrl: string): Promise<Framework[]> {
    try {
      return await firstValueFrom(
        this.http.get<Framework[]>(`${baseUrl}/api/frameworks`)
      );
    } catch {
      return [];
    }
  }

  private async fetchServices(baseUrl: string): Promise<ServiceInstance[]> {
    try {
      return await firstValueFrom(
        this.http.get<ServiceInstance[]>(`${baseUrl}/api/services`)
      );
    } catch {
      return [];
    }
  }

  private async fetchServers(baseUrl: string): Promise<Server[]> {
    try {
      return await firstValueFrom(
        this.http.get<Server[]>(`${baseUrl}/api/servers`)
      );
    } catch {
      return [];
    }
  }

  private async fetchDeployments(baseUrl: string): Promise<Deployment[]> {
    try {
      return await firstValueFrom(
        this.http.get<Deployment[]>(`${baseUrl}/api/deployments`)
      );
    } catch {
      return [];
    }
  }

  private async fetchDependencies(baseUrl: string): Promise<ServiceDependency[]> {
    try {
      return await firstValueFrom(
        this.http.get<ServiceDependency[]>(`${baseUrl}/api/dependencies`)
      );
    } catch {
      return [];
    }
  }

  // =========================================================================
  // Polling
  // =========================================================================

  startPolling(): void {
    if (this._isPolling()) {
      return;
    }

    this._isPolling.set(true);

    interval(this.pollInterval)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.fetchAllData())
      )
      .subscribe();

    this.fetchAllData();
  }

  stopPolling(): void {
    this._isPolling.set(false);
    this.destroy$.next();
  }

  // =========================================================================
  // Service Details
  // =========================================================================

  async getServiceById(serviceId: string, baseUrl: string): Promise<ServiceInstance | null> {
    try {
      return await firstValueFrom(
        this.http.get<ServiceInstance>(`${baseUrl}/api/services/${serviceId}`)
      );
    } catch {
      return null;
    }
  }

  async getServiceDependencies(serviceId: string, baseUrl: string): Promise<ServiceInstance[]> {
    try {
      return await firstValueFrom(
        this.http.get<ServiceInstance[]>(`${baseUrl}/api/services/${serviceId}/dependencies`)
      );
    } catch {
      return [];
    }
  }

  async getServiceDependents(serviceId: string, baseUrl: string): Promise<ServiceInstance[]> {
    try {
      return await firstValueFrom(
        this.http.get<ServiceInstance[]>(`${baseUrl}/api/services/${serviceId}/dependents`)
      );
    } catch {
      return [];
    }
  }

  async getServiceConfigurations(serviceId: string, baseUrl: string): Promise<ServiceConfiguration[]> {
    try {
      return await firstValueFrom(
        this.http.get<ServiceConfiguration[]>(`${baseUrl}/api/configurations/service/${serviceId}`)
      );
    } catch {
      return [];
    }
  }

  async getDeploymentsForService(serviceId: string, baseUrl: string): Promise<Deployment[]> {
    try {
      return await firstValueFrom(
        this.http.get<Deployment[]>(`${baseUrl}/api/deployments/service/${serviceId}`)
      );
    } catch {
      return [];
    }
  }

  // =========================================================================
  // Service Operations
  // =========================================================================

  async executeOperation(request: OperationRequest, baseUrl: string): Promise<OperationResult> {
    const { deploymentId, operation, params } = request;

    try {
      let response: unknown;

      switch (operation) {
        case 'start':
          response = await firstValueFrom(
            this.http.post(`${baseUrl}/api/deployments/${deploymentId}/start`, params ?? {})
          );
          break;
        case 'stop':
          response = await firstValueFrom(
            this.http.post(`${baseUrl}/api/deployments/${deploymentId}/stop`, params ?? {})
          );
          break;
        case 'restart':
          await firstValueFrom(
            this.http.post(`${baseUrl}/api/deployments/${deploymentId}/stop`, {})
          );
          response = await firstValueFrom(
            this.http.post(`${baseUrl}/api/deployments/${deploymentId}/start`, {})
          );
          break;
        case 'health-check':
          response = await firstValueFrom(
            this.http.get(`${baseUrl}/api/deployments/${deploymentId}`)
          );
          break;
        case 'view-logs':
          // For view-logs, we'll return a placeholder URL or info
          // In a real implementation, this would fetch actual logs
          response = { logsUrl: `${baseUrl}/api/deployments/${deploymentId}/logs` };
          break;
        case 'view-config':
          // For view-config, fetch configuration
          response = await firstValueFrom(
            this.http.get(`${baseUrl}/api/configurations/deployment/${deploymentId}`)
          );
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      await this.fetchAllData();

      // Find the profileId for this baseUrl to include in the update notification
      const connection = Array.from(this._connections().values()).find(c => c.baseUrl === baseUrl);

      this.notifyUpdate({
        type: 'STATUS_CHANGE',
        hostProfileId: connection?.profileId || 'unknown',
        serviceId: '-1', // We'll need a better way to get serviceId if needed
        deploymentId,
        newValue: operation,
      });

      return {
        success: true,
        operation,
        deploymentId,
        message: `Operation ${operation} completed successfully`,
        data: response,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        operation,
        deploymentId,
        message: (error as Error).message,
        timestamp: new Date()
      };
    }
  }

  private notifyUpdate(update: Omit<ServiceUpdate, 'timestamp'>): void {
    this.serviceUpdates$.next({
      ...update,
      timestamp: new Date()
    });
  }

  async executeServiceOperation(serviceId: string, operation: ServiceOperation, profile: HostProfile): Promise<OperationResult> {
    let baseUrl = profile.hostServerUrl;
    if (!baseUrl.startsWith('http')) {
      baseUrl = `http://${baseUrl}`;
    }
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }

    // Get all deployments for this service
    const deployments = await this.getDeploymentsForService(serviceId, baseUrl);

    if (deployments.length === 0) {
      return {
        success: false,
        operation,
        deploymentId: '-1',
        message: 'No deployments found for this service',
        timestamp: new Date()
      };
    }

    // Execute the operation on all deployments of the service
    const results: OperationResult[] = [];
    for (const deployment of deployments) {
      const result = await this.executeOperation({
        deploymentId: deployment.id,
        operation,
        params: { serviceId }
      }, baseUrl);
      results.push(result);
    }

    // Check if all operations were successful
    const allSuccessful = results.every(r => r.success);

    return {
      success: allSuccessful,
      operation,
      deploymentId: '-1', // Not applicable for service-wide operations
      message: allSuccessful
        ? `Operation ${operation} completed on all deployments of service ${serviceId}`
        : `Operation ${operation} failed on one or more deployments`,
      data: results,
      timestamp: new Date()
    };
  }

  async updateDeploymentHealth(
    deploymentId: string,
    healthStatus: HealthStatus,
    baseUrl: string
  ): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.post(
          `${baseUrl}/api/deployments/${deploymentId}/health`,
          null,
          { params: { healthStatus } }
        )
      );
      await this.fetchAllData();
      return true;
    } catch {
      return false;
    }
  }

  // =========================================================================
  // Real-time Updates Stream
  // =========================================================================

  watchServiceUpdates(): Observable<ServiceUpdate> {
    return this.serviceUpdates$.asObservable();
  }

  // =========================================================================
  // Cleanup
  // =========================================================================

  ngOnDestroy(): void {
    this.stopPolling();
    this.destroy$.complete();
    this.serviceUpdates$.complete();
  }
}
