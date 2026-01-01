# Project Blueprint

## Overview
Nexus is the dedicated Service Mesh Management Console for the Atomic platform. Originally derived from the `Throttler` project, it has been specialized to focus solely on managing infrastructure, services, and configurations. It allows users to browse service registries, manage host servers, and configure broker gateways via a hierarchical navigation system.

## Project Split
- **Nexus**: Focuses on "Infrastructure & Operations" (Services, Servers, Deployments).
- **Throttler**: Focuses on "Search & Discovery" (Idea Stream, Knowledge Management).

## Version History
- **Current State**: The application supports distinct configuration and management for Broker Gateways and Host Servers.
- **Previous Changes**: Fixed Host Server port mixups and spurious image server calls.

## Tasks

### Refactor Broker Gateway and Host Server Management
**Objective**: Separate the configuration and management of Broker Gateways and Host Servers.
**Changes**:
- Renamed `ServerProfile` to `BrokerProfile` and `ServerProfileService` to `BrokerProfileService`.
- Created `HostProfile`, `HostProfileService`, and `HostProfilesDialogComponent`.
- Updated `DbService` to store `broker-profiles` and `host-profiles` separately with migration logic.
- Updated `HostServerProvider` to use `HostProfileService` for fetching services.
- Updated `AppComponent` and `SidebarComponent` to expose management for both profile types via the UI.
- Updated `HealthCheckService`, `ImageService`, `LoginService` to use `BrokerProfile` correctly.

**Status**:
- [x] Defined models and services (`HostProfile`, `BrokerProfile`).
- [x] Updated persistence (`DbService`).
- [x] Refactored UI (`HostProfilesDialog`).
- [x] Integrated into navigation (`Sidebar`, `App`).
- [x] Fixed template parser errors (NG5002) in HostProfilesDialogComponent.
- [x] Verified build successful.
