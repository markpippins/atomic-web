# Project Blueprint: Throttler

## Overview
Throttler is a Search & Discovery Engine designed to help users explore, consume, and organize information from the web. It leverages an "Idea Stream" to present search results, images, and videos in a fluid, side-by-side interface. Users can save interesting items as bookmarks into a virtual file system for later reference.

## Project Scope
This project focuses **only** on search, discovery, and knowledge management features. Infrastructure management features (Servers, Deployments) have been moved to the **Nexus** project.

## Key Features
- **Idea Stream**: Real-time aggregation of search results.
- **Bookmarks**: Save and categorize search findings.
- **Session Filesystem**: Ephemeral storage for research sessions.

## Architecture
- **Framework**: Angular 18+ (Standalone, Signals).
- **State**: Persistent local storage for user preferences and bookmarks.
- **Backend Integration**: Connects to various Search APIs (Google, Bing, Internal, etc.).
