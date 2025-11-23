import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { Framework, Service, Server, Deployment, Configuration } from '../models/models';

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
    return this.http.delete<void>(`${this.baseUrl}/frameworks/${id}`);
  }

  // Services
  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.baseUrl}/services`).pipe(
      catchError(error => {
        console.error('Error fetching services:', error);
        return of([]);
      })
    );
  }

  createService(service: Partial<Service>): Observable<Service> {
    return this.http.post<Service>(`${this.baseUrl}/services`, service);
  }

  updateService(id: number, service: Partial<Service>): Observable<Service> {
    return this.http.put<Service>(`${this.baseUrl}/services/${id}`, service);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/services/${id}`);
  }

  // Servers
  getServers(): Observable<Server[]> {
    return this.http.get<Server[]>(`${this.baseUrl}/servers`).pipe(
      catchError(error => {
        console.error('Error fetching servers:', error);
        return of([]);
      })
    );
  }

  createServer(server: Partial<Server>): Observable<Server> {
    return this.http.post<Server>(`${this.baseUrl}/servers`, server);
  }

  updateServer(id: number, server: Partial<Server>): Observable<Server> {
    return this.http.put<Server>(`${this.baseUrl}/servers/${id}`, server);
  }

  deleteServer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/servers/${id}`);
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

  // Configurations
  getConfigurations(): Observable<Configuration[]> {
    return this.http.get<Configuration[]>(`${this.baseUrl}/configurations`).pipe(
      catchError(error => {
        console.error('Error fetching configurations:', error);
        return of([]);
      })
    );
  }
}
