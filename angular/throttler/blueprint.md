# Project Blueprint

## Overview
Angular Throttler is a web application providing a file-explorer interface for managing Atomic services, Host Servers, and unrelated file systems. It allows users to browse services, users, and platform configurations via a tree-based navigation system. It distinguishes between **Broker Gateways** (entry points) and **Host Servers** (managed infrastructure).

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
