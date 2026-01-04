import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { Framework, Service, Server, Deployment, Configuration, ServiceType, ServerType, FrameworkCategory, FrameworkLanguage } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = '/api';

  // Frameworks
  getFrameworks(): Observable<Framework[]> {
    return this.http.get<Framework[]>(`${this.baseUrl}/frameworks`).pipe(
      catchError(error => {
        console.error('Error fetching frameworks:', error);
        return of([]);
      })
    );
  }

  createFramework(framework: Partial<Framework>): Observable<Framework> {
    return this.http.post<Framework>(`${this.baseUrl}/frameworks`, framework);
  }

  updateFramework(id: number, framework: Partial<Framework>): Observable<Framework> {
    return this.http.put<Framework>(`${this.baseUrl}/frameworks/${id}`, framework);
  }

  deleteFramework(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/frameworks/${id}`).pipe(
      catchError(error => {
        console.error('Error deleting framework:', error);
        throw error;
      })
    );
  }

  // Services
  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.baseUrl}/services`);
  }

  getService(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.baseUrl}/services/${id}`);
  }

  createService(service: Partial<Service>): Observable<Service> {
    return this.http.post<Service>(`${this.baseUrl}/services`, service);
  }

  updateService(id: number, service: Partial<Service>): Observable<Service> {
    return this.http.put<Service>(`${this.baseUrl}/services/${id}`, service);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/services/${id}`).pipe(
      catchError(error => {
        console.error('Error deleting service:', error);
        throw error;
      })
    );
  }

  syncServices(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/services/sync`, {});
  }

  // Servers (Hosts)
  // Backend maps to /api/servers
  getServers(): Observable<Server[]> {
    return this.http.get<Server[]>(`${this.baseUrl}/servers`);
  }

  getServer(id: number): Observable<Server> {
    return this.http.get<Server>(`${this.baseUrl}/servers/${id}`);
  }

  createServer(server: Partial<Server>): Observable<Server> {
    return this.http.post<Server>(`${this.baseUrl}/servers`, server);
  }

  updateServer(id: number, server: Partial<Server>): Observable<Server> {
    return this.http.put<Server>(`${this.baseUrl}/servers/${id}`, server);
  }

  deleteServer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/servers/${id}`).pipe(
      catchError(error => {
        console.error('Error deleting server:', error);
        throw error;
      })
    );
  }

  // Deployments
  getDeployments(): Observable<Deployment[]> {
    return this.http.get<Deployment[]>(`${this.baseUrl}/deployments`).pipe(
      catchError(error => {
        console.error('Error fetching deployments:', error);
        return of([]);
      })
    );
  }

  // Check service health
  checkServiceHealth(healthCheckUrl: string): Observable<any> {
    return this.http.get(healthCheckUrl).pipe(
      catchError(error => {
        console.error('Error checking service health:', error);
        // Return an error object to indicate the service is down
        return of({ status: 'DOWN', error: error.message });
      })
    );
  }

  // Configurations
  // Service Types
  getServiceTypes(): Observable<ServiceType[]> {
    return this.http.get<ServiceType[]>(`${this.baseUrl}/service-types`);
  }

  createServiceType(serviceType: Partial<ServiceType>): Observable<ServiceType> {
    return this.http.post<ServiceType>(`${this.baseUrl}/service-types`, serviceType);
  }

  updateServiceType(id: number, serviceType: Partial<ServiceType>): Observable<ServiceType> {
    return this.http.put<ServiceType>(`${this.baseUrl}/service-types/${id}`, serviceType);
  }

  deleteServiceType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/service-types/${id}`).pipe(
      catchError(error => {
        console.error('Error deleting service type:', error);
        throw error;
      })
    );
  }

  // Server Types
  getServerTypes(): Observable<ServerType[]> {
    return this.http.get<ServerType[]>(`${this.baseUrl}/server-types`);
  }

  createServerType(serverType: Partial<ServerType>): Observable<ServerType> {
    return this.http.post<ServerType>(`${this.baseUrl}/server-types`, serverType);
  }

  updateServerType(id: number, serverType: Partial<ServerType>): Observable<ServerType> {
    return this.http.put<ServerType>(`${this.baseUrl}/server-types/${id}`, serverType);
  }

  deleteServerType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/server-types/${id}`).pipe(
      catchError(error => {
        console.error('Error deleting server type:', error);
        throw error;
      })
    );
  }

  // Framework Categories
  getFrameworkCategories(): Observable<FrameworkCategory[]> {
    return this.http.get<FrameworkCategory[]>(`${this.baseUrl}/framework-categories`);
  }

  createFrameworkCategory(category: Partial<FrameworkCategory>): Observable<FrameworkCategory> {
    return this.http.post<FrameworkCategory>(`${this.baseUrl}/framework-categories`, category);
  }

  updateFrameworkCategory(id: number, category: Partial<FrameworkCategory>): Observable<FrameworkCategory> {
    return this.http.put<FrameworkCategory>(`${this.baseUrl}/framework-categories/${id}`, category);
  }

  deleteFrameworkCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/framework-categories/${id}`).pipe(
      catchError(error => {
        console.error('Error deleting framework category:', error);
        throw error;
      })
    );
  }

  // Framework Languages
  getFrameworkLanguages(): Observable<FrameworkLanguage[]> {
    return this.http.get<FrameworkLanguage[]>(`${this.baseUrl}/framework-languages`);
  }

  createFrameworkLanguage(language: Partial<FrameworkLanguage>): Observable<FrameworkLanguage> {
    return this.http.post<FrameworkLanguage>(`${this.baseUrl}/framework-languages`, language);
  }

  updateFrameworkLanguage(id: number, language: Partial<FrameworkLanguage>): Observable<FrameworkLanguage> {
    return this.http.put<FrameworkLanguage>(`${this.baseUrl}/framework-languages/${id}`, language);
  }

  deleteFrameworkLanguage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/framework-languages/${id}`).pipe(
      catchError(error => {
        console.error('Error deleting framework language:', error);
        throw error;
      })
    );
  }
}
