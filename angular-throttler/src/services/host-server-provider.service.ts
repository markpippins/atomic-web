import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription, firstValueFrom } from 'rxjs';
import { TreeProvider } from './tree-provider.interface.js';
import { TreeNode, NodeType, TreeChange, NodeStatus } from '../models/tree-node.model.js';
import { TreeManagerService } from './tree-manager.service.js';
import { ServerProfileService } from './server-profile.service.js';

@Injectable({
    providedIn: 'root'
})
export class HostServerProvider implements TreeProvider {
    readonly providerType = 'host-server';
    private treeManager = inject(TreeManagerService);
    private http = inject(HttpClient);
    private profileService = inject(ServerProfileService);

    constructor() {
        this.treeManager.registerProvider(this);
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
            // List all configured server profiles as Host Servers
            const profiles = this.profileService.profiles();
            return profiles.map(profile => ({
                id: `host-${profile.id}`,
                name: profile.name,
                type: NodeType.FOLDER, // Using FOLDER to represent the Host Server node
                icon: 'server', // Assuming 'server' icon exists or falls back to folder
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
                throw new Error(`Profile with ID ${profileId} not found`);
            }

            return this.fetchServices(profile);
        }

        // Placeholder for other nodes
        return [];
    }

    private async fetchServices(profile: any): Promise<TreeNode[]> {
        try {
            // Fetch services from Host Server using the profile's brokerUrl
            // Expected format: [{ name: 'broker-gateway', framework: 'SPRING_BOOT', port: 8080, status: 'UP' }, ...]
            // Ensure brokerUrl doesn't have trailing slash and handle potential missing protocol
            let baseUrl = profile.brokerUrl;
            if (!baseUrl.startsWith('http')) {
                baseUrl = `http://${baseUrl}`;
            }

            try {
                // The Host Server runs on port 8085, while the brokerUrl typically points to the Broker Gateway (8080).
                // We need to use the hostname from brokerUrl but target port 8085 to fetch services.
                const urlObj = new URL(baseUrl);
                urlObj.port = '8085';
                baseUrl = urlObj.toString();
            } catch (e) {
                console.warn(`Failed to parse brokerUrl '${profile.brokerUrl}' for port adjustment`, e);
            }

            if (baseUrl.endsWith('/')) {
                baseUrl = baseUrl.slice(0, -1);
            }

            // Append /api/registry/services if the brokerUrl is just the base host
            // Assuming brokerUrl points to the root of the Host Server, e.g., http://localhost:8085
            const url = `${baseUrl}/api/registry/services`;

            const services = await firstValueFrom(this.http.get<any[]>(url));

            return services.map(svc => ({
                id: `service-${profile.id}-${svc.name}`,
                name: svc.name,
                type: NodeType.SERVICE,
                icon: 'dns',
                hasChildren: false,
                operations: ['restart', 'view-logs', 'check-health'],
                status: svc.status === 'UP' ? NodeStatus.HEALTHY : NodeStatus.OFFLINE,
                metadata: { ...svc, hostProfileId: profile.id },
                lastUpdated: new Date()
            }));
        } catch (e) {
            console.error(`Failed to fetch services from Host Server ${profile.name}`, e);
            throw e;
        }
    }

    async executeOperation(nodeId: string, operation: string, params: any): Promise<any> {
        console.log(`Executing ${operation} on ${nodeId}`, params);
        return null;
    }

    async getAvailableOperations(nodeId: string): Promise<string[]> {
        return [];
    }

    watchChanges(nodeId: string, callback: (changes: TreeChange[]) => void): Subscription {
        return new Subscription();
    }
}
