// api.ts
const API_BASE_URL = 'http://localhost:5000/api';

// Frameworks API
export const getFrameworks = async (active?: boolean) => {
  const url = active !== undefined 
    ? `${API_BASE_URL}/frameworks?active=${active}` 
    : `${API_BASE_URL}/frameworks`;
  const response = await fetch(url);
  return response.json();
};

export const getFrameworkById = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/frameworks/${id}`);
  return response.json();
};

export const createFramework = async (framework: any) => {
  const response = await fetch(`${API_BASE_URL}/frameworks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(framework),
  });
  return response.json();
};

export const updateFramework = async (id: number, framework: any) => {
  const response = await fetch(`${API_BASE_URL}/frameworks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(framework),
  });
  return response.json();
};

export const deleteFramework = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/frameworks/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};

export const toggleFrameworkActive = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/frameworks/${id}/toggle-active`, {
    method: 'PUT',
  });
  return response.json();
};

// Servers API
export const getServers = async (active?: boolean) => {
  const url = active !== undefined 
    ? `${API_BASE_URL}/servers?active=${active}` 
    : `${API_BASE_URL}/servers`;
  const response = await fetch(url);
  return response.json();
};

export const getServerById = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/servers/${id}`);
  return response.json();
};

export const createServer = async (server: any) => {
  const response = await fetch(`${API_BASE_URL}/servers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(server),
  });
  return response.json();
};

export const updateServer = async (id: number, server: any) => {
  const response = await fetch(`${API_BASE_URL}/servers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(server),
  });
  return response.json();
};

export const deleteServer = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/servers/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};

export const toggleServerActive = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/servers/${id}/toggle-active`, {
    method: 'PUT',
  });
  return response.json();
};

// Services API
export const getServices = async (active?: boolean) => {
  const url = active !== undefined 
    ? `${API_BASE_URL}/services?active=${active}` 
    : `${API_BASE_URL}/services`;
  const response = await fetch(url);
  return response.json();
};

export const getServiceById = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/services/${id}`);
  return response.json();
};

export const createService = async (service: any) => {
  const response = await fetch(`${API_BASE_URL}/services`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(service),
  });
  return response.json();
};

export const updateService = async (id: number, service: any) => {
  const response = await fetch(`${API_BASE_URL}/services/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(service),
  });
  return response.json();
};

export const deleteService = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/services/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};

export const toggleServiceActive = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/services/${id}/toggle-active`, {
    method: 'PUT',
  });
  return response.json();
};

// Service Dependencies API
export const getServiceDependencies = async (active?: boolean) => {
  const url = active !== undefined 
    ? `${API_BASE_URL}/service-dependencies?active=${active}` 
    : `${API_BASE_URL}/service-dependencies`;
  const response = await fetch(url);
  return response.json();
};

export const getServiceDependencyById = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/service-dependencies/${id}`);
  return response.json();
};

export const createServiceDependency = async (dependency: any) => {
  const response = await fetch(`${API_BASE_URL}/service-dependencies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dependency),
  });
  return response.json();
};

export const updateServiceDependency = async (id: number, dependency: any) => {
  const response = await fetch(`${API_BASE_URL}/service-dependencies/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dependency),
  });
  return response.json();
};

export const deleteServiceDependency = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/service-dependencies/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};

export const toggleServiceDependencyActive = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/service-dependencies/${id}/toggle-active`, {
    method: 'PUT',
  });
  return response.json();
};

// Deployments API
export const getDeployments = async (active?: boolean) => {
  const url = active !== undefined 
    ? `${API_BASE_URL}/deployments?active=${active}` 
    : `${API_BASE_URL}/deployments`;
  const response = await fetch(url);
  return response.json();
};

export const getDeploymentById = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/deployments/${id}`);
  return response.json();
};

export const createDeployment = async (deployment: any) => {
  const response = await fetch(`${API_BASE_URL}/deployments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(deployment),
  });
  return response.json();
};

export const updateDeployment = async (id: number, deployment: any) => {
  const response = await fetch(`${API_BASE_URL}/deployments/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(deployment),
  });
  return response.json();
};

export const deleteDeployment = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/deployments/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};

export const toggleDeploymentActive = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/deployments/${id}/toggle-active`, {
    method: 'PUT',
  });
  return response.json();
};

// Service Configurations API
export const getServiceConfigurations = async (active?: boolean) => {
  const url = active !== undefined 
    ? `${API_BASE_URL}/service-configurations?active=${active}` 
    : `${API_BASE_URL}/service-configurations`;
  const response = await fetch(url);
  return response.json();
};

export const getServiceConfigurationById = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/service-configurations/${id}`);
  return response.json();
};

export const createServiceConfiguration = async (configuration: any) => {
  const response = await fetch(`${API_BASE_URL}/service-configurations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(configuration),
  });
  return response.json();
};

export const updateServiceConfiguration = async (id: number, configuration: any) => {
  const response = await fetch(`${API_BASE_URL}/service-configurations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(configuration),
  });
  return response.json();
};

export const deleteServiceConfiguration = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/service-configurations/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};

export const toggleServiceConfigurationActive = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/service-configurations/${id}/toggle-active`, {
    method: 'PUT',
  });
  return response.json();
};

// Import/Export API
export const importData = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data }),
  });
  return response.json();
};

export const exportData = async (activeOnly: boolean = false) => {
  const url = `${API_BASE_URL}/export?activeOnly=${activeOnly}`;
  const response = await fetch(url);
  return response.json();
};