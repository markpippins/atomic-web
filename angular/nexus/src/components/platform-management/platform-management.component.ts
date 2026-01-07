import { Component, ChangeDetectionStrategy, signal, inject, computed, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformManagementService } from '../../services/platform-management.service.js';
import { ServiceInstance, Framework } from '../../models/service-mesh.model.js';
import { UpsertServiceDialogComponent } from './upsert-service-dialog/upsert-service-dialog.component.js';
import { UpsertFrameworkDialogComponent } from './upsert-framework-dialog/upsert-framework-dialog.component.js';

@Component({
    selector: 'app-platform-management',
    imports: [CommonModule, UpsertServiceDialogComponent, UpsertFrameworkDialogComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="platform-management">
            <div class="header">
                <h2>{{ title() }}</h2>
                @if (managementType() === 'services') {
                    <button class="btn-primary" (click)="onAdd()">
                        <span class="material-icons">add</span>
                        Add Service
                    </button>
                }
                @if (managementType() === 'frameworks') {
                    <button class="btn-primary" (click)="onAdd()">
                        <span class="material-icons">add</span>
                        Add Framework
                    </button>
                }
                <!-- Other buttons... -->
            </div>

            <!-- Loading/Error logic ... -->
            @if (loading()) {
                <div class="loading">
                    <span class="material-icons spinning">refresh</span>
                    Loading...
                </div>
            }

            @if (error()) {
                <div class="error">
                    <span class="material-icons">error</span>
                    {{ error() }}
                </div>
            }

            @if (!loading() && !error()) {
                <div class="content">
                    @switch (managementType()) {
                        @case ('services') {
                            <div class="services-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Framework</th>
                                            <th>Type</th>
                                            <th>Port</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @for (service of services(); track service.id) {
                                            <tr>
                                                <td>{{ service.name }}</td>
                                                <td>{{ service.framework?.name || 'N/A' }}</td>
                                                <td>{{ service.type?.name || 'N/A' }}</td>
                                                <td>{{ service.defaultPort }}</td>
                                                <td>{{ service.status || 'ACTIVE' }}</td>
                                                <td class="actions">
                                                    <button (click)="onEdit(service)" title="Edit">
                                                        <span class="material-icons">edit</span>
                                                    </button>
                                                    <button (click)="onDelete(service)" title="Delete" class="btn-danger">
                                                        <span class="material-icons">delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        }
                                    </tbody>
                                </table>
                            </div>
                        }
                        @case ('frameworks') {
                             <div class="frameworks-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Category</th>
                                            <th>Language</th>
                                            <th>Version</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @for (fw of frameworks(); track fw.id) {
                                            <tr>
                                                <td>{{ fw.name }}</td>
                                                <td>{{ fw.category?.name || 'N/A' }}</td>
                                                <td>{{ fw.language?.name || 'N/A' }}</td>
                                                <td>{{ fw.currentVersion || 'N/A' }}</td>
                                                <td class="actions">
                                                    <button (click)="onEdit(fw)" title="Edit">
                                                        <span class="material-icons">edit</span>
                                                    </button>
                                                    <button (click)="onDelete(fw)" title="Delete" class="btn-danger">
                                                        <span class="material-icons">delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        }
                                    </tbody>
                                </table>
                            </div>
                        }
                        @default {
                            <div class="placeholder">
                                <p>Management UI for {{ managementType() }} coming soon...</p>
                            </div>
                        }
                    }
                </div>
            }
            
            <!-- Dialogs -->
            <app-upsert-service-dialog
                [isOpen]="isServiceDialogOpen()"
                [baseUrl]="baseUrl()"
                [service]="selectedServiceForEdit()"
                (close)="onServiceDialogClose()"
                (saved)="onServiceSaved()"
            ></app-upsert-service-dialog>

             <app-upsert-framework-dialog
                [isOpen]="isFrameworkDialogOpen()"
                [baseUrl]="baseUrl()"
                [framework]="selectedFrameworkForEdit()"
                (close)="onFrameworkDialogClose()"
                (saved)="onFrameworkSaved()"
            ></app-upsert-framework-dialog>
        </div>
    `,
    // ... styles
    styles: [`
        .platform-management {
            padding: 20px;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        /* ... existing styles ... */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid var(--border-color, #e0e0e0);
        }

        h2 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }

        .btn-primary {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            background: var(--primary-color, #1976d2);
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background 0.2s;
        }

        .btn-primary:hover {
            background: var(--primary-dark, #1565c0);
        }

        .loading, .error {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 20px;
            border-radius: 4px;
        }

        .loading {
            background: var(--info-bg, #e3f2fd);
            color: var(--info-color, #1976d2);
        }

        .error {
            background: var(--error-bg, #ffebee);
            color: var(--error-color, #c62828);
        }

        .spinning {
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .content {
            flex: 1;
            overflow: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        thead {
            background: var(--table-header-bg, #f5f5f5);
            position: sticky;
            top: 0;
            z-index: 1;
        }

        th {
            text-align: left;
            padding: 12px 16px;
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            color: var(--text-secondary, #666);
            border-bottom: 2px solid var(--border-color, #e0e0e0);
        }

        td {
            padding: 12px 16px;
            border-bottom: 1px solid var(--border-color, #e0e0e0);
        }

        tr:hover {
            background: var(--hover-bg, #f9f9f9);
        }

        .actions {
            display: flex;
            gap: 8px;
        }

        .actions button {
            padding: 6px;
            background: transparent;
            border: 1px solid var(--border-color, #e0e0e0);
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .actions button:hover {
            background: var(--hover-bg, #f0f0f0);
        }

        .actions button.btn-danger:hover {
            background: var(--error-bg, #ffebee);
            border-color: var(--error-color, #c62828);
            color: var(--error-color, #c62828);
        }

        .actions button .material-icons {
            font-size: 18px;
        }

        .placeholder {
            text-align: center;
            padding: 60px 20px;
            color: var(--text-secondary, #666);
        }
    `]
})
export class PlatformManagementComponent {
    private platformService = inject(PlatformManagementService);

    // Inputs
    managementType = input.required<string>();
    baseUrl = input.required<string>();

    // State
    services = signal<ServiceInstance[]>([]);
    frameworks = signal<Framework[]>([]);
    loading = computed(() => this.platformService.loading());
    error = computed(() => this.platformService.error());

    // Dialog State
    isServiceDialogOpen = signal(false);
    selectedServiceForEdit = signal<ServiceInstance | null>(null);

    isFrameworkDialogOpen = signal(false);
    selectedFrameworkForEdit = signal<Framework | null>(null);

    // Computed
    title = computed(() => {
        const type = this.managementType();
        return type.charAt(0).toUpperCase() + type.slice(1) + ' Management';
    });

    constructor() {
        effect(() => {
            // Reload when management type or url changes
            this.loadData();
        });
    }

    async loadData() {
        const type = this.managementType();
        const url = this.baseUrl();
        if (!type || !url) return;

        try {
            if (type === 'services') {
                const data = await this.platformService.getServices(url);
                this.services.set(data);
            } else if (type === 'frameworks') {
                const data = await this.platformService.getFrameworks(url);
                this.frameworks.set(data);
            }
            // Add other types as needed
        } catch (e) {
            console.error('Failed to load data:', e);
        }
    }

    onAdd() {
        if (this.managementType() === 'services') {
            this.selectedServiceForEdit.set(null);
            this.isServiceDialogOpen.set(true);
        } else if (this.managementType() === 'frameworks') {
            this.selectedFrameworkForEdit.set(null);
            this.isFrameworkDialogOpen.set(true);
        }
    }

    onEdit(item: any) {
        if (this.managementType() === 'services') {
            this.selectedServiceForEdit.set(item as ServiceInstance);
            this.isServiceDialogOpen.set(true);
        } else if (this.managementType() === 'frameworks') {
            this.selectedFrameworkForEdit.set(item as Framework);
            this.isFrameworkDialogOpen.set(true);
        }
    }

    onServiceDialogClose() {
        this.isServiceDialogOpen.set(false);
    }

    onServiceSaved() {
        this.loadData();
        this.isServiceDialogOpen.set(false);
    }

    onFrameworkDialogClose() {
        this.isFrameworkDialogOpen.set(false);
    }

    onFrameworkSaved() {
        this.loadData();
        this.isFrameworkDialogOpen.set(false);
    }

    async onDelete(item: any) {
        if (!confirm(`Are you sure you want to delete ${item.name}?`)) {
            return;
        }

        try {
            const type = this.managementType();
            const url = this.baseUrl();

            if (type === 'services') {
                await this.platformService.deleteService(url, item.id);
            } else if (type === 'frameworks') {
                await this.platformService.deleteFramework(url, item.id);
            }
            await this.loadData(); // Reload data
        } catch (e) {
            console.error('Failed to delete:', e);
        }
    }
}
