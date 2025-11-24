import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ServerFormComponent } from './server-form.component';
import { Server } from '../../models/models';

@Component({
  selector: 'app-server-list',
  imports: [CommonModule, ServerFormComponent],
  template: `
    <div class="page-container">
      <div class="header">
        <h1>Servers</h1>
        <button class="add-btn" (click)="showAddForm()">Add Server</button>
      </div>

      @if (showForm()) {
        <div class="modal-overlay">
          <app-server-form 
            [server]="selectedServer()" 
            (save)="onSave()" 
            (cancel)="onCancel()"
          ></app-server-form>
        </div>
      }

      <table class="data-table">
        <thead>
          <tr>
            <th>Hostname</th>
            <th>IP Address</th>
            <th>Environment</th>
            <th>Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (server of servers(); track server.id) {
            <tr>
              <td>{{ server.hostname }}</td>
              <td>{{ server.ipAddress }}</td>
              <td>{{ server.environment }}</td>
              <td>{{ server.type }}</td>
              <td>
                <span class="status-badge" [class]="server.status?.toLowerCase() || 'unknown'">
                  {{ server.status || 'Unknown' }}
                </span>
              </td>
              <td>
                <button class="action-btn edit" (click)="editServer(server)">Edit</button>
                <button class="action-btn delete" (click)="deleteServer(server)">Delete</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .add-btn {
      background: #2ecc71;
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
    .status-badge.maintenance { background-color: #fff3e0; color: #ef6c00; }
    
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
  `]
})
export class ServerListComponent {
  private apiService = inject(ApiService);

  servers = signal<Server[]>([]);
  showForm = signal(false);
  selectedServer = signal<Server | null>(null);

  constructor() {
    this.loadServers();
  }

  loadServers() {
    this.apiService.getServers().subscribe(data => this.servers.set(data));
  }

  showAddForm() {
    this.selectedServer.set(null);
    this.showForm.set(true);
  }

  editServer(server: Server) {
    this.selectedServer.set(server);
    this.showForm.set(true);
  }

  deleteServer(server: Server) {
    if (confirm(`Are you sure you want to delete ${server.hostname}?`)) {
      this.apiService.deleteServer(server.id).subscribe(() => this.loadServers());
    }
  }

  onSave() {
    this.showForm.set(false);
    this.loadServers();
  }

  onCancel() {
    this.showForm.set(false);
  }
}
