# Horizontal Scaling Lab

A minimal boilerplate to understand **horizontal scaling**, **stateless services**, and **load balancing** — running entirely on your laptop using Docker Compose.

---

## What You'll Learn

- How to run multiple identical containers of the same app simultaneously
- How NGINX distributes traffic across containers (Round Robin)
- Why stateless services are essential for horizontal scaling
- How Docker's internal DNS enables service discovery

---

## Project Structure

```
scaling/
├── app/
│   ├── server.js        # Node.js/Express API — returns hostname + request info
│   ├── package.json
│   ├── Dockerfile       # Multi-stage Alpine build
│   └── .dockerignore
├── nginx/
│   └── nginx.conf       # Load balancer config (Round Robin upstream)
├── docker-compose.yml   # Spins up web × N + NGINX
└── README.md
```

---

## Quick Start

### 1. Start 3 containers + load balancer

```bash
docker compose up --scale web=3 --build
```

### 2. Open in browser

```
http://localhost:8080
```

Refresh the page a few times — the **hostname changes** on each request. That's NGINX round-robining across your 3 containers.

### 3. Test via terminal

```bash
# PowerShell
1..6 | ForEach-Object { Invoke-RestMethod http://localhost:8080/api/info | Select-Object hostname, requestCount }

# bash / curl
for i in {1..6}; do curl -s http://localhost:8080/api/info | python3 -m json.tool; done
```

### 4. Scale up or down (no restart needed)

```bash
docker compose up --scale web=5 --no-recreate   # scale up
docker compose up --scale web=2 --no-recreate   # scale down
```

### 5. Tear down

```bash
docker compose down
```

---

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Browser UI showing which container responded |
| `GET /api/info` | JSON with hostname, IP, request count, uptime |
| `GET /health` | Health check (`{ status: "healthy" }`) |
| `GET /nginx-status` | NGINX connection stats |

---

## How It Works

```
Browser → http://localhost:8080
               │
           [NGINX :80]          ← single entry point
          /     |     \
       web_1  web_2  web_3      ← identical stateless containers
       :3000  :3000  :3000
```

- **NGINX** resolves the `web` hostname to all container IPs (Docker DNS) and round-robins requests across them.
- Each **web** container is identical and stateless — any container can handle any request.
- Containers are **not exposed directly**; only NGINX port `8080` is mapped to the host.

---

## Experimenting with Load Balancing Strategies

Edit `nginx/nginx.conf` inside the `upstream web_pool` block:

```nginx
upstream web_pool {
    # Round Robin (default) — requests cycle evenly across all instances
    server web:3000;

    # Least Connections — sends to the instance with fewest active connections
    # least_conn;
    # server web:3000;

    # IP Hash — same client always hits the same instance (sticky sessions)
    # ip_hash;
    # server web:3000;
}
```

Then apply:

```bash
docker compose restart nginx
```

---

## Key Concepts

| Concept | This Lab |
|---------|----------|
| Horizontal scaling | `--scale web=N` creates N containers |
| Stateless service | Each container is identical; no shared memory |
| Load balancer | NGINX distributes requests via Round Robin |
| Service discovery | Docker resolves `web` hostname to all container IPs |
| Health check | `GET /health` endpoint per container |
