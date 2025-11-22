import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Framework, Service, Server, Deployment, Configuration } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = '/api';

  // Frameworks
  getFrameworks(): Observable<Framework[]> {
    return this.http.get<Framework[]>(`${this.baseUrl}/frameworks`);
  }

  // Services
  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.baseUrl}/services`);
  }

  // Servers
  getServers(): Observable<Server[]> {
    return this.http.get<Server[]>(`${this.baseUrl}/servers`);
  }

  // Deployments
  getDeployments(): Observable<Deployment[]> {
    return this.http.get<Deployment[]>(`${this.baseUrl}/deployments`);
  }

  // Configurations
  getConfigurations(): Observable<Configuration[]> {
    return this.http.get<Configuration[]>(`${this.baseUrl}/configurations`);
  }
}
