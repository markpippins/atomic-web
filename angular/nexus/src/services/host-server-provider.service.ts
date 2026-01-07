import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription, firstValueFrom, Subject } from 'rxjs';
import { TreeProvider } from './tree-provider.interface.js';
import { TreeNode, NodeType, TreeChange, NodeStatus } from '../models/tree-node.model.js';
import { TreeManagerService } from './tree-manager.service.js';
import { HostProfileService } from './host-profile.service.js';
import { HostProfile } from '../models/host-profile.model.js';
import { ServiceInstance, Deployment, Framework } from '../models/service-mesh.model.js';
import { ServiceMeshService } from './service-mesh.service.js';

@Injectable({
    providedIn: 'root'
})
export class HostServerProvider implements TreeProvider {
    readonly providerType = 'host-server';
    private treeManager = inject(TreeManagerService);
    private http = inject(HttpClient);
    private profileService = inject(HostProfileService);
    private serviceMeshService = inject(ServiceMeshService);
    private updateSubject = new Subject<TreeChange[]>();

    constructor() {
        this.treeManager.registerProvider(this);

        // Listen for service updates from the mesh service and notify the tree
        this.serviceMeshService.watchServiceUpdates().subscribe(update => {
            this.updateSubject.next([{
                type: 'modified',
                nodeId: `service-${update.hostProfileId}-${update.serviceId}`
            }]);
        });
    }

    canHandle(nodeId: string): boolean {
        return nodeId === 'root' ||
            nodeId.startsWith('services') ||
            nodeId.startsWith('host-') ||
            nodeId.startsWith('service-') ||
            nodeId.startsWith('users') ||
            nodeId.startsWith('search') ||
            nodeId.startsWith('filesystems') ||
            nodeId.startsWith('platform');
    }

    async getChildren(nodeId: string): Promise<TreeNode[]> {
        if (nodeId === 'root') {
            return [
                {
                    id: 'services',
                    name: 'Services',
                    type: NodeType.FOLDER,
                    icon: 'dns',
                    hasChildren: true,
                    operations: [],
                    metadata: {},
                    lastUpdated: new Date()
                },
                {
                    id: 'users',
                    name: 'Users',
                    type: NodeType.FOLDER,
                    icon: 'group',
                    hasChildren: true,
                    operations: [],
                    metadata: {},
                    lastUpdated: new Date()
                },
                {
                    id: 'search',
                    name: 'Search & Discovery',
                    type: NodeType.FOLDER,
                    icon: 'search',
                    hasChildren: true,
                    operations: [],
                    metadata: {},
                    lastUpdated: new Date()
                },
                {
                    id: 'filesystems',
                    name: 'File Systems',
                    type: NodeType.FOLDER,
                    icon: 'storage',
                    hasChildren: true,
                    operations: [],
                    metadata: {},
                    lastUpdated: new Date()
                },
                {
                    id: 'platform',
                    name: 'Platform Management',
                    type: NodeType.FOLDER,
                    icon: 'settings',
                    hasChildren: true,
                    operations: [],
                    metadata: {},
                    lastUpdated: new Date()
                }
            ];
        }

        if (nodeId === 'services') {
            // List all configured host profiles
            const profiles = this.profileService.profiles();
            return profiles.map(profile => ({
                id: `host-${profile.id}`,
                name: profile.name,
                type: NodeType.HOST_SERVER,
                icon: 'server',
                hasChildren: true,
                operations: [],
                metadata: { profile },
                lastUpdated: new Date()
            }));
        }

        if (nodeId.startsWith('host-')) {
            const profileId = nodeId.replace('host-', '');
            const profile = this.profileService.profiles().find(p => p.id === profileId);

            if (!profile) {
                // Return empty if profile not found (might have been deleted)
                return [];
            }

            return this.fetchServices(profile);
        }

        // If we have a service node, return its deployments
        if (nodeId.startsWith('service-')) {
            // Extract profileId and serviceId from the nodeId
            // nodeId format: service-{profileId}-{serviceId}
            const parts = nodeId.split('-');
            if (parts.length >= 3) {
                const profileId = parts[1];
                const serviceId = parts.slice(2).join('-'); // Handle cases where serviceId might contain '-'

                const profile = this.profileService.profiles().find(p => p.id === profileId);
                if (profile) {
                    return this.fetchDeploymentsForService(profile, serviceId);
                }
            }
            return [];
        }

        if (nodeId === 'users') {
            const profiles = this.profileService.profiles();
            return profiles.map(profile => ({
                id: `host-users-${profile.id}`,
                name: profile.name,
                type: NodeType.FOLDER,
                icon: 'group',
                hasChildren: true,
                operations: [],
                metadata: { profile },
                lastUpdated: new Date()
            }));
        }

        if (nodeId.startsWith('host-users-')) {
            const profileId = nodeId.replace('host-users-', '');
            const profile = this.profileService.profiles().find(p => p.id === profileId);
            if (profile) return this.fetchUsers(profile);
            return [];
        }

        if (nodeId === 'platform') {
            const profiles = this.profileService.profiles();
            return profiles.map(profile => ({
                id: `host-platform-${profile.id}`,
                name: profile.name,
                type: NodeType.FOLDER,
                icon: 'settings',
                hasChildren: true,
                operations: [],
                metadata: { profile },
                lastUpdated: new Date()
            }));
        }

        if (nodeId.startsWith('host-platform-')) {
            const profileId = nodeId.replace('host-platform-', '');
            const profile = this.profileService.profiles().find(p => p.id === profileId);
            if (profile) return this.fetchPlatformInfo(profile);
            return [];
        }

        if (nodeId === 'filesystems') {
            // Future implementation: fetch connected file systems
            return [];
        }

        // Placeholder for other nodes
        return [];
    }

    private async fetchUsers(profile: HostProfile): Promise<TreeNode[]> {
        try {
            // For now, let's assume an endpoint exists or returns empty
            const baseUrl = this.getBaseUrl(profile);
            const usersUrl = `${baseUrl}/api/users`;
            // Attempt to fetch, fallback to placeholder if it fails (as it might not exist yet)
            try {
                const users = await firstValueFrom(this.http.get<any[]>(usersUrl));
                return users.map(user => ({
                    id: `user-${profile.id}-${user.id || user.alias}`,
                    name: user.alias || user.name,
                    type: NodeType.USER,
                    icon: 'person',
                    hasChildren: false,
                    operations: ['view-details', 'manage-quota'],
                    metadata: { ...user, hostProfileId: profile.id },
                    lastUpdated: new Date()
                }));
            } catch (e) {
                console.warn(`Users endpoint not found for ${profile.name}, showing placeholder.`);
                return [{
                    id: `user-placeholder-${profile.id}`,
                    name: 'No users found (API pending)',
                    type: NodeType.USER,
                    icon: 'person_off',
                    hasChildren: false,
                    operations: [],
                    metadata: {},
                    lastUpdated: new Date()
                }];
            }
        } catch (e) {
            return [];
        }
    }

    private async fetchPlatformInfo(profile: HostProfile): Promise<TreeNode[]> {
        const baseUrl = this.getBaseUrl(profile);
        return [
            {
                id: `platform-services-${profile.id}`,
                name: 'Services',
                type: NodeType.FOLDER,
                icon: 'dns',
                hasChildren: false,
                operations: ['manage-services'],
                metadata: { hostProfileId: profile.id, url: `${baseUrl}/api/services`, managementType: 'services' },
                lastUpdated: new Date()
            },
            {
                id: `platform-frameworks-${profile.id}`,
                name: 'Frameworks',
                type: NodeType.FOLDER,
                icon: 'code',
                hasChildren: false,
                operations: ['manage-frameworks'],
                metadata: { hostProfileId: profile.id, url: `${baseUrl}/api/frameworks`, managementType: 'frameworks' },
                lastUpdated: new Date()
            },
            {
                id: `platform-deployments-${profile.id}`,
                name: 'Deployments',
                type: NodeType.FOLDER,
                icon: 'cloud_upload',
                hasChildren: false,
                operations: ['manage-deployments'],
                metadata: { hostProfileId: profile.id, url: `${baseUrl}/api/deployments`, managementType: 'deployments' },
                lastUpdated: new Date()
            },
            {
                id: `platform-servers-${profile.id}`,
                name: 'Servers',
                type: NodeType.FOLDER,
                icon: 'storage',
                hasChildren: false,
                operations: ['manage-servers'],
                metadata: { hostProfileId: profile.id, url: `${baseUrl}/api/servers`, managementType: 'servers' },
                lastUpdated: new Date()
            },
            {
                id: `platform-lookup-${profile.id}`,
                name: 'Lookup Tables',
                type: NodeType.FOLDER,
                icon: 'table_chart',
                hasChildren: false,
                operations: ['manage-lookups'],
                metadata: { hostProfileId: profile.id, baseUrl, managementType: 'lookups' },
                lastUpdated: new Date()
            },
            {
                id: `platform-health-${profile.id}`,
                name: 'System Health',
                type: NodeType.HEALTH_CHECK,
                icon: 'monitor_heart',
                hasChildren: false,
                operations: ['check-health'],
                metadata: { hostProfileId: profile.id, url: `${baseUrl}/api/platform/health` },
                lastUpdated: new Date()
            }
        ];
    }

    private getBaseUrl(profile: HostProfile): string {
        let baseUrl = profile.hostServerUrl;
        if (!baseUrl.startsWith('http')) baseUrl = `http://${baseUrl}`;
        if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
        return baseUrl;
    }

    private async fetchServices(profile: HostProfile): Promise<TreeNode[]> {
        try {
            let baseUrl = profile.hostServerUrl;

            if (!baseUrl.startsWith('http')) {
                baseUrl = `http://${baseUrl}`;
            }

            if (baseUrl.endsWith('/')) {
                baseUrl = baseUrl.slice(0, -1);
            }

            // Fetch services from the Host Server API
            const servicesUrl = `${baseUrl}/api/services`;
            const servicesResponse: ServiceInstance[] = await firstValueFrom(this.http.get<ServiceInstance[]>(servicesUrl));

            // Fetch deployments to get the health status
            const deploymentsUrl = `${baseUrl}/api/deployments`;
            const deploymentsResponse: Deployment[] = await firstValueFrom(this.http.get<Deployment[]>(deploymentsUrl));

            // Map services to tree nodes with proper metadata
            return servicesResponse.map(service => {
                // Find all deployments for this service to determine health status
                const serviceDeployments = deploymentsResponse.filter(d => d.service.id === service.id);
                const healthStatus = this.getOverallHealthStatus(serviceDeployments);

                return {
                    id: `service-${profile.id}-${service.id}`,
                    name: service.name,
                    type: NodeType.SERVICE,
                    icon: 'dns',
                    hasChildren: true, // Services can have child nodes like deployments
                    operations: ['restart', 'view-logs', 'check-health'],
                    status: this.mapHealthStatusToNodeStatus(healthStatus),
                    metadata: {
                        ...service,
                        hostProfileId: profile.id,
                        deployments: serviceDeployments,
                        framework: service.framework
                    },
                    lastUpdated: new Date()
                };
            });
        } catch (e) {
            console.error(`Failed to fetch services from Host Server ${profile.name}`, e);
            throw e;
        }
    }

    private async fetchDeploymentsForService(profile: HostProfile, serviceId: string): Promise<TreeNode[]> {
        try {
            let baseUrl = profile.hostServerUrl;

            if (!baseUrl.startsWith('http')) {
                baseUrl = `http://${baseUrl}`;
            }

            if (baseUrl.endsWith('/')) {
                baseUrl = baseUrl.slice(0, -1);
            }

            // Fetch deployments for the specific service
            const deploymentsUrl = `${baseUrl}/api/deployments/service/${serviceId}`;
            const deploymentsResponse: Deployment[] = await firstValueFrom(this.http.get<Deployment[]>(deploymentsUrl));

            return deploymentsResponse.map(deployment => ({
                id: `deployment-${profile.id}-${deployment.id}`,
                name: `${deployment.server.hostname}:${deployment.port}`,
                type: NodeType.HOST_SERVER, // Using HOST_SERVER as a deployment node type
                icon: 'settings',
                hasChildren: false,
                operations: ['start', 'stop', 'restart'],
                status: this.mapDeploymentStatusToNodeStatus(deployment.status),
                metadata: {
                    ...deployment,
                    hostProfileId: profile.id
                },
                lastUpdated: new Date()
            }));
        } catch (e) {
            console.error(`Failed to fetch deployments for service ${serviceId} from Host Server ${profile.name}`, e);
            throw e;
        }
    }

    private getOverallHealthStatus(deployments: Deployment[]): 'HEALTHY' | 'UNHEALTHY' | 'DEGRADED' | 'UNKNOWN' {
        if (deployments.length === 0) {
            return 'UNKNOWN';
        }

        // If any deployment is unhealthy, the service is unhealthy
        // If any deployment is degraded but none are unhealthy, the service is degraded
        // If all deployments are healthy, the service is healthy
        const statuses = deployments.map(d => d.healthStatus);

        if (statuses.some(s => s === 'UNHEALTHY')) {
            return 'UNHEALTHY';
        } else if (statuses.some(s => s === 'DEGRADED')) {
            return 'DEGRADED';
        } else if (statuses.every(s => s === 'HEALTHY')) {
            return 'HEALTHY';
        } else {
            return 'UNKNOWN';
        }
    }

    private mapHealthStatusToNodeStatus(healthStatus: 'HEALTHY' | 'UNHEALTHY' | 'DEGRADED' | 'UNKNOWN'): NodeStatus {
        switch (healthStatus) {
            case 'HEALTHY': return NodeStatus.HEALTHY;
            case 'UNHEALTHY': return NodeStatus.UNHEALTHY;
            case 'DEGRADED': return NodeStatus.DEGRADED;
            case 'UNKNOWN': return NodeStatus.UNKNOWN;
        }
    }

    private mapDeploymentStatusToNodeStatus(deploymentStatus: string): NodeStatus {
        switch (deploymentStatus) {
            case 'RUNNING': return NodeStatus.HEALTHY;
            case 'STOPPED': return NodeStatus.OFFLINE;
            case 'STARTING':
            case 'STOPPING': return NodeStatus.DEGRADED;
            case 'FAILED': return NodeStatus.UNHEALTHY;
            default: return NodeStatus.UNKNOWN;
        }
    }

    async executeOperation(nodeId: string, operation: string, params: any): Promise<any> {
        console.log(`Executing ${operation} on ${nodeId}`, params);

        // Handle Service Operations
        if (nodeId.startsWith('service-')) {
            const parts = nodeId.split('-');
            const profileId = parts[1];
            const serviceId = parts.slice(2).join('-');
            const profile = this.profileService.profiles().find(p => p.id === profileId);

            if (profile) {
                const serviceMeshService = inject(ServiceMeshService);
                return serviceMeshService.executeServiceOperation(serviceId, operation as any, profile);
            }
        }

        // Handle Deployment Operations
        if (nodeId.startsWith('deployment-')) {
            const parts = nodeId.split('-');
            const profileId = parts[1];
            const deploymentId = parts.slice(2).join('-');
            const profile = this.profileService.profiles().find(p => p.id === profileId);

            if (profile) {
                const serviceMeshService = inject(ServiceMeshService);
                let baseUrl = profile.hostServerUrl;
                if (!baseUrl.startsWith('http')) baseUrl = `http://${baseUrl}`;
                if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

                return serviceMeshService.executeOperation({
                    deploymentId,
                    operation: operation as any,
                    params
                }, baseUrl);
            }
        }

        return null;
    }

    async getAvailableOperations(nodeId: string): Promise<string[]> {
        if (nodeId.startsWith('service-')) {
            return ['restart', 'view-logs', 'check-health'];
        }
        if (nodeId.startsWith('deployment-')) {
            return ['start', 'stop', 'restart'];
        }
        return [];
    }

    watchChanges(nodeId: string, callback: (changes: TreeChange[]) => void): Subscription {
        return this.updateSubject.asObservable().subscribe(callback);
    }
}
