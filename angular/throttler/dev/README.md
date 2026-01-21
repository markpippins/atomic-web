# Throttler - Search & Discovery Engine
Throttler is a modern, web-based knowledge discovery tool. Inspired by file explorers, it repurposes the interface for navigating vast amounts of information, search results, and digital assets. It connects to various search APIs and provides an "Idea Stream" for rapid information consumption.

## Key Design Goals & Features
- **Idea Stream:** A dynamic, contextual pane provides real-time web search results, images, videos, and AI-generated summaries.
- **Search & Discovery:** Serves as a central hub for finding information across the local context and the web.
- **Smart Bookmarking:** Save any item from the Idea Stream as a bookmark. Organize findings into "folders" for distinct research topics.
- **Virtual Session Filesystem:** Navigates a virtual file system persisted in browser storage, perfect for organizing ephemeral research sessions.
- **Dual Pane View:** Compare search results or manage different research topics simultaneously.
- **Modern Angular:** Built with the latest standalone components, signals, and zoneless change detection.
- **Theming:** Integrated Light, Steel, and Dark themes.

## Running the Application (Web Version)

This is a web application built with the Angular CLI.

### Prerequisites

You must have [Node.js](https://nodejs.org/) and npm (or a compatible package manager) installed.

### 1. Installation

First, install the necessary dependencies from the project's root directory:

```bash
npm install
```

### 2. Running the Development Server

To start the local development server, run the following command:

```bash
npm start
```

This will compile the application, start a development server, and open your default browser to the application, typically at `http://localhost:4200`. The server will automatically reload when you save changes to the source files.