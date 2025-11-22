import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Services</h3>
          <div class="value">{{ serviceCount() }}</div>
        </div>
        <div class="stat-card">
          <h3>Servers</h3>
          <div class="value">{{ serverCount() }}</div>
        </div>
        <div class="stat-card">
          <h3>Deployments</h3>
          <div class="value">{{ deploymentCount() }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stat-card h3 {
      margin: 0 0 10px 0;
      color: #7f8c8d;
    }
    .stat-card .value {
      font-size: 2rem;
      font-weight: bold;
      color: #2c3e50;
    }
  `]
})
export class DashboardComponent {
  private apiService = inject(ApiService);

  serviceCount = toSignal(this.apiService.getServices().pipe(map(s => s.length)), { initialValue: 0 });
  serverCount = toSignal(this.apiService.getServers().pipe(map(s => s.length)), { initialValue: 0 });
  deploymentCount = toSignal(this.apiService.getDeployments().pipe(map(d => d.length)), { initialValue: 0 });
}
