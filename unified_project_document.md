# Unified Project Documentation

## Project Requirements Document

### 1. Project Overview

MycoPod is an AI-powered agent for homelab owners who run 2–10 servers in a rack. Instead of clicking through multiple screens or writing complex scripts, you simply write what you want in plain English—like “Create three Ubuntu VMs for a Kubernetes cluster and mount an NFS share”—and MycoPod will show you exactly what steps it plans to take before applying them to your Proxmox cluster. This approach cuts down on manual work, reduces human error, and gives you a clear audit trail of every change.

The main objectives are to make homelab management easy and transparent. We want users to declare their desired state naturally, review a clear plan of action, then let the system reconcile that plan with Proxmox 8.4.1—much like Terraform but with the power of a language model. Success means faster setups, fewer misconfigurations, and instant feedback on what happened in the cluster.

### 2. In-Scope vs. Out-of-Scope

**In-Scope (v1)**

*   Natural-language cluster declarations stored as versioned documents in a GitHub repository
*   Web UI for typing declarations, previewing interpreted plans, and committing changes
*   Confirmation step that shows detailed, step-by-step actions before applying anything
*   Automated reconciliation engine that applies declared state to Proxmox 8.4.1 via its REST API
*   Role-based access control with Admin and User roles (Admins can approve and apply commits; Users can draft and preview, but need Admin approval)
*   Local file configuration for Proxmox credentials and LLM API keys
*   Execution logs and reconciliation results stored in PostgreSQL
*   Containerized deployment using separate LXC containers for UI and the Agent

**Out-of-Scope (Phase 1)**

*   Real-time notifications via email, Slack, or other channels
*   Native mobile app or mobile-specific interfaces
*   External secret vault integrations (e.g., Vault, AWS Secrets Manager)
*   Ceph orchestration beyond assuming it’s already installed
*   Commercial licensing, multi-tenant SaaS features, or public releases

### 3. User Flow

When someone visits MycoPod’s web UI, they land on a clean, light-mode login page. After entering their username and password, the system checks if they are an Admin or a User. Admins go to a full dashboard where they can see pending declarations, approve them, or apply changes right away. Users land in draft mode where they can type and preview declarations but must wait for an Admin to finalize them.

In draft mode, users type an English description of the cluster state they want—like adding VMs, installing Kubernetes, or setting up NFS. When they hit “Preview,” the LLM-powered backend interprets the text and shows a detailed plan listing each Proxmox API call. If everyone agrees, clicking “Commit” pushes the declaration to GitHub. The Agent then picks it up, talks to Proxmox, and logs each step in the database. The UI updates automatically to show success or failure messages for every action.

### 4. Core Features

*   **Natural-Language Declarations**\
    Capture desired cluster state as English documents in GitHub for versioning.
*   **Interactive Plan Preview**\
    Use an LLM to parse input, generate a technical action plan, and let users confirm before anything runs.
*   **GitHub Integration**\
    Push declarations to a GitHub repo as the single source of truth, using its history and diff features.
*   **Automated Reconciliation Engine**\
    Poll GitHub for new commits, compare declared vs. actual state, and sync via Proxmox API calls.
*   **Role-Based Access Control**\
    Admins can approve and apply changes; Users can draft and preview and must get Admin sign-off.
*   **Local Configuration for Secrets**\
    Store Proxmox credentials and LLM keys in files inside the Agent container.
*   **Execution Logging & Audit Trail**\
    Log every API call and outcome in PostgreSQL; show detailed requests and responses in the UI.
*   **Containerized Deployment**\
    Run UI and Agent in separate Proxmox LXC containers for easy isolation and scaling.

### 5. Tech Stack & Tools

*   **Frontend**: React with TypeScript, functional components, hooks
*   **Backend**: Node.js with Express framework
*   **Database**: PostgreSQL for execution logs and reconciliation results
*   **Proxmox Integration**: Official REST API for Proxmox 8.4.1
*   **LLM Support**: Abstracted layer for OpenAI, Claude, or a local model
*   **Version Control**: GitHub for declarations repository
*   **Containers**: Proxmox LXC for both UI and Agent
*   **Development Tools**: VS Code, Claude Code in-terminal AI assistant, Lovable.dev for scaffolding

### 6. Non-Functional Requirements

*   **Performance**: Plan previews should return within 2–3 seconds; API calls under 1 second latency if possible.
*   **Reliability**: Ensure idempotent operations and retry logic (up to 3 attempts) for transient API errors.
*   **Security**: Store credentials with filesystem permissions set to owner-only (600); encrypt database at rest using AES.
*   **Usability**: Light-mode UI with neutral colors, clear navigation, legible sans-serif fonts; responsive layout for smaller screens.

### 7. Constraints & Assumptions

*   Proxmox version is fixed at 8.4.1; future upgrades may need API adjustments.
*   Ceph and NFS are pre-installed in the cluster; no need to bootstrap them in v1.
*   Kubernetes installer logic must be part of the Agent.
*   LLM provider choice (public vs. local) may impact latency and cost.
*   GitHub and Proxmox must be reachable from the Agent container.
*   Homelab network may have variable latency; retry logic is essential.

### 8. Known Issues & Potential Pitfalls

*   **LLM Misinterpretation**: The model might misunderstand user intents.\
    *Mitigation*: Always show a clear summary of planned actions and require explicit confirmation.
*   **Proxmox API Errors**: Rate limits or version mismatches could cause failures.\
    *Mitigation*: Use exponential backoff, display clear error messages, and allow manual rollback.
*   **GitHub Sync Delays**: Slow network could delay polling results.\
    *Mitigation*: Make the poll interval configurable and add a manual “Refresh” button.
*   **Database Migrations**: Future schema changes might need careful migration.\
    *Mitigation*: Adopt a migration tool (Knex or Sequelize) from the start.
*   **Credential Exposure**: Storing secrets in files is a risk if the container is compromised.\
    *Mitigation*: Enforce strict file permissions and plan for an external vault in later versions.

## App Flow Document

### Onboarding and Sign-In/Sign-Up

New users arrive at a simple login page hosted in its own LXC container. They enter their username and password to sign in. If they forget their password, they can click “Forgot Password,” receive a reset link via email, and set a new password. Signing out is just one click away in the top-right corner of every page. We support traditional email/password login but could add OAuth down the road if needed.

### Main Dashboard or Home Page

Once logged in, Admins see a dashboard with pending declarations, approval buttons, and a sidebar to navigate to settings or logs. Users see an editor pane in the center where they write cluster declarations and a sidebar showing past drafts. Both roles have a top navigation bar with links to “Home,” “Drafts,” “Logs,” and “Settings.” The layout is clean and minimal, ensuring the main focus is always on the declaration editor or the status panel.

### Detailed Feature Flows and Page Transitions

When a User types a natural-language declaration and clicks “Preview,” the UI transitions to a detailed plan page. This page lays out each step—like “Create VM 01 using Ubuntu 22.04 template” or “Install kubeadm.” Users can click “Back” to edit or “Commit” to finalize. If a User hits “Commit,” the declaration is pushed to GitHub and marked pending. Admins get a notification in their dashboard and can click “Approve and Apply” to trigger the Agent. After the Agent runs, the UI automatically moves to a live status page that streams each step’s result in real time. Admins and Users can click on any entry to view API request and response logs.

### Settings and Account Management

In the Settings page, users upload Proxmox credentials and their LLM API key files. They can also view and update their personal profile (username, email). Admins see an additional section to configure polling intervals or switch LLM providers. After saving settings, users click “Back to Dashboard” or use the sidebar to return to the main flow.

### Error States and Alternate Paths

If the user submits invalid English text or the LLM fails, the UI shows a clear error banner with a suggestion to rephrase. If Proxmox API calls time out or return errors, the status page marks that step in red and includes the exact API error message and code. In case of network loss during reconciliation, the Agent retries automatically and marks steps as “Retrying.” Users can refresh the page or wait for the Agent to recover and continue.

### Conclusion and Overall App Journey

From signing in to seeing the final confirmation of your homelab changes, MycoPod guides you through writing plain-English declarations, reviewing a technical plan, and watching the reconciliation progress. At every step, you’re in control—editing your draft, approving as an Admin, or inspecting detailed logs—until your Proxmox cluster matches exactly what you declared.

## Tech Stack Document

### Frontend Technologies

*   React with TypeScript: Provides strong typing and component-based development for clear, maintainable UI code.
*   React Router: Manages navigation and page transitions in a single-page application.
*   CSS Modules or Styled Components: Encapsulates styles at the component level, keeping CSS predictable and conflict-free.
*   Fetch API / Axios: Handles communication with the backend for declarations, logs, and settings.

### Backend Technologies

*   Node.js with Express: Lightweight server framework that exposes REST endpoints for declarations, reconciliation status, and settings.
*   PostgreSQL: Stores detailed logs and reconciliation results for auditing.
*   Octokit (GitHub API client): Pushes and polls declarations in the GitHub repository.
*   Proxmox REST API Wrapper: Custom module that handles authentication and calls to Proxmox 8.4.1.

### Infrastructure and Deployment

*   Proxmox LXC Containers: Isolates the frontend UI and backend Agent for easy resource management and scaling.
*   Docker (for local development): Ensures consistent environments for developers.
*   GitHub Actions: Automates tests and linting on every commit for code quality and reliability.
*   Git for version control and deployment scripts: Manages code and declaration history.

### Third-Party Integrations

*   GitHub: Source of truth for cluster declarations, using its version history and pull requests if needed.
*   OpenAI/Claude or Local LLM Models: Provides natural-language understanding with a swap-out abstraction layer.
*   Proxmox API: Drives actual changes in the homelab cluster via REST calls.

### Security and Performance Considerations

*   Authentication: JSON Web Tokens (JWT) for secure session management.
*   Secrets Management: Store Proxmox and LLM credentials in files with strict permissions (600).
*   Input Validation: Sanitize user inputs to prevent injection attacks.
*   Caching & Debounce: Debounce user typing in the editor and cache recent previews to improve responsiveness.

### Conclusion and Overall Tech Stack Summary

We chose a clean, well-supported stack—React/TypeScript on the front, Node.js/Express on the back, and PostgreSQL for logs—to ensure maintainability, performance, and ease of onboarding. Containerizing everything in Proxmox LXC aligns with our homelab use case, and leveraging GitHub plus popular LLM APIs means we can swap components or scale without major rewrites.

## Frontend Guidelines Document

### Frontend Architecture

The UI is built as a single-page React application using functional components and hooks. Components are organized by feature—like `DeclarationEditor`, `PlanPreview`, `StatusDashboard`, and `SettingsPanel`. This modular approach makes it easy to add new features (for example, Ceph orchestration) without touching unrelated code.

### Design Principles

We follow four key principles:

*   Usability: Keep interactions simple and intuitive—big buttons, clear labels, and instant feedback.
*   Accessibility: Use semantic HTML, ARIA labels, and high-contrast text to support all users.
*   Responsiveness: Layout adjusts gracefully from desktop to smaller windows, ensuring the editor and logs remain readable.
*   Consistency: Stick to a neutral color palette and a single sans-serif font family across all pages.

### Styling and Theming

We use CSS Modules to scope styles at the component level, avoiding global conflicts. The theme is light mode only, with neutral grays (#f5f5f5 backgrounds, #333 text) and a single accent color (soft blue #4a90e2). Fonts use a system sans-serif stack for fast load times and readability. Future theming could be added by updating CSS custom properties.

### Component Structure

Files live under `src/components` and are grouped by feature folder. Each component folder contains:

*   `ComponentName.tsx` for the React code
*   `ComponentName.module.css` for scoped styles
*   `ComponentName.test.tsx` for unit tests\
    This structure encourages reuse—for example, buttons, cards, and form fields live under a shared `ui` folder.

### State Management

Global state (user session, theme settings, and current declaration) is managed with React Context and the `useReducer` hook. Local UI states (form inputs, loading flags) use `useState`. This light-weight approach avoids the overhead of Redux while keeping code clear and predictable.

### Routing and Navigation

We use React Router to define these main routes:

*   `/login` for authentication
*   `/dashboard` for the Admin overview
*   `/draft` for drafting and previewing declarations
*   `/status/:id` for viewing reconciliation logs
*   `/settings` for account and credentials management\
    Navigation links in the sidebar and top bar update the URL without a full page reload.

### Performance Optimization

We split code by route using `React.lazy` and `Suspense` so that large components like the status log viewer only load when needed. We debounce the declaration editor input to avoid excessive LLM calls. Images, if any, are optimized and served from a CDN or compressed locally.

### Testing and Quality Assurance

Unit tests are written with Jest and React Testing Library, focusing on component rendering and user interactions. We use Cypress for end-to-end tests that simulate writing a declaration, previewing it, and viewing logs. Pull requests run GitHub Actions pipelines to ensure coverage and linting standards are met.

### Conclusion and Overall Frontend Summary

This frontend setup balances simplicity with scalability. By using React, TypeScript, CSS Modules, and a clear folder structure, we ensure the UI is easy to understand, extend, and maintain. Performance optimizations and testing safeguards help deliver a smooth user experience aligned with MycoPod’s goals.

## Implementation Plan

*   Initialize GitHub repositories: one for code and one for declarations.
*   Scaffold frontend project with React, TypeScript, and folder structure.
*   Scaffold backend project with Node.js, Express, and basic routing.
*   Set up PostgreSQL database and migration tool (Knex or Sequelize).
*   Implement user authentication (JWT) and role-based access control.
*   Build the DeclarationEditor component and API endpoint for parsing text.
*   Integrate LLM abstraction layer and connect to a public or local model.
*   Create PlanPreview page that displays the LLM’s interpreted plan.
*   Develop GitHub integration module to push/poll declaration documents.
*   Build the reconciliation Agent: poll GitHub, call Proxmox API, log results.
*   Develop StatusDashboard component to stream reconciliation results.
*   Create SettingsPanel to upload and manage credential files.
*   Add error handling, retry logic, and fallback UI for API failures.
*   Write unit tests (Jest) and E2E tests (Cypress) for critical flows.
*   Set up GitHub Actions for linting, testing, and deployment checks.
*   Containerize UI and Agent in Proxmox LXC, test in a homelab environment.
*   Conduct user testing, collect feedback, and iterate on UI/UX.
*   Finalize documentation and hand off to operations for private rollout.

This plan provides clear, step-by-step guidance to move from an empty repository to a fully functional MycoPod system.
