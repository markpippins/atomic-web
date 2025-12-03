import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap, timer, forkJoin, of } from 'rxjs';
import { Deployment } from '../../models/models';
import { takeWhile, catchError } from 'rxjs/operators';

interface DashboardDeployment extends Deployment {
  healthStatus?: string;
  lastHealthCheckTime?: Date;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, DatePipe],
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

      <div class="service-status-section">
        <h2>Service Status</h2>
        <div class="status-table-container">
          <table class="status-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Server</th>
                <th>Port</th>
                <th>Context</th>
                <th>Status</th>
                <th>Last Check</th>
              </tr>
            </thead>
            <tbody>
              @for (deployment of deployments(); track deployment.id) {
                <tr>
                  <td>{{ deployment.service.name }}</td>
                  <td>{{ deployment.server.hostname }}</td>
                  <td>{{ deployment.port }}</td>
                  <td>{{ deployment.contextPath }}</td>
                  <td>
                    <span class="status-badge" [class]="getStatusClass(deployment)">
                      {{ deployment.healthStatus || deployment.status }}
                    </span>
                  </td>
                  <td>{{ deployment.lastHealthCheckTime ? (deployment.lastHealthCheckTime | date:'short') : 'Never' }}</td>
                </tr>
              }
            </tbody>
          </table>
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

    .service-status-section {
      margin-top: 30px;
    }

    .status-table-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow-x: auto;
    }

    .status-table {
      width: 100%;
      border-collapse: collapse;
    }

    .status-table th,
    .status-table td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #ecf0f1;
    }

    .status-table th {
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

    .status-badge.UP {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .status-badge.DOWN {
      background-color: #ffebee;
      color: #c62828;
    }

    .status-badge.WARNING {
      background-color: #fff3e0;
      color: #ef6c00;
    }

    .status-badge.UNKNOWN {
      background-color: #eee;
      color: #666;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);

  serviceCount = toSignal(this.apiService.getServices().pipe(map(s => s.length)), { initialValue: 0 });
  serverCount = toSignal(this.apiService.getServers().pipe(map(s => s.length)), { initialValue: 0 });
  deploymentCount = toSignal(this.apiService.getDeployments().pipe(map(d => d.length)), { initialValue: 0 });

  deployments = signal<DashboardDeployment[]>([]);
  isAlive = signal(true); // For controlling the live updates

  ngOnInit() {
    // Load initial deployments
    this.loadDeployments();

    // Set up a timer to periodically check service status
    timer(0, 10000) // Check every 10 seconds
      .pipe(
        takeWhile(() => this.isAlive()),
        switchMap(() => this.apiService.getDeployments())
      )
      .subscribe({
        next: (deployments: Deployment[]) => {
          // Preserve health status when updating deployments
          const currentDeployments = this.deployments();
          const updatedDeployments = deployments.map((deployment: Deployment) => {
            const existingDeployment = currentDeployments.find(d => d.id === deployment.id);
            return {
              ...deployment,
              healthStatus: existingDeployment?.healthStatus || deployment.status,
              lastHealthCheckTime: existingDeployment?.lastHealthCheckTime
            } as DashboardDeployment;
          });
          this.deployments.set(updatedDeployments);

          // Check health for each deployment
          this.checkAllDeploymentsHealth();
        },
        error: (error) => {
          console.error('Error loading deployments:', error);
        }
      });
  }

  ngOnDestroy() {
    this.isAlive.set(false);
  }

  loadDeployments() {
    this.apiService.getDeployments().subscribe({
      next: (deployments: Deployment[]) => {
        // Initialize health status for each deployment
        const deploymentsWithHealth = deployments.map((deployment: Deployment) => ({
          ...deployment,
          healthStatus: deployment.status, // Start with existing status
          lastHealthCheckTime: new Date() // Set initial time
        }) as DashboardDeployment);
        this.deployments.set(deploymentsWithHealth);
        // Check health for each deployment
        this.checkAllDeploymentsHealth();
      },
      error: (error) => {
        console.error('Error loading deployments:', error);
      }
    });
  }

  checkAllDeploymentsHealth() {
    const currentDeployments = this.deployments();
    const healthChecks = currentDeployments.map((deployment: DashboardDeployment) => {
      if (deployment.healthCheckUrl) {
        return this.apiService.checkServiceHealth(deployment.healthCheckUrl).pipe(
          map(response => ({
            id: deployment.id,
            status: response.status || 'UP',
            lastHealthCheckTime: new Date()
          })),
          catchError(() => of({
            id: deployment.id,
            status: 'DOWN',
            lastHealthCheckTime: new Date()
          }))
        );
      } else {
        // If no health check URL, return an observable that just returns the existing status
        return of({
          id: deployment.id,
          status: deployment.status,
          lastHealthCheckTime: new Date()
        });
      }
    });

    // Execute all health checks in parallel
    if (healthChecks.length > 0) {
      forkJoin(healthChecks).subscribe(results => {
        const updatedDeployments = currentDeployments.map((deployment: DashboardDeployment) => {
          const result = results.find(r => r.id === deployment.id);
          if (result) {
            return {
              ...deployment,
              healthStatus: result.status,
              lastHealthCheckTime: result.lastHealthCheckTime
            };
          }
          return deployment;
        });
        this.deployments.set(updatedDeployments);
      });
    }
  }

  getStatusClass(deployment: DashboardDeployment): string {
    const status = deployment.healthStatus || deployment.status;
    if (status && typeof status === 'string') {
      return status.toUpperCase();
    }
    return 'UNKNOWN';
  }
}
