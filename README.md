# MycoPod

MycoPod is an AI-assisted tool for managing Proxmox clusters. The repository contains a React frontend and an Express backend written in TypeScript.

## Prerequisites
- Node.js 20.2.1
- Docker (for optional container builds)

Create a `.env` file in the project root with at least `DATABASE_URL` and other secrets as shown in the implementation plan. Keep this file private.

## Local Development
### Frontend
```bash
cd frontend
npm install
npm run dev
```
The app will be available at `http://localhost:3000`.

### Backend
```bash
cd backend
npm install
npm run dev
```
The API listens on `http://localhost:4000`.

### Testing
Build the frontend and run the server to verify everything compiles:
```bash
cd frontend && npm run build
cd ../backend && npm run dev
```
You can then call `curl http://localhost:4000/api/v1/ping` and expect `{"status":"ok"}`.

## Docker Deployment
Images can be built from the provided Dockerfiles.
```bash
# from repository root
docker build -f infra/Dockerfile.frontend -t mycopod-ui:latest .
docker build -f infra/Dockerfile.backend -t mycopod-agent:latest .
```
Run them locally or in Proxmox LXC containers:
```bash
docker run -p 3000:80 mycopod-ui:latest
# backend requires .env mounted for DATABASE_URL and tokens
docker run -p 4000:4000 --env-file .env mycopod-agent:latest
```

These commands align with the deployment steps in the documentation.
