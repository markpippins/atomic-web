import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Framework } from '../../models/models';

@Component({
  selector: 'app-config',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <h1>Configuration</h1>
      
      <div class="config-section">
        <div class="section-header">
          <h2>Frameworks</h2>
          <button class="btn btn-primary" (click)="showFrameworkForm()">Add Framework</button>
        </div>
        
        @if (frameworkFormVisible()) {
          <div class="form-card">
            <h3>{{ editingFramework() ? 'Edit' : 'Add' }} Framework</h3>
            <form (ngSubmit)="saveFramework()">
              <div class="form-group">
                <label>Name *</label>
                <input type="text" [(ngModel)]="frameworkForm.name" name="name" required>
              </div>
              
              <div class="form-group">
                <label>Description</label>
                <textarea [(ngModel)]="frameworkForm.description" name="description" rows="3"></textarea>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Category *</label>
                  <select [(ngModel)]="frameworkForm.category" name="category" required>
                    <option value="">Select...</option>
                    <option value="JAVA_SPRING">Java - Spring</option>
                    <option value="JAVA_QUARKUS">Java - Quarkus</option>
                    <option value="JAVA_MICRONAUT">Java - Micronaut</option>
                    <option value="NODE_EXPRESS">Node.js - Express</option>
                    <option value="NODE_NESTJS">Node.js - NestJS</option>
                    <option value="NODE_ADONISJS">Node.js - AdonisJS</option>
                    <option value="NODE_MOLECULER">Node.js - Moleculer</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Language</label>
                  <input type="text" [(ngModel)]="frameworkForm.language" name="language">
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Latest Version</label>
                  <input type="text" [(ngModel)]="frameworkForm.latestVersion" name="latestVersion">
                </div>
                
                <div class="form-group">
                  <label>Documentation URL</label>
                  <input type="url" [(ngModel)]="frameworkForm.documentationUrl" name="documentationUrl">
                </div>
              </div>
              
              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="frameworkForm.supportsBrokerPattern" name="supportsBrokerPattern">
                  Supports Broker Pattern
                </label>
              </div>
              
              <div class="form-actions">
                <button type="submit" class="btn btn-primary">Save</button>
                <button type="button" class="btn btn-secondary" (click)="cancelFrameworkForm()">Cancel</button>
              </div>
            </form>
          </div>
        }
        
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Language</th>
              <th>Version</th>
              <th>Broker Support</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (framework of frameworks(); track framework.id) {
              <tr>
                <td>{{ framework.name }}</td>
                <td>{{ formatCategory(framework.category) }}</td>
                <td>{{ framework.language }}</td>
                <td>{{ framework.latestVersion }}</td>
                <td>
                  <span class="badge" [class.badge-success]="framework.supportsBrokerPattern">
                    {{ framework.supportsBrokerPattern ? 'Yes' : 'No' }}
                  </span>
                </td>
                <td>
                  <button class="btn-icon" (click)="editFramework(framework)" title="Edit">✏️</button>
                  <button class="btn-icon" (click)="deleteFrameworkConfirm(framework)" title="Delete">🗑️</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="config-section">
        <h2>Service Types</h2>
        <div class="info-grid">
          <div class="info-card">REST_API</div>
          <div class="info-card">GRAPHQL_API</div>
          <div class="info-card">GRPC_SERVICE</div>
          <div class="info-card">MESSAGE_QUEUE</div>
          <div class="info-card">DATABASE</div>
          <div class="info-card">CACHE</div>
          <div class="info-card">GATEWAY</div>
          <div class="info-card">PROXY</div>
          <div class="info-card">WEB_APP</div>
          <div class="info-card">BACKGROUND_JOB</div>
        </div>
      </div>

      <div class="config-section">
        <h2>Server Types & Environments</h2>
        <div class="config-grid">
          <div>
            <h3>Server Types</h3>
            <div class="info-grid">
              <div class="info-card">PHYSICAL</div>
              <div class="info-card">VIRTUAL</div>
              <div class="info-card">CONTAINER</div>
              <div class="info-card">CLOUD</div>
            </div>
          </div>
          <div>
            <h3>Environments</h3>
            <div class="info-grid">
              <div class="info-card">DEVELOPMENT</div>
              <div class="info-card">STAGING</div>
              <div class="info-card">PRODUCTION</div>
              <div class="info-card">TEST</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .config-section { margin-bottom: 40px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .form-card { background: white; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px; }
    .form-group { margin-bottom: 16px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-weight: 500; color: #2c3e50; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
    .checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
    .checkbox-label input[type="checkbox"] { width: auto; }
    .form-actions { display: flex; gap: 12px; margin-top: 20px; }
    .btn { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; }
    .btn-primary { background-color: #3498db; color: white; }
    .btn-primary:hover { background-color: #2980b9; }
    .btn-secondary { background-color: #95a5a6; color: white; }
    .btn-secondary:hover { background-color: #7f8c8d; }
    .btn-icon { background: none; border: none; cursor: pointer; font-size: 18px; padding: 4px 8px; }
    .btn-icon:hover { opacity: 0.7; }
    .data-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .data-table th, .data-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #ecf0f1; }
    .data-table th { background-color: #f8f9fa; font-weight: 600; color: #2c3e50; }
    .badge { padding: 4px 8px; border-radius: 12px; font-size: 0.85rem; background-color: #ecf0f1; color: #7f8c8d; }
    .badge-success { background-color: #e8f5e9; color: #2e7d32; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
    .info-card { background: white; padding: 12px; border-radius: 6px; text-align: center; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .config-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  `]
})
export class ConfigComponent {
  private apiService = inject(ApiService);
  frameworks = toSignal(this.apiService.getFrameworks(), { initialValue: [] });
  
  frameworkFormVisible = signal(false);
  editingFramework = signal<Framework | null>(null);
  
  frameworkForm: any = {
    name: '',
    description: '',
    category: '',
    language: '',
    latestVersion: '',
    documentationUrl: '',
    supportsBrokerPattern: false
  };

  showFrameworkForm() {
    this.frameworkFormVisible.set(true);
    this.editingFramework.set(null);
    this.resetFrameworkForm();
  }

  editFramework(framework: Framework) {
    this.frameworkFormVisible.set(true);
    this.editingFramework.set(framework);
    this.frameworkForm = { ...framework };
  }

  cancelFrameworkForm() {
    this.frameworkFormVisible.set(false);
    this.editingFramework.set(null);
    this.resetFrameworkForm();
  }

  resetFrameworkForm() {
    this.frameworkForm = {
      name: '',
      description: '',
      category: '',
      language: '',
      latestVersion: '',
      documentationUrl: '',
      supportsBrokerPattern: false
    };
  }

  saveFramework() {
    const editing = this.editingFramework();
    const operation = editing
      ? this.apiService.updateFramework(editing.id, this.frameworkForm)
      : this.apiService.createFramework(this.frameworkForm);

    operation.subscribe({
      next: () => {
        this.cancelFrameworkForm();
        window.location.reload();
      },
      error: (error) => {
        console.error('Error saving framework:', error);
        alert('Error saving framework. Please try again.');
      }
    });
  }

  deleteFrameworkConfirm(framework: Framework) {
    if (confirm(`Are you sure you want to delete "${framework.name}"?`)) {
      this.apiService.deleteFramework(framework.id).subscribe({
        next: () => {
          window.location.reload();
        },
        error: (error) => {
          console.error('Error deleting framework:', error);
          alert('Error deleting framework. It may be in use by services.');
        }
      });
    }
  }

  formatCategory(category: string): string {
    return category.replace(/_/g, ' - ');
  }
}
