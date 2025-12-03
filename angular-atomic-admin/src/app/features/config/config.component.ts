import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Framework, FrameworkCategory, FrameworkLanguage, ServiceType, ServerType } from '../../models/models';

@Component({
  selector: 'app-config',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <h1>Configuration</h1>
      
      @if (error()) {
        <div class="error-container">
          <p class="error-text">{{ error() }}</p>
          <button class="retry-btn" (click)="loadAll()">Retry All</button>
        </div>
      }
      
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
                    <option [ngValue]="null">Select...</option>
                    @for (category of frameworkCategories(); track category.id) {
                      <option [ngValue]="category">{{ category.name }}</option>
                    }
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Language</label>
                  <select [(ngModel)]="frameworkForm.language" name="language">
                    <option [ngValue]="null">Select...</option>
                    @for (language of frameworkLanguages(); track language.id) {
                      <option [ngValue]="language">{{ language.name }}</option>
                    }
                  </select>
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
                <td>{{ framework.category?.name }}</td>
                <td>{{ framework.language?.name }}</td>
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
        <div class="section-header">
          <h2>Service Types</h2>
          <button class="btn btn-primary" (click)="showServiceTypeForm()">Add Service Type</button>
        </div>

        @if (serviceTypeFormVisible()) {
          <div class="form-card">
            <h3>{{ editingServiceType() ? 'Edit' : 'Add' }} Service Type</h3>
            <form (ngSubmit)="saveServiceType()">
              <div class="form-group">
                <label>Name *</label>
                <input type="text" [(ngModel)]="serviceTypeForm.name" name="name" required>
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea [(ngModel)]="serviceTypeForm.description" name="description" rows="2"></textarea>
              </div>
              <div class="form-actions">
                <button type="submit" class="btn btn-primary">Save</button>
                <button type="button" class="btn btn-secondary" (click)="cancelServiceTypeForm()">Cancel</button>
              </div>
            </form>
          </div>
        }

        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (type of serviceTypes(); track type.id) {
              <tr>
                <td>{{ type.name }}</td>
                <td>{{ type.description }}</td>
                <td>
                  <button class="btn-icon" (click)="editServiceType(type)" title="Edit">✏️</button>
                  <button class="btn-icon" (click)="deleteServiceTypeConfirm(type)" title="Delete">🗑️</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="config-section">
        <div class="section-header">
          <h2>Server Types</h2>
          <button class="btn btn-primary" (click)="showServerTypeForm()">Add Server Type</button>
        </div>

        @if (serverTypeFormVisible()) {
          <div class="form-card">
            <h3>{{ editingServerType() ? 'Edit' : 'Add' }} Server Type</h3>
            <form (ngSubmit)="saveServerType()">
              <div class="form-group">
                <label>Name *</label>
                <input type="text" [(ngModel)]="serverTypeForm.name" name="name" required>
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea [(ngModel)]="serverTypeForm.description" name="description" rows="2"></textarea>
              </div>
              <div class="form-actions">
                <button type="submit" class="btn btn-primary">Save</button>
                <button type="button" class="btn btn-secondary" (click)="cancelServerTypeForm()">Cancel</button>
              </div>
            </form>
          </div>
        }

        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (type of serverTypes(); track type.id) {
              <tr>
                <td>{{ type.name }}</td>
                <td>{{ type.description }}</td>
                <td>
                  <button class="btn-icon" (click)="editServerType(type)" title="Edit">✏️</button>
                  <button class="btn-icon" (click)="deleteServerTypeConfirm(type)" title="Delete">🗑️</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="config-grid">
        <div class="config-section">
          <div class="section-header">
            <h2>Framework Categories</h2>
            <button class="btn btn-primary" (click)="showFrameworkCategoryForm()">Add Category</button>
          </div>

          @if (frameworkCategoryFormVisible()) {
            <div class="form-card">
              <h3>{{ editingFrameworkCategory() ? 'Edit' : 'Add' }} Category</h3>
              <form (ngSubmit)="saveFrameworkCategory()">
                <div class="form-group">
                  <label>Name *</label>
                  <input type="text" [(ngModel)]="frameworkCategoryForm.name" name="name" required>
                </div>
                <div class="form-group">
                  <label>Description</label>
                  <textarea [(ngModel)]="frameworkCategoryForm.description" name="description" rows="2"></textarea>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn btn-primary">Save</button>
                  <button type="button" class="btn btn-secondary" (click)="cancelFrameworkCategoryForm()">Cancel</button>
                </div>
              </form>
            </div>
          }

          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (category of frameworkCategories(); track category.id) {
                <tr>
                  <td>{{ category.name }}</td>
                  <td>
                    <button class="btn-icon" (click)="editFrameworkCategory(category)" title="Edit">✏️</button>
                    <button class="btn-icon" (click)="deleteFrameworkCategoryConfirm(category)" title="Delete">🗑️</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="config-section">
          <div class="section-header">
            <h2>Framework Languages</h2>
            <button class="btn btn-primary" (click)="showFrameworkLanguageForm()">Add Language</button>
          </div>

          @if (frameworkLanguageFormVisible()) {
            <div class="form-card">
              <h3>{{ editingFrameworkLanguage() ? 'Edit' : 'Add' }} Language</h3>
              <form (ngSubmit)="saveFrameworkLanguage()">
                <div class="form-group">
                  <label>Name *</label>
                  <input type="text" [(ngModel)]="frameworkLanguageForm.name" name="name" required>
                </div>
                <div class="form-group">
                  <label>Description</label>
                  <textarea [(ngModel)]="frameworkLanguageForm.description" name="description" rows="2"></textarea>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn btn-primary">Save</button>
                  <button type="button" class="btn btn-secondary" (click)="cancelFrameworkLanguageForm()">Cancel</button>
                </div>
              </form>
            </div>
          }

          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (language of frameworkLanguages(); track language.id) {
                <tr>
                  <td>{{ language.name }}</td>
                  <td>
                    <button class="btn-icon" (click)="editFrameworkLanguage(language)" title="Edit">✏️</button>
                    <button class="btn-icon" (click)="deleteFrameworkLanguageConfirm(language)" title="Delete">🗑️</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
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
    .error-container {
      text-align: center;
      padding: 20px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 20px;
      border-left: 4px solid #c62828;
    }
    .error-text {
      color: #c62828;
      font-size: 1rem;
      margin-bottom: 10px;
      white-space: pre-wrap;
    }
    .retry-btn {
      background: #3498db;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class ConfigComponent {
  private apiService = inject(ApiService);

  frameworks = signal<Framework[]>([]);
  frameworkCategories = signal<FrameworkCategory[]>([]);
  frameworkLanguages = signal<FrameworkLanguage[]>([]);
  serviceTypes = signal<ServiceType[]>([]);
  serverTypes = signal<ServerType[]>([]);

  error = signal<string | null>(null);

  constructor() {
    this.loadAll();
  }

  loadAll() {
    this.error.set(null);
    this.loadFrameworks();
    this.loadFrameworkCategories();
    this.loadFrameworkLanguages();
    this.loadServiceTypes();
    this.loadServerTypes();
  }

  loadFrameworks() {
    this.apiService.getFrameworks().subscribe({
      next: (data) => this.frameworks.set(data),
      error: (err) => this.handleError('Failed to load frameworks', err)
    });
  }

  loadFrameworkCategories() {
    this.apiService.getFrameworkCategories().subscribe({
      next: (data) => this.frameworkCategories.set(data),
      error: (err) => this.handleError('Failed to load framework categories', err)
    });
  }

  loadFrameworkLanguages() {
    this.apiService.getFrameworkLanguages().subscribe({
      next: (data) => this.frameworkLanguages.set(data),
      error: (err) => this.handleError('Failed to load framework languages', err)
    });
  }

  loadServiceTypes() {
    this.apiService.getServiceTypes().subscribe({
      next: (data) => this.serviceTypes.set(data),
      error: (err) => this.handleError('Failed to load service types', err)
    });
  }

  loadServerTypes() {
    this.apiService.getServerTypes().subscribe({
      next: (data) => this.serverTypes.set(data),
      error: (err) => this.handleError('Failed to load server types', err)
    });
  }

  private handleError(message: string, err: any) {
    console.error(message, err);
    // Append error message if multiple fail
    const currentError = this.error();
    this.error.set(currentError ? `${currentError}\n${message}` : message);
  }

  frameworkFormVisible = signal(false);
  editingFramework = signal<Framework | null>(null);

  frameworkForm: any = {
    name: '',
    description: '',
    category: null,
    language: null,
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
      category: null,
      language: null,
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
        this.loadFrameworks();
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
          this.loadFrameworks();
        },
        error: (error) => {
          console.error('Error deleting framework:', error);
          alert('Error deleting framework. It may be in use by services.');
        }
      });
    }
  }

  // Service Type Management
  serviceTypeFormVisible = signal(false);
  editingServiceType = signal<ServiceType | null>(null);
  serviceTypeForm: any = { name: '', description: '' };

  showServiceTypeForm() {
    this.serviceTypeFormVisible.set(true);
    this.editingServiceType.set(null);
    this.serviceTypeForm = { name: '', description: '' };
  }

  editServiceType(type: ServiceType) {
    this.serviceTypeFormVisible.set(true);
    this.editingServiceType.set(type);
    this.serviceTypeForm = { ...type };
  }

  cancelServiceTypeForm() {
    this.serviceTypeFormVisible.set(false);
    this.editingServiceType.set(null);
    this.serviceTypeForm = { name: '', description: '' };
  }

  saveServiceType() {
    const editing = this.editingServiceType();
    const operation = editing
      ? this.apiService.updateServiceType(editing.id, this.serviceTypeForm)
      : this.apiService.createServiceType(this.serviceTypeForm);

    operation.subscribe({
      next: () => {
        this.cancelServiceTypeForm();
        this.loadServiceTypes();
      },
      error: (error) => {
        console.error('Error saving service type:', error);
        alert('Error saving service type.');
      }
    });
  }

  deleteServiceTypeConfirm(type: ServiceType) {
    if (confirm(`Are you sure you want to delete "${type.name}"?`)) {
      this.apiService.deleteServiceType(type.id).subscribe({
        next: () => {
          this.loadServiceTypes();
        },
        error: (error) => {
          console.error('Error deleting service type:', error);
          alert('Error deleting service type.');
        }
      });
    }
  }

  // Server Type Management
  serverTypeFormVisible = signal(false);
  editingServerType = signal<ServerType | null>(null);
  serverTypeForm: any = { name: '', description: '' };

  showServerTypeForm() {
    this.serverTypeFormVisible.set(true);
    this.editingServerType.set(null);
    this.serverTypeForm = { name: '', description: '' };
  }

  editServerType(type: ServerType) {
    this.serverTypeFormVisible.set(true);
    this.editingServerType.set(type);
    this.serverTypeForm = { ...type };
  }

  cancelServerTypeForm() {
    this.serverTypeFormVisible.set(false);
    this.editingServerType.set(null);
    this.serverTypeForm = { name: '', description: '' };
  }

  saveServerType() {
    const editing = this.editingServerType();
    const operation = editing
      ? this.apiService.updateServerType(editing.id, this.serverTypeForm)
      : this.apiService.createServerType(this.serverTypeForm);

    operation.subscribe({
      next: () => {
        this.cancelServerTypeForm();
        this.loadServerTypes();
      },
      error: (error) => {
        console.error('Error saving server type:', error);
        alert('Error saving server type.');
      }
    });
  }

  deleteServerTypeConfirm(type: ServerType) {
    if (confirm(`Are you sure you want to delete "${type.name}"?`)) {
      this.apiService.deleteServerType(type.id).subscribe({
        next: () => {
          this.loadServerTypes();
        },
        error: (error) => {
          console.error('Error deleting server type:', error);
          alert('Error deleting server type.');
        }
      });
    }
  }

  // Framework Category Management
  frameworkCategoryFormVisible = signal(false);
  editingFrameworkCategory = signal<FrameworkCategory | null>(null);
  frameworkCategoryForm: any = { name: '', description: '' };

  showFrameworkCategoryForm() {
    this.frameworkCategoryFormVisible.set(true);
    this.editingFrameworkCategory.set(null);
    this.frameworkCategoryForm = { name: '', description: '' };
  }

  editFrameworkCategory(category: FrameworkCategory) {
    this.frameworkCategoryFormVisible.set(true);
    this.editingFrameworkCategory.set(category);
    this.frameworkCategoryForm = { ...category };
  }

  cancelFrameworkCategoryForm() {
    this.frameworkCategoryFormVisible.set(false);
    this.editingFrameworkCategory.set(null);
    this.frameworkCategoryForm = { name: '', description: '' };
  }

  saveFrameworkCategory() {
    const editing = this.editingFrameworkCategory();
    const operation = editing
      ? this.apiService.updateFrameworkCategory(editing.id, this.frameworkCategoryForm)
      : this.apiService.createFrameworkCategory(this.frameworkCategoryForm);

    operation.subscribe({
      next: () => {
        this.cancelFrameworkCategoryForm();
        this.loadFrameworkCategories();
      },
      error: (error) => {
        console.error('Error saving framework category:', error);
        alert('Error saving framework category.');
      }
    });
  }

  deleteFrameworkCategoryConfirm(category: FrameworkCategory) {
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      this.apiService.deleteFrameworkCategory(category.id).subscribe({
        next: () => {
          this.loadFrameworkCategories();
        },
        error: (error) => {
          console.error('Error deleting framework category:', error);
          alert('Error deleting framework category.');
        }
      });
    }
  }

  // Framework Language Management
  frameworkLanguageFormVisible = signal(false);
  editingFrameworkLanguage = signal<FrameworkLanguage | null>(null);
  frameworkLanguageForm: any = { name: '', description: '' };

  showFrameworkLanguageForm() {
    this.frameworkLanguageFormVisible.set(true);
    this.editingFrameworkLanguage.set(null);
    this.frameworkLanguageForm = { name: '', description: '' };
  }

  editFrameworkLanguage(language: FrameworkLanguage) {
    this.frameworkLanguageFormVisible.set(true);
    this.editingFrameworkLanguage.set(language);
    this.frameworkLanguageForm = { ...language };
  }

  cancelFrameworkLanguageForm() {
    this.frameworkLanguageFormVisible.set(false);
    this.editingFrameworkLanguage.set(null);
    this.frameworkLanguageForm = { name: '', description: '' };
  }

  saveFrameworkLanguage() {
    const editing = this.editingFrameworkLanguage();
    const operation = editing
      ? this.apiService.updateFrameworkLanguage(editing.id, this.frameworkLanguageForm)
      : this.apiService.createFrameworkLanguage(this.frameworkLanguageForm);

    operation.subscribe({
      next: () => {
        this.cancelFrameworkLanguageForm();
        this.loadFrameworkLanguages();
      },
      error: (error) => {
        console.error('Error saving framework language:', error);
        alert('Error saving framework language.');
      }
    });
  }

  deleteFrameworkLanguageConfirm(language: FrameworkLanguage) {
    if (confirm(`Are you sure you want to delete "${language.name}"?`)) {
      this.apiService.deleteFrameworkLanguage(language.id).subscribe({
        next: () => {
          this.loadFrameworkLanguages();
        },
        error: (error) => {
          console.error('Error deleting framework language:', error);
          alert('Error deleting framework language.');
        }
      });
    }
  }

  formatCategory(category: string): string {
    return category.replace(/_/g, ' - ');
  }
}
