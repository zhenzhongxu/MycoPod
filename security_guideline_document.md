# MycoPod Implementation Plan & Security Guidelines

This document outlines the end-to-end implementation plan for MycoPod, an AI-driven Proxmox cluster management tool, along with actionable security guidelines derived from industry best practices.

---

## 1. Overview

- **Project Name:** MycoPod
- **Purpose:** Enable homelab owners to declaratively manage Proxmox clusters via natural-language prompts.
- **Audience:** Homelab administrators (2–10 servers)
- **Core Features:**
  - Store human-readable cluster state in GitHub
  - Natural-language UI with confirmation step
  - Automated reconciliation against Proxmox API
  - Pluggable LLM backend
  - Role-based access (Admin vs. User)

---

## 2. System Architecture

1. **Frontend (React + TypeScript)**
   - UI container in Proxmox LXC
   - Communicates with Backend via HTTPS
2. **Backend (Node.js + Express)**
   - API container in Proxmox LXC
   - Endpoints for declarations, reviews, commits
3. **Database (PostgreSQL)**
   - Stores reconciliation jobs, logs, user accounts
   - SSL/TLS enabled, optional at-rest encryption
4. **GitHub Repo**
   - Stores plain-English declarations
   - Webhook triggers reconciliation pipeline
5. **Proxmox API (v8.4.1)**
   - Securely accessed via service account credentials
6. **LLM Abstraction Layer**
   - Pluggable clients (OpenAI, Claude, local LLM)

Architecture Diagram (high-level):

    [React UI] ←HTTPS→ [Node/Express] ←→ [PostgreSQL]
                                   ↓
                         [GitHub Declaration Repo]
                                   ↓
                          [LLM & Reconciliation]
                                   ↓
                          [Proxmox API]

---

## 3. Component Breakdown

### 3.1 Frontend
- **Routing & State Management:** React Router + Context API
- **Input Forms:** Natural-language prompt box + preview panel
- **Review Step:** Display detailed action plan (diff view)
- **Authentication:** JWT stored in secure cookie (`HttpOnly`, `SameSite=Strict`)
- **Security Headers:** CSP, HSTS, X-Frame-Options, X-Content-Type-Options

### 3.2 Backend
- **Express Server:** Modular routers for auth, declarations, reconciliation
- **Authentication:** JWT with strong secret, `HS256` or `RS256`, short TTL, refresh tokens
- **Authorization:** RBAC middleware verifying `role` claim on each request
- **ORM:** TypeORM or Prisma with parameterized queries
- **LLM Service:** Strategy pattern for multiple providers
- **Proxmox Client:** Wrapped API calls with retry and error handling

### 3.3 Database
- **Schemas:** Users (id, role, password_hash), Jobs, Logs
- **Encryption:** SSL for client connections; use pgcrypto or built-in encryption for sensitive fields
- **Migrations:** Use migration tool (e.g., Flyway)

---

## 4. Data Flow & Reconciliation

1. User submits declaration via UI
2. Backend validates input (length, allowed characters)
3. Declaration committed to GitHub via secure webhook
4. LLM synthesizes a detailed action plan
5. Plan returned to UI for confirmation
6. On approval, backend:
   - Writes a commit to GitHub
   - Starts reconciliation job in DB
   - Invokes Proxmox API client to apply each action
   - Logs success/failure in DB and surfaces status to UI

---

## 5. Security Guidelines

### 5.1 Authentication & Access Control
- Enforce strong passwords (min 12 chars, complexity) & Argon2id hashing with unique salts
- Use JWTs with `exp`, `nbf`; store in `HttpOnly Secure` cookies
- Implement idle & absolute session timeouts
- RBAC: `Admin`, `User` roles enforced server-side for all endpoints
- Protect against brute-force: rate limit login attempts, implement account lockout

### 5.2 Input Handling & Output Encoding
- Validate and sanitize all inputs server-side using JOI or Yup
- Use ORM prepared statements; never concatenate user input in queries
- Sanitize HTML/JSON outputs; escape in React components
- Validate redirection targets against an allow-list
- Sanitize filenames and restrict upload directories (if file upload is added later)

### 5.3 Data Protection & Privacy
- Enforce TLS 1.2+ for all network traffic (frontend↔backend, backend↔Proxmox, DB connections)
- Store secrets in files with `chmod 600` *or* use a vault (HashiCorp Vault, AWS Secrets Manager)
- Do **not** commit API keys or credentials to GitHub
- Mask sensitive fields in logs and error messages
- Purge old secrets when rotated

### 5.4 API & Service Security
- Require authentication on all `/api/*` routes; default deny
- CORS: restrict origins to frontend URL only
- Implement rate limiting/throttling per IP or user
- Enforce correct HTTP verbs (GET/POST/PUT/DELETE)
- Version API (e.g., `/api/v1/...`)

### 5.5 Web Application Security Hygiene
- CSRF Protection: anti-CSRF tokens for state-changing operations
- Security headers via `helmet` middleware:
  - `Content-Security-Policy`
  - `Strict-Transport-Security` (HSTS)
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: no-referrer`
- Secure cookies: `SameSite=Strict`, `Secure`, `HttpOnly`

### 5.6 Infrastructure & Deployment
- Harden LXC containers: minimal OS, disable unused services, change default SSH port
- Limit container privileges (unprivileged containers)
- Use Proxmox firewall to open only necessary ports (443, 22)
- Disable Proxmox debug in production
- Automated backups of DB & Git repo; encrypt backups at rest

### 5.7 Dependency Management
- Pin dependencies via lockfiles (`package-lock.json`, `yarn.lock`)
- Integrate SCA tool (e.g., OWASP Dependency-Check, GitHub Dependabot)
- Update libraries routinely; test for regressions
- Audit code and dependencies quarterly

---

## 6. User Roles & Permissions

| Role  | Capabilities                                       |
|-------|----------------------------------------------------|
| Admin | Declare, review, commit, approve, full audit logs  |
| User  | Declare, review suggestions, submit for approval   |

- Enforce separation of duties: Users **cannot** directly apply changes.
- Admin approval workflow stored in DB with audit trail.

---

## 7. Logging & Monitoring

- Centralize logs (stdout → file → Logstash/Elasticsearch)
- Log levels: INFO for operations, WARN for recoverable issues, ERROR for failures
- Mask PII and secrets in logs
- Monitor reconciliation queue, API errors, login anomalies
- Alerts (email/Slack) on repeated failures or threshold breaches

---

## 8. CI/CD & Secret Management

- CI pipelines lint, test, and scan code (SAST) before merge
- CI/CD triggers Docker build → push to private registry → deploy to Proxmox via API
- Store secrets in CI environment variables or vault; never echo in logs

---

## 9. Next Steps

1. Define data models & DB schema
2. Scaffold frontend & backend repositories
3. Configure Proxmox LXC containers with minimal privileges
4. Implement authentication & RBAC first
5. Build declaration commit & webhook pipeline
6. Integrate LLM service abstraction
7. Develop reconciliation engine & Proxmox client
8. Perform security review & penetration testing

---

By following this structured plan and adhering to the outlined security guidelines, MycoPod will deliver a robust, user-friendly, and secure platform for homelab Proxmox cluster management.