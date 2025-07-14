# MycoPod Project Requirements Document

## 1. Project Overview

MycoPod is an AI-driven agent that lets homelab owners manage their Proxmox clusters using plain English. Instead of writing scripts or clicking through multiple UIs, you simply describe your desired cluster state (“Create three Ubuntu VMs for Kubernetes, set up NFS share,” etc.). MycoPod reads your instructions, shows you exactly what it plans to do, and then applies those changes to Proxmox—much like Terraform but powered by a large language model (LLM).

We’re building MycoPod to simplify homelab operations for users with 2–10 servers. Key objectives are:

*   **Ease of use:** Let users declare infrastructure in everyday language.
*   **Safety and transparency:** Provide a clear review step and detailed logs of every change.
*   **Reproducibility and auditability:** Store declarations in GitHub and track execution history in a local database. Success is measured by reduced manual effort, fewer misconfigurations, and fast, reliable feedback on cluster changes.

## 2. In-Scope vs. Out-of-Scope

**In-Scope (v1)**

*   Natural-language cluster declarations stored as versioned documents in a GitHub repo

*   Web UI for typing declarations, previewing interpreted plans, and committing changes

*   Confirmation step that shows detailed, step-by-step actions before applying

*   Automated reconciliation engine that applies declared state to Proxmox 8.4.1 via its API

*   Admin/User roles:

    *   **Admin**: review, approve, and directly apply declarations
    *   **User**: create and preview declarations; require Admin approval to apply

*   Local configuration for Proxmox credentials and LLM API keys (stored in files)

*   Execution logs and reconciliation results stored in a PostgreSQL database

*   Containerized deployment: separate LXC containers for the UI and the Agent

**Out-of-Scope (Phase 1)**

*   Real-time notifications via email, Slack, or other channels
*   Native mobile app or mobile-specific UI
*   Integration with external secret vaults (HashiCorp Vault, AWS Secrets Manager)
*   Ceph orchestration or advanced storage automation beyond NFS
*   Commercial licensing or multi-tenant SaaS features

## 3. User Flow

When a user visits MycoPod’s web UI (hosted in its own LXC on Proxmox), they see a clean, light-mode login screen. After entering credentials, the system checks their role. Admin users go straight to a full dashboard where they can review pending declarations, approve them, or apply changes immediately. Regular Users see a read-only or “draft” mode: they can write and preview declarations but must wait for an Admin to commit them.

In draft mode, the user types a free-form English description of the desired infrastructure (for example: “Provision three Ubuntu VMs for a Kubernetes cluster and mount an NFS share on the main storage pool”). Clicking “Preview” shows a structured plan—each step mapped to Proxmox API calls. Once both Admin and User are happy, they click “Commit.” MycoPod pushes the declaration to GitHub, then the Agent picks it up, runs the reconciliation, and writes detailed outcomes (successes and failures) back into the database. The UI automatically refreshes to show colored status badges and full logs for every action.

## 4. Core Features

*   **Natural-Language Declarations**\
    Store desired cluster state as English documents in GitHub.
*   **Interactive Plan Preview**\
    Parse user input with an LLM, generate a detailed action plan, and present it for user confirmation.
*   **Versioned GitHub Integration**\
    Push declarations to GitHub as the source of truth; leverage Git history and diff.
*   **Automated Reconciliation Engine**\
    Poll GitHub for new commits, compare declared vs. actual state, and apply Proxmox API calls to sync.
*   **Role-Based Access Control**\
    Admins: full commit/apply rights; Users: draft & preview only, require approval.
*   **Local Configuration for Secrets**\
    Upload Proxmox credentials and LLM keys via the settings panel; store as files in the Agent container.
*   **Execution Logging & Audit Trail**\
    Record every reconciliation step in PostgreSQL; surface logs in UI with API request/response details.
*   **Containerized Deployment**\
    Separate LXC containers for the frontend UI and backend Agent components.

## 5. Tech Stack & Tools

*   **Frontend**: React (functional components, hooks), TypeScript

*   **Backend**: Node.js with Express

*   **Database**: PostgreSQL (logs & reconciliation results)

*   **Proxmox Integration**: Proxmox API v8.4.1 via official REST endpoints

*   **LLM Support**:

    *   Public API (OpenAI, Claude) or self-hosted model
    *   Abstraction layer to swap providers without code changes

*   **Version Control**: GitHub (declarations repository)

*   **Containers**: Proxmox LXC for UI and Agent

*   **IDE & Extensions**: VS Code, Claude Code (in-terminal AI assistance), Lovable.dev (front-end scaffolding)

## 6. Non-Functional Requirements

*   **Performance**:

    *   Plan preview should return results within 2–3 seconds for typical declarations.
    *   Reconciliation steps should log each API call with latency under 1s (network permitting).

*   **Reliability**:

    *   Ensure idempotent operations—reapplying the same declaration twice yields no errors.
    *   Automatic retry logic for transient Proxmox API failures (up to 3 attempts).

*   **Security & Compliance**:

    *   Store credentials and LLM keys in local files with restrictive filesystem permissions (600).
    *   Encrypt database connection strings and at-rest data using industry-standard AES algorithms.

*   **Usability**:

    *   Simple, neutral color palette; clear navigation menu; legible sans-serif fonts.
    *   Mobile-responsive for small screens, though not a dedicated mobile app.

## 7. Constraints & Assumptions

*   Proxmox version is fixed at **8.4.1**; future API changes may require updates.
*   Ceph and NFS are already installed—no need to bootstrap storage backends in v1.
*   Kubernetes is not installed; Agent must handle Kubernetes installation steps.
*   LLM availability (public vs. local) may affect latency and cost.
*   GitHub must be reachable from the Agent container for polling and pushes.
*   Homelab networking can introduce variable latencies—retry logic is essential.

## 8. Known Issues & Potential Pitfalls

*   **LLM Misinterpretation**\
    Natural-language parsing errors could generate incorrect plans.\
    *Mitigation*: Explicit confirmation step and side-by-side plain-English plan review.
*   **Proxmox API Rate Limits/Errors**\
    Hitting rate limits or encountering version mismatches.\
    *Mitigation*: Exponential backoff, clear error messages, and documented rollback procedures.
*   **GitHub Sync Delays**\
    Network lag might delay declaration polling.\
    *Mitigation*: Poll interval configurable (default 30 s), manual “Refresh” button in UI.
*   **Database Schema Migrations**\
    Future schema changes for logs might require migrations.\
    *Mitigation*: Use a migration tool (e.g., Knex or Sequelize) from day one.
*   **Credential Exposure Risk**\
    Storing credentials in files could be a risk if host is compromised.\
    *Mitigation*: Restrict file permissions, document future integration with Vault as an upgrade path.

This PRD contains all the requirements and clarifications needed for subsequent technical documents—Tech Stack, Frontend Guidelines, Backend Structure, App Flow, and more—so the AI model can proceed without ambiguity.
