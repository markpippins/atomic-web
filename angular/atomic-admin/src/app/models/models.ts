export interface FrameworkCategory {
  id: number;
  name: string;
  description: string;
}

export interface FrameworkLanguage {
  id: number;
  name: string;
  description: string;
}

export interface Framework {
  id: number;
  name: string;
  description: string;
  category: FrameworkCategory;
  language: FrameworkLanguage;
  latestVersion: string;
  documentationUrl: string;
  supportsBrokerPattern: boolean;
}

export interface ServiceType {
  id: number;
  name: string;
  description: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  framework: Framework;
  type: ServiceType;
  defaultPort: number;
  healthCheckPath: string;
  apiBasePath: string;
  status: string;
  version: string;
}

export interface ServerType {
  id: number;
  name: string;
  description: string;
}

export interface Server {
  id: number;
  hostname: string;
  ipAddress: string;
  type: ServerType;
  environment: string;
  operatingSystem: string;
  cpuCores: number;
  memoryMb: number;
  diskGb: number;
  region: string;
  cloudProvider: string;
  status: string;
  description: string;
}

export interface Deployment {
  id: number;
  service: Service;
  server: Server;
  port: number;
  contextPath: string;
  version: string;
  status: string;
  environment: string;
  healthCheckUrl: string;
  processId: string;
  containerName: string;
  deployedAt: string;
  lastHealthCheck: string;
}

export interface Configuration {
  id: number;
  service: Service;
  configKey: string;
  configValue: string;
  environment: string;
  type: string;
  isSecret: boolean;
  description: string;
}
