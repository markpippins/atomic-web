# Nexus - Service Mesh Management Console

Nexus is a specialized administration console built with Angular for managing the Atomic Service Mesh. It provides a comprehensive interface for overseeing services, host servers, deployments, and configurations across the infrastructure.

## Key Capabilities

- **Service Mesh Management:** View and manage the registry of all services (`atomic-services`, `atomic-users`, etc.), their versions, and statuses.
- **Infrastructure Control:** Monitor and configure Host Servers (physical/virtual nodes) and Broker Gateways.
- **Deployment Tracking:** (Future) Track active deployments and rollout history across different environments.
- **Configuration Management:** Centralized management of service configurations and feature flags.

## Architecture & Features

- **Modern Angular:** Built with Angular 18+, utilizing Standalone Components, Signals, and Zoneless Change Detection for optimal performance.
- **Remote Management:** Connects to backend APIs to fetch real-time state of the mesh.
- **Dual Pane Interface:** Efficiently manage resources with a split-view interface for comparing configs or logs.
- **Theming:** Integrated Light, Steel, and Dark themes.

## Running the Application

This is a web application built with the Angular CLI.

### Prerequisites

You must have [Node.js](https://nodejs.org/) and npm installed.

### 1. Installation

```bash
npm install
```

### 2. Running the Development Server

```bash
npm start
```

This will run the application at `http://localhost:4200`.