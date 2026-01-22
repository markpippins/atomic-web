# Nexus Project Blueprint

## Overview
Nexus is a unified service mesh management dashboard allowing users to visualize, monitor, and manage services, deployments, and infrastructure across multiple host servers.

## Current Feature: Explorer Tree Refinements
Refining the "Platform Management" explorer tree nodes to match user requirements for structure and naming consistency.

### Implementation Status
✅ **Completed:**
- Modified `HostServerProvider.ts` to reorder children of `platform` node: Deployments, Hosts, Services, System Health.
- Renamed "Service Hosts" to "Hosts" in `fetchPlatformInfo` for consistency.
- Verified build success.

### Next Steps
1. Verify visual appearance in the sidebar.

## Current Feature: UI Consistency
### Align Toolbar Behavior for Host Servers
Updated the toolbar context handling to apply the same rules for Host Servers as Gateways. This ensures that file operation buttons (cut, copy, paste, etc.) are hidden when in a Host Server context, and enabling relevant actions like "Save", "Reset", and "Add Host Server".
- **Modified**: `src/app.component.html` - Bound `isHostServer` signals to toolbar and updated event handlers.
- **Modified**: `src/app.component.html` - Bound save/reset triggers to `app-host-server-editor` to enable toolbar-driven saving.
- **Modified**: `src/components/toolbar/toolbar.component.html` - Hidden "Copy To" and "Move To" dropdowns when in Host Server context.

### Align Toolbar Behavior for Platform Management
Extended the toolbar consistency to "Platform Management" contexts (e.g., Services, Deployments, Frameworks).
- **Modified**: `src/app.component.ts` - Added `isPlatformManagementContext` computed signal.
- **Modified**: `src/app.component.html` - Bound `isPlatformManagementContext` to toolbar and updated `toolbarAction` binding for `app-platform-management` to be pane-aware.
- **Modified**: `src/components/toolbar/toolbar.component.ts` - Added `isPlatformManagementContext` input.
- **Modified**: `src/components/toolbar/toolbar.component.html` - Hidden file operations (Cut, Copy, Paste, Share, Copy To, Move To, Magnetize) when in Platform Management context. "New" button dynamically shows "Add [Type]" (already implemented in template logic).

## Current Feature: UI Cleanup
### Remove Redundant Header Cards
Removed redundant header cards containing the "Add New ..." buttons from the Gateway and Host Server management views, as this functionality is already provided by the Toolbar.
- **Modified**: `src/components/gateway-management/gateway-management.component.ts`
- **Modified**: `src/components/host-server-management/host-server-management.component.ts`

## Current Feature: Bug Fixes
### Fixed "Delete Host Server" Button
Fixed an issue where clicking "Delete" for a Host Server profile would initiate the confirmation logic but fail to show the dialog.
- **Implemented**: Added missing `<app-confirm-dialog>` for `isDeleteHostServerConfirmOpen` in `app.component.html`.
- **Verified**: Confirmed `onDeleteHostServer` method exists and is correctly wired.
- **Cleaned**: Removed duplicate/stub implementations of `onDeleteHostServer` mistakenly added during investigation.

## Previous Feature: Gateway Editing Experience Integration
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
