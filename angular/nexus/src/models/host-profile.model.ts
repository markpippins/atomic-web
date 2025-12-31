export interface HostProfile {
    id: string;
    name: string;
    hostServerUrl: string;
    imageUrl: string; // For status image/icon

    // Host.java specific fields
    hostname?: string;
    ipAddress?: string;
    environment?: 'DEV' | 'QA' | 'PROD' | 'STAGING';
    operatingSystem?: string;
    cpuCores?: number;
    memoryMb?: number;
    diskGb?: number;
    region?: string;
    cloudProvider?: 'AWS' | 'GCP' | 'AZURE' | 'ON_PREM';
    status?: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
    description?: string;
}
