# Nexus Project Blueprint

## Overview
Nexus is a unified service mesh management dashboard allowing users to visualize, monitor, and manage services, deployments, and infrastructure across multiple host servers.

## Current Feature: Platform Management
This feature adds the ability to manage the underlying metadata of the service mesh (Services, Frameworks, Deployments, Hosts) directly from the Nexus UI.

### Implemented Features
- **Backend**: GET/POST/PUT/DELETE endpoints for Services, Frameworks, Deployments, and Hosts.
- **Frontend Service**: `PlatformManagementService` handling API interactions.
- **UI Integration**:
  - `DetailPaneComponent` dynamically switches to Management View when "Platform Management" nodes are selected.
  - `PlatformManagementComponent`: A reusable component for listing and managing entities.
  - `UpsertServiceDialog`: specific form for adding/editing Services.
  - `UpsertFrameworkDialog`: specific form for adding/editing Frameworks.
  - `UpsertDeploymentDialog`: specific form for adding/editing Deployments (including Service, Server, Environment lookups).
  - `UpsertServerDialog`: specific form for adding/editing Hosts (including Type, Enviroment, OS lookups).
  
### Next Steps
- Add UI for Lookup Tables (Service Types, Environment Types, etc.)
- Implement more robust validation for forms.
- Address missing backend controllers for certain lookups (e.g., OperatingSystem).
