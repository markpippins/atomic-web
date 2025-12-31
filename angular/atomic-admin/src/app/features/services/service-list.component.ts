import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ServiceFormComponent } from './service-form.component';
import { Service, Deployment } from '../../models/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-service-list',
  imports: [CommonModule, ServiceFormComponent],
  template: `
    <div class="page-container">
      <div class="header">
        <h1>Services</h1>
        <div class="actions">
          <button class="sync-btn" (click)="syncServices()">Sync Services</button>
          <button class="add-btn" (click)="showAddForm()">Add Service</button>
        </div>
      </div>

      @if (showForm()) {
        <div class="modal-overlay">
          <app-service-form 
            [service]="selectedService()" 
            (save)="onSave()" 
            (cancel)="onCancel()"
          ></app-service-form>
        </div>
      }

      @if (error()) {
        <div class="error-container">
          <p class="error-text">{{ error() }}</p>
          <button class="retry-btn" (click)="loadData()">Retry</button>
        </div>
      } @else {
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Framework</th>
              <th>Status</th>
              <th>Port</th>
              <th>Server</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (service of services(); track service.id) {
              <tr>
                <td>{{ service.name }}</td>
                <td>{{ service.type?.name }}</td>
                <td>{{ service.framework?.name || 'Unknown' }}</td>
                <td>
                  <span class="status-badge" [class]="service.status?.toLowerCase() || 'unknown'">
                    {{ service.status || 'Unknown' }}
                  </span>
                </td>
                <td>{{ service.defaultPort }}</td>
                <td>{{ getServerNames(service) }}</td>
                <td>
                  <button class="action-btn edit" (click)="editService(service)">Edit</button>
                  <button class="action-btn delete" (click)="deleteService(service)">Delete</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .actions {
      display: flex;
      gap: 10px;
    }
    .add-btn {
      background: #2ecc71;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
    }
    .sync-btn {
      background: #9b59b6;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .data-table th, .data-table td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #ecf0f1;
    }
    .data-table th {
      background-color: #f8f9fa;
      font-weight: 600;
      color: #2c3e50;
    }
    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 500;
    }
    .status-badge.active { background-color: #e8f5e9; color: #2e7d32; }
    .status-badge.inactive { background-color: #ffebee; color: #c62828; }
    .status-badge.deprecated { background-color: #fff3e0; color: #ef6c00; }
    
    .action-btn {
      padding: 4px 8px;
      margin-right: 5px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
    }
    .action-btn.edit { background: #3498db; color: white; }
    .action-btn.delete { background: #e74c3c; color: white; }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .error-container {
      text-align: center;
      padding: 40px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .error-text {
      color: #c62828;
      font-size: 1.1rem;
      margin-bottom: 15px;
    }
    .retry-btn {
      background: #3498db;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class ServiceListComponent {
  private apiService = inject(ApiService);

  services = signal<Service[]>([]);
  deployments = signal<Deployment[]>([]);
  showForm = signal(false);
  selectedService = signal<Service | null>(null);
  error = signal<string | null>(null);

  constructor() {
    this.loadData();
  }

  loadData() {
    this.error.set(null);
    forkJoin({
      services: this.apiService.getServices(),
      deployments: this.apiService.getDeployments()
    }).subscribe({
      next: ({ services, deployments }) => {
        this.services.set(services);
        this.deployments.set(deployments);
      },
      error: (err) => {
        console.error('Error loading services', err);
        this.error.set('Failed to load services. Please check your connection.');
      }
    });
  }

  loadServices() {
    this.loadData();
  }

  getServerNames(service: Service): string {
    const serviceDeployments = this.deployments().filter(d => d.service.id === service.id);
    if (serviceDeployments.length === 0) {
      return 'Not Deployed';
    }
    return serviceDeployments.map(d => d.server.hostname).join(', ');
  }

  showAddForm() {
    this.selectedService.set(null);
    this.showForm.set(true);
  }

  editService(service: Service) {
    this.selectedService.set(service);
    this.showForm.set(true);
  }

  deleteService(service: Service) {
    if (confirm(`Are you sure you want to delete ${service.name}?`)) {
      this.apiService.deleteService(service.id).subscribe({
        next: () => {
          this.loadData();
          // Optionally show success message
        },
        error: (error) => {
          console.error('Error deleting service:', error);
          alert(`Failed to delete service: ${error.message || 'Unknown error'}`);
        }
      });
    }
  }

  onSave() {
    this.showForm.set(false);
    this.loadData();
  }

  onCancel() {
    this.showForm.set(false);
  }

  syncServices() {
    this.apiService.syncServices().subscribe(() => this.loadData());
  }
}
