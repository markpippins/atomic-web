export interface ServerProfile {
    id: string;
    name: string;
    brokerUrl: string;
    description?: string;
}

export const DEFAULT_PROFILE: ServerProfile = {
    id: 'local',
    name: 'Local Development',
    brokerUrl: 'http://localhost:8080/api/broker/submitRequest',
    description: 'Local development environment'
};
