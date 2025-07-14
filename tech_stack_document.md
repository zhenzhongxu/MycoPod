# MycoPod Tech Stack Document

This document explains the technology choices behind **MycoPod**, an AI-driven agent for managing Proxmox clusters in your homelab. We use everyday language so anyone—technical or not—can understand why each tool was chosen and how it fits together.

## 1. Frontend Technologies

We built the user interface (UI) to be simple, minimalistic, and responsive, focusing on clarity and ease of use.

- **React (with functional components & hooks)**
  - Why: React is a popular, well-supported library for building interactive UIs. Hooks make it easy to manage state and side effects in a clear, concise way.
- **TypeScript**
  - Why: Adds clear typing on top of JavaScript. This helps catch mistakes early and makes the code easier to understand and maintain.
- **Vite (development & build tool)**
  - Why: Provides extremely fast hot-reloading during development and efficient bundling for production. It keeps the feedback loop quick when making UI changes.
- **CSS Modules (for styling)**
  - Why: Allows us to write plain CSS but keep class names scoped to individual components. This prevents style clashes and makes maintenance straightforward.
- **React Router**
  - Why: Provides a simple way to manage navigation between different screens (e.g., login, editor, review, and logs) without page reloads.
- **Development Helpers**
  - **VS Code**: Our code editor of choice, rich ecosystem of extensions, great support for JavaScript/TypeScript and Git.
  - **Lovable.dev**: Used to quickly scaffold front-end components and standardize project setup.
  - **Claude Code**: AI assistant in the terminal to help with code understanding, refactoring, and documentation as we build the UI.

How it enhances the user experience:
- Fast, responsive interface that feels snappy even on modest hardware.
- Clear separation of components and styles keeps the UI consistent and easy to update.
- Type checks reduce runtime errors, so users see fewer bugs.

## 2. Backend Technologies

The backend powers all the heavy lifting: interpreting declarations, talking to Proxmox, and storing logs.

- **Node.js**
  - Why: A lightweight, event-driven environment that runs JavaScript on the server. Fits well with our frontend language choice.
- **Express**
  - Why: A minimal web framework for Node.js that makes it easy to define API endpoints and middleware for authentication, logging, and error handling.
- **PostgreSQL**
  - Why: A reliable, open-source relational database used to store detailed reconciliation logs, API request/response data, and user metadata.
- **Knex (query builder & migrations)**
  - Why: Helps manage database schema changes over time and write queries in a consistent, safe way without locking us into a heavy ORM.
- **Proxmox REST API (v8.4.1)**
  - Why: The official API for managing VMs, storage, and networking on Proxmox. We interact with it directly to create or modify cluster components.
- **LLM Abstraction Layer**
  - Why: Lets us switch between public LLMs (OpenAI, Claude) or a locally hosted model without changing core business logic.
- **Local File Storage for Secrets**
  - Why: Stores Proxmox credentials and LLM API keys in configuration files inside the Agent container. Simple, secure (with proper file permissions), and easy to update.

How it supports functionality:
- Incoming HTTP requests from the UI are parsed by Express, forwarded to the reconciliation engine, and results are returned in real time.
- PostgreSQL keeps a complete history of every action so you can audit what changed and when.

## 3. Infrastructure and Deployment

We chose a containerized approach on Proxmox itself to keep everything close to your servers.

- **Proxmox LXC Containers**
  - UI Container: Hosts the React app and serves it over HTTPS.
  - Agent Container: Runs the Node.js process, polls GitHub, and executes reconciliation against the Proxmox API.
- **GitHub (Version Control & CI/CD)**
  - Why: Source control for both our codebase and the user’s cluster declarations. We leverage GitHub Actions to:
    - Run automated tests on each commit
    - Lint and type-check code
    - (Optional) Build and push updated container images to a private registry
- **Process Management (PM2 or systemd)**
  - Why: Ensures the backend Agent restarts automatically on failure or system reboot.

How it increases reliability and scalability:
- Containers isolate UI and Agent so they don’t interfere with each other.
- GitHub Actions enforce quality checks before code or config changes reach your homelab.
- Process managers keep services running 24/7 without manual intervention.

## 4. Third-Party Integrations

Our goal is to minimize dependencies while giving you flexibility.

- **GitHub API**
  - For pushing and pulling cluster declaration documents and using the commit history as an audit trail.
- **OpenAI / Claude APIs**
  - For natural-language understanding and plan generation in the UI and backend.
- **Local LLM Hosting**
  - For users who prefer to run an LLM on-premises, avoiding API costs and external dependencies.
- **Proxmox REST API**
  - Direct integration for applying changes to your VMs, storage pools, and networks.

Benefits:
- You can switch LLM providers or add new ones without changing your cluster setup.
- GitHub handles document versioning so you never lose track of past declarations.

## 5. Security and Performance Considerations

We take both security and speed seriously to ensure a smooth, trustworthy experience.

Security Measures:
- **Role-Based Access Control**
  - Admins vs. Users: Admins can approve and apply changes; Users can draft and preview only.
- **File Permissions**
  - Secrets files (Proxmox credentials, API keys) are stored with restrictive filesystem permissions (e.g., `chmod 600`).
- **HTTPS Everywhere**
  - UI served over HTTPS; backend API endpoints require TLS to protect data in transit.
- **Database Encryption**
  - PostgreSQL can be configured to encrypt data at rest (optional) and uses SSL for connections.

Performance Optimizations:
- **API Call Batching & Retry Logic**
  - Group related Proxmox calls when possible; automatically retry transient errors up to 3 times.
- **Caching LLM Responses (short-term)**
  - Avoids repeat calls for identical inputs during a session to speed up the preview step.
- **Frontend Code Splitting**
  - Loads only the code needed for each screen, reducing initial load times in the browser.

## 6. Conclusion and Overall Tech Stack Summary

MycoPod’s technology choices were guided by three core goals: **simplicity**, **transparency**, and **maintainability**. Here’s a quick recap:

- Frontend: React + TypeScript + Vite + CSS Modules for a fast, clear, and easy-to-update UI.
- Backend: Node.js + Express + PostgreSQL + Knex for a reliable reconciliation engine and audit log.
- Infrastructure: Proxmox LXC containers for deployment, GitHub for version control and CI/CD, and process managers for uptime.
- Integrations: Proxmox REST API for cluster changes, GitHub API for document versioning, flexibly pluggable LLM providers (OpenAI, Claude, or local).
- Security & Performance: Role-based access, encrypted secrets, HTTPS, retry logic, and code splitting.

Unique Aspects:
- **Natural-Language Declarations in Git:** Your infrastructure plans live side by side with your code, all in plain English.
- **Containerized Homelab Deployment:** Runs entirely within your Proxmox cluster—no external hosting required.
- **LLM Flexibility:** Swap between public APIs or private models without rewriting core logic.

Together, these technologies ensure MycoPod remains a powerful yet approachable tool for homelab owners managing 2–10 servers, lowering the barrier to everyday infrastructure automation.