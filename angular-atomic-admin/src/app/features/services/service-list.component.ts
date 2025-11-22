import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-service-list',
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1>Services</h1>
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Framework</th>
            <th>Status</th>
            <th>Port</th>
          </tr>
        </thead>
        <tbody>
          @for (service of services(); track service.id) {
            <tr>
              <td>{{ service.name }}</td>
              <td>{{ service.type }}</td>
              <td>{{ service.framework.name }}</td>
              <td>
                <span class="status-badge" [class]="service.status.toLowerCase()">
                  {{ service.status }}
                </span>
              </td>
              <td>{{ service.defaultPort }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
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
  `]
})
export class ServiceListComponent {
  private apiService = inject(ApiService);
  services = toSignal(this.apiService.getServices(), { initialValue: [] });
}
