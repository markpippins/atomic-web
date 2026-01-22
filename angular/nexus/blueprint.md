# Nexus Project Blueprint

## Overview
Nexus is a unified service mesh management dashboard allowing users to visualize, monitor, and manage services, deployments, and infrastructure across multiple host servers.

## Current Feature: Gateway Editing Experience Integration (In Progress)
Integrating the gateway editor directly into the Nexus Explorer view to allow inline editing of gateway profiles when a gateway node is selected.

### Implementation Status
✅ **Completed:**
- `GatewayEditorComponent` created with full form functionality
- Template integration in `app.component.html` (lines 211-219, 299-307)
- Computed signals for gateway detection:
  - `pane1GatewayProfileId` and `pane2GatewayProfileId` (lines 305-306)
  - `isGatewayContext`, `isGatewaysNodeSelected`, `isGatewaySelected` (lines 410-413)
- Supporting methods implemented:
  - `getGatewayProfileIdForPath()` (line 318)
  - `onSaveGateway()`, `onResetGateway()` (lines 424-430)
  - `onDeleteGateway()`, `onDeleteGatewayById()` (lines 435-458)
  - `onAddGateway()` (lines 506-529)
  - `onEditGatewayByName()` (lines 539-545)
- `GatewayManagementComponent` fully integrated
- Editor save/reset triggers connected via `editorSaveTrigger` and `editorResetTrigger`
- Dirty state tracking via `editorIsDirty` signal

⏳ **Pending Verification:**
- Build validation to ensure no compilation errors
- Runtime testing of gateway selection and editing workflow
- Testing "Add Gateway" functionality from context menu/toolbar

### Next Steps
1. Verify build completes successfully
2. Test gateway node selection triggers editor display
3. Test save/reset functionality in the editor
4. Test "Add Gateway" creates new profile and navigates to editor
5. Confirm delete gateway workflow
6. Update context menu for "Gateways" folder (if needed)
7. Verified "Platform Management" node visibility (renamed from "Infrastructure")
8. Renamed "Servers" node to "Service Hosts" to match user terminology.
9. Improved routing logic to correctly resolve profiles for "Service Hosts", "Deployments", and "Service Definitions".
10. Enabled tree browsing for "Platform Management" folder by activating its `TreeProviderAdapter`.
11. Fixed recursive folder navigation in "Platform Management" by implementing proper path traversal logic.
12. Renamed "Host Servers" node to "Service Registries" to resolve terminology conflict with physical hosts.
13. Flattened "Platform Management" tree to display "Hosts", "Deployments", and "Services" directly, using the primary registry as default context.
14. Removed legacy "Services" node from the root (Home) view to eliminate duplication.
15. Consolidated all Services configuration and management under the "Platform Management" node.
16. Cleaned up `HostServerProvider` by removing unused legacy methods (`fetchServiceConfig`, `fetchLookupTypes`).

## Previous Feature: Service Mesh Sub-Service Visibility
Enhanced the service mesh to display hosted/embedded services within gateway facades, enabling full visibility into the service hierarchy.

### Implemented Features
- **Broker Gateway (Spring Boot)**:
  - Enhanced `HostServerRegistrationService.getHostedServices()` to include additional metadata (framework, status, type, endpoint, healthCheck).
  - Services embedded in the gateway are now registered with full context.
- **Host Server (Spring Boot)**:
  - Enhanced `ExternalServiceRegistration.HostedServiceInfo` DTO with new fields.
  - Updated `storeHostedServices()` to persist all metadata as JSON.
  - Added `getAllServicesWithHosted()` and `getHostedServicesForService()` methods.
  - Added new API endpoints: `GET /api/registry/services/with-hosted` and `GET /api/registry/services/{name}/hosted`.
- **Nexus UI (Angular)**:
  - Added `HostedService` and `ServiceWithHosted` interfaces to the model.
  - Updated `ServiceMeshService` to fetch and track services with hosted services via `servicesWithHosted` signal.
  - Integrated `fetchServicesWithHosted()` into the polling data fetch cycle.

### Migration Path
The architecture supports future migration to standalone microservices via deployment profiles (`embedded` vs `standalone`) without code changes.

## Previous Feature: Host Server & Gateway Integration
Implemented comprehensive management for Broker Gateways and Host Servers, enabling multi-host connectivity and profile management directly within the application.

### Implemented Features
- **Host Server Management**:
  - Integrated `HostServerManagementComponent` into the main application view.
  - Implemented Add, Edit, and Delete workflows for Host Server profiles.
  - Connected `HostServerEditorComponent` properly to the application state.
- **Gateway Management**:
  - Finalized `GatewayManagementComponent` integration.
  - Implemented Add, Edit, and Delete workflows for Gateway profiles.
  - Resolved extensive syntax and integration issues in `AppComponent` to ensure robust handling of profile actions.
- **App Component Refactoring**:
  - Fixed significant parser and scope issues in `AppComponent` caused by malformed methods.
  - Restored proper class structure and ensured all profile management methods are correctly defined and accessible.
  - Verified build integrity and template usage.

## Previous Feature: Platform Management
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
