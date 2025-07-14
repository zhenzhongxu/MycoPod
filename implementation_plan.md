# Implementation plan

## Phase 1: Environment Setup

1. Step 1: Prevalidation – In the project root, run `git status` to verify you are inside a Git repository; if not, initialize one with `git init` (Project Summary).
2. Step 2: Check Node.js version – Run `node -v`; if it is not v20.2.1, install Node.js v20.2.1 (Tech Stack: Backend).
   Validation: `node -v` should output `v20.2.1`.
3. Step 3: Install PostgreSQL 15.3 locally or via Docker: `docker run --name mycopod-db -e POSTGRES_PASSWORD=secret -d postgres:15.3` (Tech Stack: Database).
   Validation: `docker ps` shows `postgres:15.3` container.
4. Step 4: Create a `.env` file at project root with placeholders:
   ```
   DATABASE_URL=postgresql://postgres:secret@localhost:5432/mycopod
   PROXMOX_API_URL=
   PROXMOX_API_TOKEN=
   LLM_API_KEY=
   ```
   (Key Requirements: Security).
5. Step 5: Restrict `.env` permissions to owner only: `chmod 600 .env` (Key Requirements: Security).
6. Step 6: Install VS Code recommended extensions: ESLint, Prettier, TypeScript, Docker (Tools).
7. Step 7: Create root directories:
   - `/frontend`
   - `/backend`
   - `/infra`
   - `/docs`
   (Project Summary).

## Phase 2: Frontend Development

8. Step 8: Initialize Vite React + TypeScript project in `/frontend`: `npm create vite@latest . -- --template react-ts` (Tech Stack: Frontend).
   Validation: `/frontend/package.json` lists `react` and `typescript`.
9. Step 9: Install dependencies in `/frontend`: `npm install react-router-dom css-modules axios` (Tech Stack: Frontend).
10. Step 10: In `/frontend/vite.config.ts`, enable CSS Modules by adding `css: { modules: true }` (Tech Stack: Frontend).
11. Step 11: Create React Router setup in `/frontend/src/App.tsx` with routes for `/login`, `/dashboard`, `/declarations`, `/audit` (Use Case Walkthrough).
12. Step 12: Create `/frontend/src/pages/Login.tsx` with email/password form using controlled inputs (Key Requirements: UI).
    Validation: `npm run dev` and navigate to `http://localhost:3000/login` to see the form.
13. Step 13: Create `/frontend/src/pages/Dashboard.tsx` with navigation to Declaration and Audit pages (Use Case Walkthrough).
14. Step 14: Create `/frontend/src/components/DeclarationInput.tsx` with a textarea for natural language declarations and a `Submit` button (Use Case Walkthrough).
15. Step 15: Create `/frontend/src/components/ConfirmationModal.tsx` to display parsed intent and `Confirm`/`Cancel` buttons (Use Case Walkthrough).
16. Step 16: Create `/frontend/src/components/AuditTrail.tsx` that fetches `/api/v1/audit` and displays reconciliation logs in a table (Key Requirements: Audit trail).
17. Step 17: Implement role-based UI guard in `/frontend/src/utils/auth.ts` reading user role from JWT; show/hide `Confirm` button for `User` vs `Admin` (Key Requirements: User Roles).
18. Step 18: Add API service in `/frontend/src/services/api.ts` with Axios base URL `http://localhost:4000/api/v1` (App Flow: Step 1).
    Validation: Call `GET /api/v1/ping` on load and print console log `pong`.

## Phase 3: Backend Development

19. Step 19: Initialize Node.js Express project in `/backend`: `npm init -y` then `npm install express pg dotenv cors jsonwebtoken proxmox-api-client openai` (Tech Stack: Backend).
20. Step 20: Create `/backend/src/server.ts`, load `dotenv.config()`, initialize Express on port 4000 with JSON body parser and CORS for `http://localhost:3000` (Tech Stack: Backend).
21. Step 21: In `/backend/src/db.ts`, configure `pg.Pool` using `DATABASE_URL` from `.env` (Tech Stack: Database).
22. Step 22: Create database schema DDL in `/infra/schema.sql` for tables:
    - `users(id UUID PRIMARY KEY, email TEXT UNIQUE, password_hash TEXT, role TEXT)`
    - `declarations(id SERIAL, user_id UUID, content TEXT, created_at TIMESTAMP)`
    - `reconciliations(id SERIAL, declaration_id INT, status TEXT, details JSONB, timestamp TIMESTAMP)`
    (Key Requirements: Audit trail & Role-based access).
23. Step 23: Apply schema: `docker exec -i mycopod-db psql -U postgres -d postgres < infra/schema.sql` (Tech Stack: Database).
    Validation: Query `SELECT * FROM declarations;` returns empty result.
24. Step 24: Implement `/backend/src/routes/auth.ts`:
    - `POST /api/v1/login` to verify user, issue JWT with `role` claim.
    - `POST /api/v1/register` for admin to create users.
    Validation: `curl -X POST http://localhost:4000/api/v1/login` returns token.
25. Step 25: Implement `/backend/src/routes/declarations.ts`:
    - `POST /api/v1/declarations` to insert new declaration and enqueue for review.
    - `GET /api/v1/declarations` to fetch history.
    Validation: Insert a sample declaration via `curl` and query `declarations` table.
26. Step 26: Implement `/backend/src/services/llm.ts` abstraction with functions `parseIntent(content)` and `reconcile(intent)` using OpenAI or local LLM depending on `.env` (Project Summary: LLM integration).
27. Step 27: Implement reconciliation engine in `/backend/src/reconcile.ts`:
    - Load latest declarations, compare with actual Proxmox state via `proxmox-api-client`, apply diffs.
    - Insert reconciliation logs into `reconciliations` table.
    Validation: Run `node src/reconcile.ts` with a test VM declaration and verify VM created in Proxmox 8.4.1.
28. Step 28: Create `/backend/src/routes/audit.ts`:
    - `GET /api/v1/audit` returns reconciliation logs with status and details (Use Case Walkthrough).
    Validation: `curl http://localhost:4000/api/v1/audit` returns JSON array.

## Phase 4: Integration

29. Step 29: In `/frontend/vite.config.ts`, add `server.proxy` for `/api` to `http://localhost:4000` (Tech Stack: Frontend).
    Validation: Frontend calls to `/api/v1/...` succeed with no CORS errors.
30. Step 30: Ensure JWT from login is attached to all Axios requests via interceptor in `/frontend/src/services/api.ts` (Key Requirements: Security).
31. Step 31: In `/backend/src/server.ts`, register routes from `auth.ts`, `declarations.ts`, `audit.ts`, and secure endpoints using JWT middleware checking `role` claim (Key Requirements: User Roles).
    Validation: A `User` token cannot POST `/api/v1/declarations` without `Admin` approval flag.

## Phase 5: Deployment

32. Step 32: Create `/infra/Dockerfile.frontend`:
    ```dockerfile
    FROM node:20.2.1
    WORKDIR /app
    COPY frontend/package*.json ./
    RUN npm install
    COPY frontend/. .
    RUN npm run build
    CMD ["npx", "serve", "-s", "dist"]
    ```
    (Key Requirements: Containerization).
33. Step 33: Create `/infra/Dockerfile.backend`:
    ```dockerfile
    FROM node:20.2.1
    WORKDIR /app
    COPY backend/package*.json ./
    RUN npm install
    COPY backend/. .
    CMD ["node", "src/server.js"]
    ```
34. Step 34: Build and push images to local registry: `docker build -f infra/Dockerfile.frontend -t mycopod-ui:latest .` and similarly for backend (Containerization).
    Validation: `docker images | grep mycopod-` shows both images.
35. Step 35: In Proxmox 8.4.1, create two LXC containers via UI or `pvesh`:
    - CTID 101: `mycopod-ui`, resources: 1CPU, 1GB RAM
    - CTID 102: `mycopod-agent`, resources: 2CPU, 2GB RAM
    (Target Environment).
36. Step 36: In each LXC, install Docker, pull respective images `mycopod-ui:latest` and `mycopod-agent:latest`, and run services (Deployment).
    Validation: Access UI at `http://<ct101-ip>:80` and backend at `http://<ct102-ip>:4000/ping`.
37. Step 37: Configure Proxmox firewall to allow ports 80 and 4000 only from trusted networks (Key Requirements: Security).
38. Step 38: Commit all infra changes (`schema.sql`, `Dockerfile.*`) to GitHub in `main` branch (Version Control).
39. Step 39: Document deployment steps and environment variables in `/docs/DEPLOYMENT.md` (Docs).
40. Step 40: Final validation – Execute end-to-end scenario:
   1. Login as Admin
   2. Submit a declaration
   3. Confirm intent
   4. Verify VM created in Proxmox
   5. Check audit log in UI
   (Use Case Walkthrough)

*End of Implementation plan.*