# Nexus Project Blueprint

## Overview

Nexus is a unified service mesh management dashboard allowing users to visualize, monitor, and manage services, deployments, and infrastructure across multiple host servers.

## Current Feature: Active Host Profile Selection

Implemented the ability for users to designate a specific Host Server profile as "active", which is then used by Platform Management and Service Mesh for all API calls.

### Implementation Status

✅ **Completed:**

- **HostProfile Model** (`host-profile.model.ts`):
  - Added `isActive?: boolean` field to track the active host server.
- **HostProfileService** (`host-profile.service.ts`):
  - Added `activeProfile` computed signal that returns the currently active profile.
  - Added `activeBaseUrl` computed signal that returns the active profile's properly formatted URL.
  - Added `setActiveProfile(profileId)` method to set a profile as active (deactivates all others).
  - Updated `loadProfiles()` to ensure at least one profile is always active.
  - Updated `deleteProfile()` to auto-activate the next available profile if the deleted one was active.
- **ServiceMeshService** (`service-mesh.service.ts`):
  - Refactored constructor to connect only to the active profile instead of all profiles.
  - Profile switching now triggers a reconnect to the newly active host server.
- **HostProfilesDialogComponent**:
  - Updated UI to display an "Active" badge next to the active profile.
  - Added green ring/highlight around active profile in sidebar list.
  - Added "Set Active" button (checkmark icon) that appears on hover for inactive profiles.
  - Added `setActive()` method to trigger profile activation.
- **AppComponent** (`app.component.ts`):
  - **Bug Fix**: Updated `getPlatformNodeForPath()` to use `activeProfile` instead of `profiles[0]`.
  - This fixes the issue where Platform Management CRUD screens were calling the wrong host server.

### How It Works

1. Users configure Host Server profiles in the "Manage Host Servers" dialog.
2. One profile is always marked as "active" (indicated by a green badge and ring).
3. Hovering over an inactive profile shows a checkmark button to "Set as Active".
4. When the active profile changes, Platform Management and Service Mesh automatically reconnect to the new host server.
5. All API calls (services, deployments, frameworks, etc.) are routed to the active host server.

## Previous Feature: Platform Management Images

Ensured that children of the "Platform Management" node (and other Host Server nodes) in the main explorer view request custom images matching their defined icons, consistent with the sidebar tree view.

### Implementation Status

✅ **Completed:**

- **App Component**: Updated `homeProvider` and `buildCombinedFolderTree` to preserve the `icon` property from the provider in the `metadata` object of `FileSystemNode`.
- **File Explorer**: Updated `getIconUrl` in `FileExplorerComponent` to prioritize using `metadata.icon` as the requested image name from `ImageService`, enabling custom icons (like 'cloud_upload', 'storage', 'dns') to be fetched instead of falling back to the item name.
- **Verification**: Ran build to ensure no regressions.

## Current Feature: Explorer Tree Refinements

Refining the "Platform Management" explorer tree nodes to match user requirements for structure and naming consistency.

### Implementation Status

✅ **Completed:**

- Modified `HostServerProvider.ts` to reorder children of `platform` node: Deployments, Hosts, Services, System Health.
- Renamed "Service Hosts" to "Hosts" in `fetchPlatformInfo` for consistency.
- Verified build success.

## Current Feature: Visual Editor & Graph Integration

Integration of the 3D Service Architecture Graph and Visual Component Editor with real backend data from `PlatformManagementService`.

### Implementation Status

✅ **Completed:**

- **Backend Integration**:
  - Updated `PlatformManagementService` to handle `VisualComponent` CRUD operations.
  - Updated `ComponentRegistryService` to fetch component definitions from the backend (`http://localhost:8080`).
  - Added `defaultComponentId` to `ServiceType` and `componentOverrideId` to `ServiceInstance` models.
- **Service Graph**:
  - Refactored `ServiceGraphComponent` to visualize real `ServiceInstance` data fetched from the backend.
  - Implemented visual style resolution: `Service Override` -> `Service Type Default` -> `Fallback`.
  - Removed demo scene loading to ensure specific server data is visualized.
- **Visual Editor UI**:
  - Updated `UpsertLookupDialog` to allow associating a Default Visual Style with a `ServiceType`.
  - Updated `UpsertServiceDialog` to allow setting a specific Visual Style Override for a `ServiceInstance`.
  - Updated `ComponentCreator` to save new component definitions to the backend.
  - Fixed build errors related to strict typing (`label` vs `name`, `allowedConnections`).
- **Build Verification**:
  - Validated that the application builds successfully with the new integration.

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

### Fixed Accidental Toolbar Action Triggers

Fixed an issue where stale toolbar actions (like "New File") would re-trigger when navigating between views (e.g., clicking "Platform Management").

- **Diagnosis**: The global `toolbarAction` signal retained its value across navigation events, causing newly mounted components to react to old actions.
- **Fix**: Updated `AppComponent` to clear `toolbarAction` (`set(null)`) on `onSidebarNavigation`, `onPane1PathChanged`, `onPane2PathChanged`, and `setActivePane`.

### Status Bar Improvements

Updated the main status bar to provide more context about the active view and sub-views.

- **Added**: Visual indicator for "Service Mesh (Graph/Console)" vs "File Explorer (Split)".
- **Context**: Helps users orient themselves between the different main tabs and sub-tabs.

### Feature: Data Dictionary

Refactored the Platform Management views to group dictionary Lookup items under a dedicated "Data Dictionary" node.

- **Added**: "Data Dictionary" node to Platform Management tree.
- **Moved**: CRUD screens for `Frameworks`, `Service Types`, `Server Types`, `Languages`, `Categories`, and `Library Categories` are now individual nodes under Data Dictionary.
- **Cleaned**: Removed the tabbed interface from the "Services" view, as these items are now accessed via the tree.
- **Fixed**: Updated `HostServerProvider.canHandle` to explicitly accept `platform-dictionary-` nodes, resolving an issue where the new dictionary folder would not expand.
- **Fixed**: Updated `AppComponent.getPlatformNodeForPath` to correctly resolve nested "Data Dictionary" paths and normalize "Languages" and "Categories" to their platform management types (`framework-languages`, `framework-categories`).

### Fixed Missing Platform Management Screens

Fixed an issue where "Services", "Hosts", and "Deployments" management screens were hidden.

- **Diagnosis**: The `<app-platform-management>` component was incorrectly nested inside the `isGatewaysNodeSelected` condition block in `app.component.html`, making it unreachable for non-gateway nodes.
- **Fix**: Moved `<app-platform-management>` to its own `@else if (pane1PlatformNode())` block, restoring visibility for all platform management nodes.
- **Verified**: Build successful.

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

### Component Palette Improvements

Enhanced the Component Palette in the Graph View to show realistic shape previews instead of generic squares.

- **Implemented**: Dynamic CSS classes for each geometry type (`box`, `sphere`, `cylinder`, `tall-cylinder`, `octahedron`, `torus`).
- **Visuals**: Added gradients and border-radius tricks to mimic 3D shapes in 2D CSS.
- **Fix**: Corrected label display to use `tool.name` instead of undefined `label`.

### Fixed Backend Build & CORS

Resolved compilation errors in the Host Server caused by missing Lombok-generated methods, which were preventing the new `VisualComponentController` from being deployed.

- **Fixed**: Manually added missing getters/setters to `Deployment.java`, `Host.java`, `Service.java`, and `ServiceConfiguration.java`.
- **Verified**: Backend `mvn clean install` passed.
- **Action Required**: User must restart the Host Server to apply these changes and enable the Visual Component endpoints.

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
