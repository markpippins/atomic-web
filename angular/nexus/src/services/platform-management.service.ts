import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ServiceInstance, Framework, Deployment } from '../models/service-mesh.model.js';

export interface Host {
    id: number;
    hostname: string;
    ipAddress: string;
    serverTypeId: number;
    environmentTypeId: number;
    operatingSystemId: number;
    cpuCores?: number;
    memory?: string;
    disk?: string;
    status?: string;
    region?: string;
    cloudProvider?: string;
    description?: string;
    activeFlag?: boolean;
}

export interface ServicePayload {
    name: string;
    description?: string;
    frameworkId: number;
    serviceTypeId: number;
    defaultPort?: number;
    apiBasePath?: string;
    repositoryUrl?: string;
    version?: string;
    status?: string;
}

export interface FrameworkPayload {
    name: string;
    description?: string;
    vendorId: number;
    categoryId: number;
    languageId: number;
    currentVersion?: string;
    ltsVersion?: string;
    url?: string;
}

export interface DeploymentPayload {
    serviceId: number;
    environmentId: number;
    serverId: number;
    version?: string;
    status?: string;
    port?: number;
    contextPath?: string;
    healthCheckUrl?: string;
}

@Injectable({
    providedIn: 'root'
})
export class PlatformManagementService {
    private http = inject(HttpClient);

    // Loading states
    loading = signal(false);
    error = signal<string | null>(null);

    // Services CRUD
    async getServices(baseUrl: string): Promise<ServiceInstance[]> {
        this.loading.set(true);
        this.error.set(null);
        try {
            const url = `${baseUrl}/api/services`;
            return await firstValueFrom(this.http.get<ServiceInstance[]>(url));
        } catch (e) {
            this.error.set('Failed to fetch services');
            throw e;
        } finally {
            this.loading.set(false);
        }
    }

    async createService(baseUrl: string, service: ServicePayload): Promise<ServiceInstance> {
        this.loading.set(true);
        this.error.set(null);
        try {
            const url = `${baseUrl}/api/services`;
            return await firstValueFrom(this.http.post<ServiceInstance>(url, service));
        } catch (e) {
            this.error.set('Failed to create service');
            throw e;
        } finally {
            this.loading.set(false);
        }
    }

    async updateService(baseUrl: string, id: number, service: ServicePayload): Promise<ServiceInstance> {
        this.loading.set(true);
        this.error.set(null);
        try {
            const url = `${baseUrl}/api/services/${id}`;
            return await firstValueFrom(this.http.put<ServiceInstance>(url, service));
        } catch (e) {
            this.error.set('Failed to update service');
            throw e;
        } finally {
            this.loading.set(false);
        }
    }

    async deleteService(baseUrl: string, id: number): Promise<void> {
        this.loading.set(true);
        this.error.set(null);
        try {
            const url = `${baseUrl}/api/services/${id}`;
            await firstValueFrom(this.http.delete<void>(url));
        } catch (e) {
            this.error.set('Failed to delete service');
            throw e;
        } finally {
            this.loading.set(false);
        }
    }

    // Frameworks CRUD
    async getFrameworks(baseUrl: string): Promise<Framework[]> {
        this.loading.set(true);
        this.error.set(null);
        try {
            const url = `${baseUrl}/api/frameworks`;
            return await firstValueFrom(this.http.get<Framework[]>(url));
        } catch (e) {
            this.error.set('Failed to fetch frameworks');
            throw e;
        } finally {
            this.loading.set(false);
        }
    }

    async createFramework(baseUrl: string, framework: FrameworkPayload): Promise<Framework> {
        this.loading.set(true);
        this.error.set(null);
        try {
            const url = `${baseUrl}/api/frameworks`;
            return await firstValueFrom(this.http.post<Framework>(url, framework));
        } catch (e) {
            this.error.set('Failed to create framework');
            throw e;
        } finally {
            this.loading.set(false);
        }
    }

    async updateFramework(baseUrl: string, id: number, framework: FrameworkPayload): Promise<Framework> {
        this.loading.set(true);
        this.error.set(null);
        try {
            const url = `${baseUrl}/api/frameworks/${id}`;
            return await firstValueFrom(this.http.put<Framework>(url, framework));
        } catch (e) {
            this.error.set('Failed to update framework');
            throw e;
        } finally {
            this.loading.set(false);
        }
    }

    async deleteFramework(baseUrl: string, id: number): Promise<void> {
        this.loading.set(true);
        this.error.set(null);
        try {
            const url = `${baseUrl}/api/frameworks/${id}`;
            await firstValueFrom(this.http.delete<void>(url));
        } catch (e) {
            this.error.set('Failed to delete framework');
            throw e;
        } finally {
            this.loading.set(false);
        }
    }

    // Deployments CRUD
    async getDeployments(baseUrl: string): Promise<Deployment[]> {
        this.loading.set(true);
        this.error.set(null);
        try {
            const url = `${baseUrl}/api/deployments`;
            return await firstValueFrom(this.http.get<Deployment[]>(url));
        } catch (e) {
            this.error.set('Failed to fetch deployments');
            throw e;
        } finally {
            this.loading.set(false);
        }
    }

    async createDeployment(baseUrl: string, deployment: DeploymentPayload): Promise<Deployment> {
        this.loading.set(true);
        this.error.set(null);
        try {
            const url = `${baseUrl}/api/deployments`;
            return await firstValueFrom(this.http.post<Deployment>(url, deployment));
        } catch (e) {
            this.error.set('Failed to create deployment');
            throw e;
        } finally {
            this.loading.set(false);
        }
    }

    async updateDeployment(baseUrl: string, id: number, deployment: DeploymentPayload): Promise<Deployment> {
        this.loading.set(true);
        this.error.set(null);
        try {
            const url = `${baseUrl}/api/deployments/${id}`;
            return await firstValueFrom(this.http.put<Deployment>(url, deployment));
        } catch (e) {
            this.error.set('Failed to update deployment');
            throw e;
        } finally {
            this.loading.set(false);
        }
    }

    async deleteDeployment(baseUrl: string, id: number): Promise<void> {
        this.loading.set(true);
        this.error.set(null);
        try {
            const url = `${baseUrl}/api/deployments/${id}`;
            await firstValueFrom(this.http.delete<void>(url));
        } catch (e) {
            this.error.set('Failed to delete deployment');
            throw e;
        } finally {
            this.loading.set(false);
        }
    }

    // Servers/Hosts CRUD
    async getServers(baseUrl: string): Promise<Host[]> {
        this.loading.set(true);
        this.error.set(null);
        try {
            const url = `${baseUrl}/api/servers`;
            return await firstValueFrom(this.http.get<Host[]>(url));
        } catch (e) {
            this.error.set('Failed to fetch servers');
            throw e;
        } finally {
            this.loading.set(false);
        }
    }

    async createServer(baseUrl: string, server: Partial<Host>): Promise<Host> {
        this.loading.set(true);
        this.error.set(null);
        try {
            const url = `${baseUrl}/api/servers`;
            return await firstValueFrom(this.http.post<Host>(url, server));
        } catch (e) {
            this.error.set('Failed to create server');
            throw e;
        } finally {
            this.loading.set(false);
        }
    }

    async updateServer(baseUrl: string, id: number, server: Partial<Host>): Promise<Host> {
        this.loading.set(true);
        this.error.set(null);
        try {
            const url = `${baseUrl}/api/servers/${id}`;
            return await firstValueFrom(this.http.put<Host>(url, server));
        } catch (e) {
            this.error.set('Failed to update server');
            throw e;
        } finally {
            this.loading.set(false);
        }
    }

    async deleteServer(baseUrl: string, id: number): Promise<void> {
        this.loading.set(true);
        this.error.set(null);
        try {
            const url = `${baseUrl}/api/servers/${id}`;
            await firstValueFrom(this.http.delete<void>(url));
        } catch (e) {
            this.error.set('Failed to delete server');
            throw e;
        } finally {
            this.loading.set(false);
        }
    }

    // Lookup
    async getLookup(baseUrl: string, type: string): Promise<LookupItem[]> {
        // Endpoint mapping
        let endpoint = type;
        if (type === 'service-types') endpoint = 'service-types';
        else if (type === 'server-types') endpoint = 'server-types'; // Assuming this is correct endpoint
        else if (type === 'framework-categories') endpoint = 'framework-categories';
        else if (type === 'framework-languages') endpoint = 'framework-languages';

        // If type passed is already the endpoint (e.g. 'framework-categories')

        try {
            const url = `${baseUrl}/api/${endpoint}`;
            return await firstValueFrom(this.http.get<LookupItem[]>(url));
        } catch (e) {
            console.error(`Failed to fetch lookup ${type}`, e);
            throw e;
        }
    }
}

export interface LookupItem {
    id: number;
    name: string;
    description?: string;
    activeFlag?: boolean;
}
