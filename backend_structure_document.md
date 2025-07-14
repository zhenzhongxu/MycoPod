# Backend Structure Document for MycoPod

## 1. Backend Architecture

**Overview**

MycoPod’s backend is built with Node.js and Express, following a clear separation of concerns: controllers handle incoming requests, services orchestrate business logic, and repositories interact with the database. Adapters manage communication with external systems such as Proxmox, GitHub, and LLM providers.

**Key Design Patterns and Frameworks**

- MVC-inspired layering (Controllers → Services → Repositories)
- Express for routing and middleware
- Knex for query building and migrations
- Adapter pattern for external integrations (Proxmox API, GitHub API, LLM API)

**Scalability**

- Stateless service design allows horizontal scaling by spinning up multiple LXC containers on Proxmox
- Connection pooling with PostgreSQL to handle increased load
- Modular architecture makes it easy to add more integrations or features over time

**Maintainability**

- Clear folder structure (`controllers/`, `services/`, `repositories/`, `adapters/`)
- Knex migrations keep schema changes versioned and reversible
- Well-documented interfaces for each module

**Performance**

- Asynchronous, non-blocking I/O throughout Node.js services
- In-memory caching for frequent reads (e.g., cluster state snapshots)
- Indexes on critical database columns for fast lookups

---

## 2. Database Management

**Technology**

- PostgreSQL as the primary relational database
- Knex.js for query building, migrations, and seeding

**Data Storage & Access**

- Tables store users, roles, natural-language declarations, reconciliation runs, and action logs
- Connection pooling (via `pg` library) ensures efficient reuse of database connections

**Data Management Practices**

- Regular backups using `pg_dump`
- Migration scripts to evolve schema safely
- Read replicas can be added later for reporting or heavy read traffic
- Archiving old reconciliation logs after a configurable retention period

---

## 3. Database Schema

**Human-Readable Schema Summary**

1. **users**: stores login credentials, role assignment, and basic profile details
2. **roles**: defines Admin and User roles
3. **declarations**: stores the GitHub-backed natural-language cluster declarations
4. **reconciliation_runs**: tracks each reconciliation attempt (linked to a declaration)
5. **reconciliation_actions**: detailed per-step results for each run (success/failure, timestamps)
6. **settings**: optional table for system-wide configuration (e.g., default LLM provider)

**SQL Schema (PostgreSQL)**

```sql
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL  -- e.g. 'Admin', 'User'
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE declarations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  github_commit_sha VARCHAR(40) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE reconciliation_runs (
  id SERIAL PRIMARY KEY,
  declaration_id INTEGER NOT NULL REFERENCES declarations(id),
  requested_by INTEGER NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL,  -- e.g. 'Pending', 'InProgress', 'Succeeded', 'Failed'
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE reconciliation_actions (
  id SERIAL PRIMARY KEY,
  run_id INTEGER NOT NULL REFERENCES reconciliation_runs(id),
  action_description TEXT NOT NULL,
  result VARCHAR(20) NOT NULL,    -- e.g. 'Success', 'Error'
  message TEXT,                  -- detailed error or success info
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL
);
```  

---

## 4. API Design and Endpoints

MycoPod uses a RESTful API over HTTPS. JSON is the standard request/response format.

**Authentication & Authorization**

- JWT-based authentication (`/auth/login`, `/auth/refresh`)
- Middleware checks user role for protected routes

**Key Endpoints**

- **User Management**
  - `POST /auth/login` — obtain JWT access token
  - `GET /users` — list users (Admin only)
  - `POST /users` — create user (Admin only)

- **Declarations**
  - `GET /declarations` — fetch all declarations for this user
  - `POST /declarations` — submit a new natural-language declaration
  - `GET /declarations/:id` — fetch a single declaration and its summary

- **Reconciliation**
  - `POST /reconcile` — start a reconciliation run (Admin or approved User)
  - `GET /reconcile/:runId` — fetch status and action results of a specific run

- **Logs & History**
  - `GET /logs` — list reconciliation runs and statuses
  - `GET /logs/:runId/actions` — detailed action logs per run

- **Settings**
  - `GET /settings` — view system settings
  - `PUT /settings/:key` — update setting (Admin only)

Each route is handled in its controller, calls relevant services, then returns a clear JSON response with a `status` and `data` or `error` field.

---

## 5. Hosting Solutions

**Environment**

- Two dedicated LXC containers on a Proxmox cluster:
  1. **Frontend Container**: serves the React UI via Nginx
  2. **Agent Container**: runs the Node.js backend and Knex migrations

**Rationale**

- **Reliability**: Proxmox provides snapshotting and easy restores of LXC containers
- **Scalability**: spin up additional containers when load increases
- **Cost-Effectiveness**: utilizes existing homelab hardware without extra cloud fees

---

## 6. Infrastructure Components

- **Reverse Proxy / Load Balancer**: Nginx inside each container routes HTTP(S) and can distribute traffic if multiple backend instances are added
- **Caching**: in-memory caching for transient data (e.g., last cluster state). A lightweight Redis instance can be added later for distributed caching
- **Content Delivery**: static assets served by Nginx; public CDN not required since this is a private tool
- **Process Management**: PM2 or built-in systemd service ensures automatic restart of the Node.js agent
- **Backups**: scheduled `pg_dump` on the Proxmox host, stored on NFS or Ceph

---

## 7. Security Measures

- **Transport Security**: HTTPS/TLS enabled on Nginx with self-signed or CA-signed certificates
- **Authentication & Authorization**: JWT tokens, role-based access control (Admin vs. User)
- **Secrets Management**: Proxmox-mounted files with strict permissions store Proxmox API credentials and LLM API keys
- **Data Encryption**: PostgreSQL data directory encrypted at the disk level via LVM or Proxmox storage encryption
- **Rate Limiting & Input Validation**: Express middleware to throttle requests and sanitize all inputs to prevent injection attacks
- **Audit Logging**: every reconciliation action is logged with timestamp and user ID for compliance

---

## 8. Monitoring and Maintenance

- **Application Monitoring**: PM2 built-in metrics or integrate with Prometheus exporters
- **Log Aggregation**: rotate and store logs locally; future option to ship logs to a central ELK or Loki stack
- **Health Checks**: simple `/health` endpoint polled by a Proxmox scheduled script
- **Maintenance Strategy**:
  - Schedule off-peak maintenance windows for updates
  - Automated migrations via Knex on deploy
  - Regular review of reconciliation failure logs to detect systemic issues

---

## 9. Conclusion and Overall Backend Summary

MycoPod’s backend is designed to be robust, modular, and easy to manage in a private homelab setting. By leveraging Node.js, Express, and PostgreSQL within Proxmox LXC containers, the system achieves:

- **Scalability** through stateless services and container replication
- **Maintainability** with clear code structure, Knex migrations, and role-based access
- **Performance** via async I/O, indexing, and caching
- **Security** through TLS, JWT, encrypted storage, and strict secrets handling

This setup aligns with the project’s goals: giving homelab owners a simple, secure, and auditable way to declare and reconcile Proxmox cluster state using natural language. Any new integrations or scaling needs can be accommodated by adding containers, updating adapters, or expanding the database schema.

— End of Backend Structure Document —