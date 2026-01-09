import { Component, computed, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ServiceMeshService } from '../../services/service-mesh.service.js';
import { UiPreferencesService } from '../../services/ui-preferences.service.js';
import { ServiceTreeComponent } from '../service-tree/service-tree.component.js';
import { ServiceGraphComponent } from '../service-graph/service-graph.component.js';

import {
  ServiceInstance,
  ServiceDependency,
  Deployment,
  ServiceMeshSummary
} from '../../models/service-mesh.model.js';

@Component({
  selector: 'app-service-mesh',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    ServiceTreeComponent,
    ServiceGraphComponent
  ],
  templateUrl: './service-mesh.component.html',
  styleUrls: ['./service-mesh.component.css']
})
export class ServiceMeshComponent implements OnInit {
  private serviceMeshService = inject(ServiceMeshService);
  private uiPreferencesService = inject(UiPreferencesService);

  // State
  services = signal<ServiceInstance[]>([]);
  dependencies = signal<ServiceDependency[]>([]);
  deployments = signal<Deployment[]>([]);
  selectedService = this.serviceMeshService.selectedService;
  viewMode = signal<'tree' | 'graph'>('tree'); // Default to tree view
  isRefreshing = signal(false);

  // Computed properties
  summary = computed(() => this.serviceMeshService.summary());
  frameworkGroups = computed(() => this.serviceMeshService.frameworkGroups());

  constructor() {
    // Set up reactive effects to update component state from service
    effect(() => {
      this.services.set(this.serviceMeshService.services());
    });

    effect(() => {
      this.dependencies.set(this.serviceMeshService.dependencies());
    });

    effect(() => {
      this.deployments.set(this.serviceMeshService.deployments());
    });

    // Start polling when the component is created
    this.serviceMeshService.startPolling();
  }

  ngOnInit(): void {
    // Initial data fetch
    this.refreshData();
  }

  ngOnDestroy(): void {
    this.serviceMeshService.stopPolling();
    this.serviceMeshService.selectService(null);
  }

  refreshData(): void {
    this.isRefreshing.set(true);
    this.serviceMeshService.fetchAllData().finally(() => {
      this.isRefreshing.set(false);
    });
  }

  onServiceSelected(service: ServiceInstance): void {
    this.serviceMeshService.selectService(service);
    if (!this.uiPreferencesService.isDetailPaneOpen()) {
      this.uiPreferencesService.toggleDetailPane();
    }
  }

  async onServiceRestart(service: ServiceInstance): Promise<void> {
    // Find the first host profile to use for the operation
    const profiles = this.serviceMeshService.connections();
    const profileArray = Array.from(profiles.values());

    if (profileArray.length > 0 && profileArray[0].connected) {
      const connection = profileArray[0];
      const result = await this.serviceMeshService.executeServiceOperation(
        service.id,
        'restart',
        connection.profile
      );
      console.log('Restart operation result:', result);

      if (!result.success) {
        console.error('Failed to restart service:', result.message);
      }
    } else {
      console.error('No connected host profiles available for service operation');
    }
  }

  async onServiceLogs(service: ServiceInstance): Promise<void> {
    // Find the first host profile to use for the operation
    const profiles = this.serviceMeshService.connections();
    const profileArray = Array.from(profiles.values());

    if (profileArray.length > 0 && profileArray[0].connected) {
      const connection = profileArray[0];
      const result = await this.serviceMeshService.executeServiceOperation(
        service.id,
        'view-logs',
        connection.profile
      );
      console.log('View logs operation result:', result);

      // In a real implementation, we would open logs in a new window/tab
      if (result.success && result.data && typeof result.data === 'object' && 'logsUrl' in result.data) {
        const logsUrl = (result.data as any).logsUrl;
        window.open(logsUrl, '_blank');
      }
    } else {
      console.error('No connected host profiles available for service operation');
    }
  }

  switchToGraphView(): void {
    this.viewMode.set('graph');
  }

  switchToTreeView(): void {
    this.viewMode.set('tree');
  }
}