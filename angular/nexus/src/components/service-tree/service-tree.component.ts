import { Component, input, output, computed, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ServiceMeshService } from '../../services/service-mesh.service.js';
import { HostProfileService } from '../../services/host-profile.service.js';
import {
  ServiceInstance,
  Framework,
  ServiceDependency,
  Deployment,
  HealthStatus,
  DeploymentStatus,
  getHealthStatusColor,
  getFrameworkIcon
} from '../../models/service-mesh.model.js';

interface GroupedService {
  framework: Framework;
  services: ServiceInstance[];
  deployments: Deployment[];
  healthySummary: { healthy: number; unhealthy: number; unknown: number };
}

@Component({
  selector: 'app-service-tree',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './service-tree.component.html',
  styleUrls: ['./service-tree.component.css']
})
export class ServiceTreeComponent {
  private serviceMeshService = inject(ServiceMeshService);
  private hostProfileService = inject(HostProfileService);

  services = input<ServiceInstance[]>([]);
  dependencies = input<ServiceDependency[]>([]);
  deployments = input<Deployment[]>([]);
  selectedService = input<ServiceInstance | null>(null);
  serviceSelected = output<ServiceInstance>();
  restartService = output<ServiceInstance>();
  viewLogs = output<ServiceInstance>();

  groupedServices = computed<GroupedService[]>(() => {
    const services = this.services();
    const deployments = this.getAllDeployments();

    // Group services by framework
    const frameworkMap = new Map<string, Framework>();
    const serviceMap = new Map<string, ServiceInstance[]>();
    const deploymentMap = new Map<string, Deployment[]>();

    // Populate maps
    services.forEach(service => {
      if (!serviceMap.has(service.framework.id)) {
        serviceMap.set(service.framework.id, []);
        frameworkMap.set(service.framework.id, service.framework);
      }
      serviceMap.get(service.framework.id)?.push(service);
    });

    deployments.forEach(deployment => {
      const serviceId = deployment.service.id;
      if (!deploymentMap.has(serviceId)) {
        deploymentMap.set(serviceId, []);
      }
      deploymentMap.get(serviceId)?.push(deployment);
    });

    // Create grouped services with health summaries
    const result: GroupedService[] = [];
    for (const [frameworkId, framework] of frameworkMap) {
      const frameworkServices = serviceMap.get(frameworkId) || [];
      const frameworkDeployments = frameworkServices.flatMap(service =>
        deploymentMap.get(service.id) || []
      );

      const healthy = frameworkDeployments.filter(d => d.healthStatus === 'HEALTHY').length;
      const unhealthy = frameworkDeployments.filter(d => d.healthStatus === 'UNHEALTHY').length;
      const unknown = frameworkDeployments.filter(d =>
        d.healthStatus === 'UNKNOWN' || d.healthStatus === 'DEGRADED'
      ).length;

      result.push({
        framework,
        services: frameworkServices,
        deployments: frameworkDeployments,
        healthySummary: { healthy, unhealthy, unknown }
      });
    }

    // Sort by framework name
    return result.sort((a, b) => a.framework.name.localeCompare(b.framework.name));
  });

  expandedFrameworks = signal<Set<number>>(new Set());

  toggleFramework(frameworkId: number): void {
    this.expandedFrameworks.update(set => {
      const newSet = new Set(set);
      if (newSet.has(frameworkId)) {
        newSet.delete(frameworkId);
      } else {
        newSet.add(frameworkId);
      }
      return newSet;
    });
  }

  isFrameworkExpanded(frameworkId: number): boolean {
    return this.expandedFrameworks().has(frameworkId);
  }

  selectService(service: ServiceInstance): void {
    this.serviceSelected.emit(service);
  }

  canRestart(service: ServiceInstance): boolean {
    // Check if the service has any running deployments that can be restarted
    return this.getDeploymentsForService(service.id).some(d =>
      d.status === 'RUNNING' || d.status === 'STOPPED'
    );
  }

  async restart(service: ServiceInstance): Promise<void> {
    // Find the first host profile to use for the operation
    const profiles = this.hostProfileService.profiles();
    if (profiles.length > 0) {
      const profile = profiles[0]; // In a more sophisticated version, we could select based on service metadata
      const result = await this.serviceMeshService.executeServiceOperation(service.id, 'restart', profile);
      console.log('Restart operation result:', result);

      if (!result.success) {
        console.error('Failed to restart service:', result.message);
      }
    }
  }

  async viewServiceLogs(service: ServiceInstance): Promise<void> {
    // Find the first host profile to use for the operation
    const profiles = this.hostProfileService.profiles();
    if (profiles.length > 0) {
      const profile = profiles[0];
      const result = await this.serviceMeshService.executeServiceOperation(service.id, 'view-logs', profile);
      console.log('View logs operation result:', result);

      // In a real implementation, we would open logs in a new window/tab
      if (result.success && result.data && typeof result.data === 'object' && 'logsUrl' in result.data) {
        const logsUrl = (result.data as any).logsUrl;
        window.open(logsUrl, '_blank');
      }
    }
  }

  private getAllDeployments(): Deployment[] {
    return this.deployments();
  }

  getDeploymentsForService(serviceId: string): Deployment[] {
    return this.deployments().filter(d => d.service.id === serviceId);
  }

  getFrameworkIcon(category: string): string {
    return getFrameworkIcon(category as any); // Type assertion to FrameworkCategory
  }

  getHealthStatusColor(status: HealthStatus): string {
    return getHealthStatusColor(status);
  }

  getDeploymentHealthStatus(service: ServiceInstance): HealthStatus {
    const deployments = this.getDeploymentsForService(service.id);
    if (deployments.length === 0) {
      return 'UNKNOWN';
    }

    // If any deployment is unhealthy, return unhealthy
    // Otherwise, if any is degraded, return degraded
    // Otherwise, if all are healthy, return healthy
    const healthStatuses = deployments.map(d => d.healthStatus);

    if (healthStatuses.some(s => s === 'UNHEALTHY')) {
      return 'UNHEALTHY';
    } else if (healthStatuses.some(s => s === 'DEGRADED')) {
      return 'DEGRADED';
    } else if (healthStatuses.every(s => s === 'HEALTHY')) {
      return 'HEALTHY';
    } else {
      return 'UNKNOWN';
    }
  }

  getDeploymentStatus(service: ServiceInstance): DeploymentStatus {
    const deployments = this.getDeploymentsForService(service.id);
    if (deployments.length === 0) {
      return 'UNKNOWN';
    }

    // If any deployment is running, return running
    // Otherwise, if any is starting/stopping, return that
    // Otherwise, if any is failed, return failed
    // Otherwise, if all are stopped, return stopped
    const statuses = deployments.map(d => d.status);

    if (statuses.some(s => s === 'RUNNING')) {
      return 'RUNNING';
    } else if (statuses.some(s => s === 'STARTING')) {
      return 'STARTING';
    } else if (statuses.some(s => s === 'STOPPING')) {
      return 'STOPPING';
    } else if (statuses.some(s => s === 'FAILED')) {
      return 'FAILED';
    } else if (statuses.every(s => s === 'STOPPED')) {
      return 'STOPPED';
    } else {
      return 'UNKNOWN';
    }
  }
}