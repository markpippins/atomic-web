import { Component, ChangeDetectionStrategy, inject, input, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformManagementService, Host } from '../../services/platform-management.service.js';
import { ServiceInstance, Framework, Deployment } from '../../models/service-mesh.model.js';
import { UpsertServiceDialogComponent } from './upsert-service-dialog/upsert-service-dialog.component.js';
import { UpsertFrameworkDialogComponent } from './upsert-framework-dialog/upsert-framework-dialog.component.js';
import { UpsertDeploymentDialogComponent } from './upsert-deployment-dialog/upsert-deployment-dialog.component.js';
import { UpsertServerDialogComponent } from './upsert-server-dialog/upsert-server-dialog.component.js';
import { LookupListComponent } from './lookup-list/lookup-list.component.js';
import { UpsertLookupDialogComponent } from './upsert-lookup-dialog/upsert-lookup-dialog.component.js';
import { LookupItem } from '../../services/platform-management.service.js';

@Component({
    selector: 'app-platform-management',
    standalone: true,
    imports: [
        CommonModule,
        UpsertServiceDialogComponent,
        UpsertFrameworkDialogComponent,
        UpsertDeploymentDialogComponent,
        UpsertServerDialogComponent,
        LookupListComponent,
        UpsertLookupDialogComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="h-full flex flex-col bg-[rgb(var(--color-surface))]">
        <!-- Header -->
        <div class="p-4 border-b border-[rgb(var(--color-border-base))] flex justify-between items-center">
            <h2 class="text-xl font-semibold text-[rgb(var(--color-text-base))] capitalize">
                {{ managementType() }} Management
            </h2>
            <button (click)="onAdd()" class="px-4 py-2 bg-[rgb(var(--color-accent-ring))] text-white rounded hover:bg-opacity-90 flex items-center gap-2">
                <span class="material-icons text-sm">add</span>
                Add {{ managementType() | slice:0:-1 }} 
            </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-auto p-4">
            @if (loading()) {
                <div class="flex justify-center items-center h-32">
                    <span class="material-icons animate-spin text-2xl text-[rgb(var(--color-text-muted))]">refresh</span>
                </div>
            } @else if (error()) {
                <div class="p-4 bg-red-500/10 border border-red-500/20 rounded text-red-500">
                    {{ error() }}
                </div>
            } @else {
                @switch (managementType()) {
                    @case ('services') {
                        <div class="flex flex-col h-full">
                             <!-- Tabs -->
                            <div class="flex border-b border-[rgb(var(--color-border-base))] mb-4">
                                <button
                                    (click)="activeTab.set('services')"
                                    [class.border-b-2]="activeTab() === 'services'"
                                    [class.border-[rgb(var(--color-accent-ring))]]="activeTab() === 'services'"
                                    [class.text-[rgb(var(--color-accent-ring))]]="activeTab() === 'services'"
                                    class="px-4 py-2 text-sm font-medium text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))] transition-colors"
                                >
                                    Services
                                </button>
                                <button
                                    (click)="activeTab.set('service-types')"
                                    [class.border-b-2]="activeTab() === 'service-types'"
                                    [class.border-[rgb(var(--color-accent-ring))]]="activeTab() === 'service-types'"
                                    [class.text-[rgb(var(--color-accent-ring))]]="activeTab() === 'service-types'"
                                    class="px-4 py-2 text-sm font-medium text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))] transition-colors"
                                >
                                    Service Types
                                </button>
                                 <button
                                    (click)="activeTab.set('server-types')"
                                    [class.border-b-2]="activeTab() === 'server-types'"
                                    [class.border-[rgb(var(--color-accent-ring))]]="activeTab() === 'server-types'"
                                    [class.text-[rgb(var(--color-accent-ring))]]="activeTab() === 'server-types'"
                                    class="px-4 py-2 text-sm font-medium text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))] transition-colors"
                                >
                                    Server Types
                                </button>
                                 <button
                                    (click)="activeTab.set('framework-languages')"
                                    [class.border-b-2]="activeTab() === 'framework-languages'"
                                    [class.border-[rgb(var(--color-accent-ring))]]="activeTab() === 'framework-languages'"
                                    [class.text-[rgb(var(--color-accent-ring))]]="activeTab() === 'framework-languages'"
                                    class="px-4 py-2 text-sm font-medium text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))] transition-colors"
                                >
                                    Languages
                                </button>
                                 <button
                                    (click)="activeTab.set('framework-categories')"
                                    [class.border-b-2]="activeTab() === 'framework-categories'"
                                    [class.border-[rgb(var(--color-accent-ring))]]="activeTab() === 'framework-categories'"
                                    [class.text-[rgb(var(--color-accent-ring))]]="activeTab() === 'framework-categories'"
                                    class="px-4 py-2 text-sm font-medium text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))] transition-colors"
                                >
                                    Categories
                                </button>
                            </div>

                            @if (activeTab() === 'services') {
                                <div class="overflow-x-auto flex-1">
                                    <table class="w-full text-left border-collapse">
                                        <thead>
                                            <tr class="border-b border-[rgb(var(--color-border-muted))] text-[rgb(var(--color-text-muted))] text-sm">
                                                <th class="p-3 font-medium">Name</th>
                                                <th class="p-3 font-medium">Type</th>
                                                <th class="p-3 font-medium">Framework</th>
                                                <th class="p-3 font-medium">Status</th>
                                                <th class="p-3 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @for (service of services(); track service.id) {
                                                <tr class="border-b border-[rgb(var(--color-border-muted))] hover:bg-[rgb(var(--color-surface-hover))]">
                                                    <td class="p-3 text-[rgb(var(--color-text-base))]">{{ service.name }}</td>
                                                    <td class="p-3 text-[rgb(var(--color-text-muted))]">{{ service.type?.name }}</td>
                                                    <td class="p-3 text-[rgb(var(--color-text-muted))]">{{ service.framework?.name }}</td>
                                                    <td class="p-3">
                                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                                                            {{ service.status }}
                                                        </span>
                                                    </td>
                                                    <td class="p-3 text-right">
                                                        <button (click)="onEdit(service)" class="text-[rgb(var(--color-accent-ring))] hover:underline mr-3">Edit</button>
                                                        <button (click)="onDelete(service)" class="text-red-500 hover:underline">Delete</button>
                                                    </td>
                                                </tr>
                                            } @empty {
                                                <tr>
                                                    <td colspan="5" class="p-8 text-center text-[rgb(var(--color-text-muted))]">No services found.</td>
                                                </tr>
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            } @else {
                                <app-lookup-list
                                    [items]="lookupData()"
                                    [type]="activeTab()"
                                    (onEdit)="onEdit($event)"
                                    (onDelete)="onDelete($event)"
                                ></app-lookup-list>
                            }
                        </div>
                    }
                    @case ('frameworks') {
                         <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="border-b border-[rgb(var(--color-border-muted))] text-[rgb(var(--color-text-muted))] text-sm">
                                        <th class="p-3 font-medium">Name</th>
                                        <th class="p-3 font-medium">Category</th>
                                        <th class="p-3 font-medium">Language</th>
                                        <th class="p-3 font-medium">Version</th>
                                        <th class="p-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @for (fw of frameworks(); track fw.id) {
                                        <tr class="border-b border-[rgb(var(--color-border-muted))] hover:bg-[rgb(var(--color-surface-hover))]">
                                            <td class="p-3 text-[rgb(var(--color-text-base))]">{{ fw.name }}</td>
                                            <td class="p-3 text-[rgb(var(--color-text-muted))]">{{ fw.category?.name }}</td>
                                            <td class="p-3 text-[rgb(var(--color-text-muted))]">{{ fw.language?.name }}</td>
                                            <td class="p-3 text-[rgb(var(--color-text-muted))]">{{ fw.currentVersion || fw.latestVersion || '-' }}</td>
                                            <td class="p-3 text-right">
                                                <button (click)="onEdit(fw)" class="text-[rgb(var(--color-accent-ring))] hover:underline mr-3">Edit</button>
                                                <button (click)="onDelete(fw)" class="text-red-500 hover:underline">Delete</button>
                                            </td>
                                        </tr>
                                    } @empty {
                                        <tr>
                                            <td colspan="5" class="p-8 text-center text-[rgb(var(--color-text-muted))]">No frameworks found.</td>
                                        </tr>
                                    }
                                </tbody>
                            </table>
                        </div>
                    }
                    @case ('deployments') {
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="border-b border-[rgb(var(--color-border-muted))] text-[rgb(var(--color-text-muted))] text-sm">
                                        <th class="p-3 font-medium">Service</th>
                                        <th class="p-3 font-medium">Environment</th>
                                        <th class="p-3 font-medium">Server</th>
                                        <th class="p-3 font-medium">Status</th>
                                        <th class="p-3 font-medium">Version</th>
                                        <th class="p-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @for (d of deployments(); track d.id) {
                                        <tr class="border-b border-[rgb(var(--color-border-muted))] hover:bg-[rgb(var(--color-surface-hover))]">
                                            <td class="p-3 text-[rgb(var(--color-text-base))]">{{ d.service?.name }}</td>
                                            <td class="p-3 text-[rgb(var(--color-text-muted))]">{{ d.environment }}</td>
                                            <td class="p-3 text-[rgb(var(--color-text-muted))]">{{ d.server?.hostname }}</td>
                                            <td class="p-3">
                                                 <span [class]="'px-2 py-1 rounded-full text-xs font-medium ' + getStatusClass(d.status)">
                                                    {{ d.status }}
                                                </span>
                                            </td>
                                            <td class="p-3 text-[rgb(var(--color-text-muted))]">{{ d.version }}</td>
                                            <td class="p-3 text-right">
                                                <button (click)="onEdit(d)" class="text-[rgb(var(--color-accent-ring))] hover:underline mr-3">Edit</button>
                                                <button (click)="onDelete(d)" class="text-red-500 hover:underline">Delete</button>
                                            </td>
                                        </tr>
                                    } @empty {
                                        <tr>
                                            <td colspan="6" class="p-8 text-center text-[rgb(var(--color-text-muted))]">No deployments found.</td>
                                        </tr>
                                    }
                                </tbody>
                            </table>
                        </div>
                    }
                    @case ('servers') {
                        <div class="overflow-x-auto">
                             <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="border-b border-[rgb(var(--color-border-muted))] text-[rgb(var(--color-text-muted))] text-sm">
                                        <th class="p-3 font-medium">Hostname</th>
                                        <th class="p-3 font-medium">IP Address</th>
                                        <th class="p-3 font-medium">Type</th>
                                        <th class="p-3 font-medium">OS</th>
                                        <th class="p-3 font-medium">Status</th>
                                        <th class="p-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @for (s of servers(); track s.id) {
                                        <tr class="border-b border-[rgb(var(--color-border-muted))] hover:bg-[rgb(var(--color-surface-hover))]">
                                            <td class="p-3 text-[rgb(var(--color-text-base))]">{{ s.hostname }}</td>
                                            <td class="p-3 text-[rgb(var(--color-text-muted))]">{{ s.ipAddress }}</td>
                                            <td class="p-3 text-[rgb(var(--color-text-muted))]">{{ s.serverTypeId }}</td> 
                                            <td class="p-3 text-[rgb(var(--color-text-muted))]">{{ s.operatingSystemId }}</td>
                                            <td class="p-3">
                                                <span class="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                                                    {{ s.status }}
                                                </span>
                                            </td>
                                            <td class="p-3 text-right">
                                                <button (click)="onEdit(s)" class="text-[rgb(var(--color-accent-ring))] hover:underline mr-3">Edit</button>
                                                <button (click)="onDelete(s)" class="text-red-500 hover:underline">Delete</button>
                                            </td>
                                        </tr>
                                    } @empty {
                                        <tr>
                                            <td colspan="6" class="p-8 text-center text-[rgb(var(--color-text-muted))]">No servers found.</td>
                                        </tr>
                                    }
                                </tbody>
                            </table>
                        </div>
                    }
                    @case ('service-types') {
                        <app-lookup-list
                            [items]="lookupData()"
                            [type]="managementType()"
                            (onEdit)="onEdit($event)"
                            (onDelete)="onDelete($event)"
                        ></app-lookup-list>
                    }
                    @case ('server-types') {
                         <app-lookup-list
                            [items]="lookupData()"
                            [type]="managementType()"
                            (onEdit)="onEdit($event)"
                            (onDelete)="onDelete($event)"
                        ></app-lookup-list>
                    }
                    @case ('framework-languages') {
                         <app-lookup-list
                            [items]="lookupData()"
                            [type]="managementType()"
                            (onEdit)="onEdit($event)"
                            (onDelete)="onDelete($event)"
                        ></app-lookup-list>
                    }
                    @case ('framework-categories') {
                         <app-lookup-list
                            [items]="lookupData()"
                            [type]="managementType()"
                            (onEdit)="onEdit($event)"
                            (onDelete)="onDelete($event)"
                        ></app-lookup-list>
                    }
                    @default {
                        <div class="p-8 text-center text-[rgb(var(--color-text-muted))]">
                            Management UI for {{ managementType() }} coming soon.
                        </div>
                    }
                }
            }
        </div>

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
        
        <app-upsert-deployment-dialog
            [isOpen]="isDeploymentDialogOpen()"
            [baseUrl]="baseUrl()"
            [deployment]="selectedDeploymentForEdit()"
            (close)="onDeploymentDialogClose()"
            (saved)="onDeploymentSaved()"
        ></app-upsert-deployment-dialog>

        <app-upsert-server-dialog
            [isOpen]="isServerDialogOpen()"
            [baseUrl]="baseUrl()"
            [server]="selectedServerForEdit()"
            (close)="onServerDialogClose()"
            (saved)="onServerSaved()"
        ></app-upsert-server-dialog>

        <app-upsert-lookup-dialog
            [isOpen]="isLookupDialogOpen()"
            [baseUrl]="baseUrl()"
            [type]="managementType()"
            [item]="selectedLookupForEdit()"
            (close)="onLookupDialogClose()"
            (saved)="onLookupSaved()"
        ></app-upsert-lookup-dialog>



    </div>
  `
})
export class PlatformManagementComponent {
    managementType = input.required<string>();
    baseUrl = input.required<string>();

    platformService = inject(PlatformManagementService);

    // Data Signals
    services = signal<ServiceInstance[]>([]);
    frameworks = signal<Framework[]>([]);
    deployments = signal<Deployment[]>([]);
    servers = signal<Host[]>([]);

    loading = signal(false);
    error = signal<string | null>(null);

    // Dialog State
    isServiceDialogOpen = signal(false);
    selectedServiceForEdit = signal<ServiceInstance | null>(null);

    isFrameworkDialogOpen = signal(false);
    selectedFrameworkForEdit = signal<Framework | null>(null);

    isDeploymentDialogOpen = signal(false);
    selectedDeploymentForEdit = signal<Deployment | null>(null);

    isServerDialogOpen = signal(false);
    selectedServerForEdit = signal<Host | null>(null);

    // Lookup State
    lookupData = signal<LookupItem[]>([]);
    isLookupDialogOpen = signal(false);
    selectedLookupForEdit = signal<LookupItem | null>(null);

    // Tab State for Generic Service View
    activeTab = signal<string>('services');

    constructor() {
        effect(() => {
            // Reset active tab when management type changes
            if (this.managementType()) {
                this.activeTab.set(this.managementType() === 'services' ? 'services' : this.managementType());
            }
        });

        effect(() => {
            // Load data whenever management type OR active tab changes
            this.loadData();
        });
    }

    async loadData() {
        const type = this.managementType();
        const url = this.baseUrl();
        const currentTab = this.activeTab();

        if (!type || !url) return;

        this.loading.set(true);
        this.error.set(null);

        // Determine what to load based on type and active tab
        // If type is services, we might be looking at a lookup map
        const actualType = (type === 'services' && currentTab !== 'services') ? currentTab : type;

        try {
            switch (actualType) {
                case 'services':
                    const s = await this.platformService.getServices(url);
                    this.services.set(s);
                    break;
                case 'frameworks':
                    const f = await this.platformService.getFrameworks(url);
                    this.frameworks.set(f);
                    break;
                case 'deployments':
                    const d = await this.platformService.getDeployments(url);
                    this.deployments.set(d);
                    break;
                case 'servers':
                    const h = await this.platformService.getServers(url);
                    this.servers.set(h);
                    break;
                case 'service-types':
                case 'server-types':
                case 'framework-languages':
                case 'framework-categories':
                    const l = await this.platformService.getLookup(url, actualType);
                    this.lookupData.set(l);
                    break;
            }
        } catch (e) {
            console.error('Error loading data', e);
            this.error.set(`Failed to load ${actualType}`);
        } finally {
            this.loading.set(false);
        }
    }

    onAdd() {
        const type = this.managementType();
        const currentTab = this.activeTab();
        const actualType = (type === 'services' && currentTab !== 'services') ? currentTab : type;

        switch (actualType) {
            case 'services':
                this.selectedServiceForEdit.set(null);
                this.isServiceDialogOpen.set(true);
                break;
            case 'frameworks':
                this.selectedFrameworkForEdit.set(null);
                this.isFrameworkDialogOpen.set(true);
                break;
            case 'deployments':
                this.selectedDeploymentForEdit.set(null);
                this.isDeploymentDialogOpen.set(true);
                break;
            case 'servers':
                this.selectedServerForEdit.set(null);
                this.isServerDialogOpen.set(true);
                break;
            case 'service-types':
            case 'server-types':
            case 'framework-languages':
            case 'framework-categories':
                this.selectedLookupForEdit.set(null);
                this.isLookupDialogOpen.set(true);
                break;
        }
    }

    onEdit(item: any) {
        const type = this.managementType();
        const currentTab = this.activeTab();
        const actualType = (type === 'services' && currentTab !== 'services') ? currentTab : type;

        switch (actualType) {
            case 'services':
                this.selectedServiceForEdit.set(item);
                this.isServiceDialogOpen.set(true);
                break;
            case 'frameworks':
                this.selectedFrameworkForEdit.set(item);
                this.isFrameworkDialogOpen.set(true);
                break;
            case 'deployments':
                this.selectedDeploymentForEdit.set(item);
                this.isDeploymentDialogOpen.set(true);
                break;
            case 'servers':
                this.selectedServerForEdit.set(item);
                this.isServerDialogOpen.set(true);
                break;
            case 'service-types':
            case 'server-types':
            case 'framework-languages':
            case 'framework-categories':
                this.selectedLookupForEdit.set(item);
                this.isLookupDialogOpen.set(true);
                break;
        }
    }

    async onDelete(item: any) {
        if (!confirm('Are you sure you want to delete this item?')) return;

        const type = this.managementType();
        const url = this.baseUrl();
        const currentTab = this.activeTab();
        const actualType = (type === 'services' && currentTab !== 'services') ? currentTab : type;

        try {
            switch (actualType) {
                case 'services':
                    await this.platformService.deleteService(url, Number(item.id));
                    break;
                case 'frameworks':
                    await this.platformService.deleteFramework(url, Number(item.id));
                    break;
                case 'deployments':
                    await this.platformService.deleteDeployment(url, Number(item.id));
                    break;
                case 'servers':
                    await this.platformService.deleteServer(url, Number(item.id));
                    break;
                case 'service-types':
                case 'server-types':
                case 'framework-languages':
                case 'framework-categories':
                    await this.platformService.deleteLookup(url, actualType, Number(item.id));
                    break;
            }
            this.loadData(); // Refresh
        } catch (e) {
            console.error('Delete failed', e);
            alert('Failed to delete item');
        }
    }

    // Service Dialog Handlers
    onServiceDialogClose() {
        this.isServiceDialogOpen.set(false);
        this.selectedServiceForEdit.set(null);
    }

    onServiceSaved() {
        this.loadData();
    }

    // Framework Dialog Handlers
    onFrameworkDialogClose() {
        this.isFrameworkDialogOpen.set(false);
        this.selectedFrameworkForEdit.set(null);
    }

    onFrameworkSaved() {
        this.loadData();
    }

    // Deployment Dialog Handlers
    onDeploymentDialogClose() {
        this.isDeploymentDialogOpen.set(false);
        this.selectedDeploymentForEdit.set(null);
    }

    onDeploymentSaved() {
        this.loadData();
    }

    // Server Dialog Handlers
    onServerDialogClose() {
        this.isServerDialogOpen.set(false);
        this.selectedServerForEdit.set(null);
    }

    onServerSaved() {
        this.loadData();
    }

    getStatusClass(status: string | undefined): string {
        if (!status) return 'bg-gray-500/10 text-gray-500';
        switch (status) {
            case 'RUNNING': return 'bg-green-500/10 text-green-500';
            case 'STOPPED': return 'bg-gray-500/10 text-gray-500';
            case 'STARTING': return 'bg-yellow-500/10 text-yellow-500';
            case 'FAILED': return 'bg-red-500/10 text-red-500';
            default: return 'bg-gray-500/10 text-gray-500';
        }
    }

    // Lookup Dialog Handlers
    onLookupDialogClose() {
        this.isLookupDialogOpen.set(false);
        this.selectedLookupForEdit.set(null);
    }

    onLookupSaved() {
        this.loadData();
    }
}
