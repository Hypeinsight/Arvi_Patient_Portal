# Arvi_Patient_Portal

Arvi health patient portal source code

## Local Setup Guide

This guide covers the `dev` branch.

### Stack

| Service | URL | Role |
|---|---|---|
| Frontend | `http://localhost:3000` | Patient intake UI (Next.js) |
| Backend API | `http://localhost:5000/api` | Flask REST API |
| Postgres | `localhost:5433` | App database (container: `intake_db`) |
| Redis | `localhost:6380` | Sessions / cache (container: `intake_redis`) |
| RedisInsight | `http://localhost:5540` | Redis GUI (optional) |

The frontend's API client defaults to `http://localhost:5000` when no env var is set, matching the backend's default — so wiring them together needs no extra config.

---

### Step 1 — Clone and check out `dev`

```bash
git clone https://github.com/Hypeinsight/Arvi_Patient_Portal.git
cd Arvi_Patient_Portal
git checkout dev
```

### Step 2 — Start Postgres + Redis

```bash
docker compose up -d
docker compose ps   # both should show "healthy"
```

### Step 3 — Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # PowerShell: .\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create `backend/.env`. **Don't copy `.env.example` as-is** — it predates the Docker setup and still points at the default Postgres port/credentials, which won't match the container. Use this instead:

```env
FLASK_APP=run.py
FLASK_ENV=development

# Must match docker-compose.yml, not the stale values in .env.example
DATABASE_URL=postgresql://postgre:root@localhost:5433/intake_db
REDIS_URL=redis://localhost:6380/0

SECRET_KEY=<any random string for local dev>
STORAGE_BUCKET=

# Currently unused (defined but never called) — leave blank
DOCTOR_API_URL=
DOCTOR_API_KEY=

# Required at startup — chat is wired in unconditionally, app won't boot without these
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_DEPLOYMENT=gpt-4o
```

Run migrations and start the server:

```bash
flask db upgrade
python app.py
```

API is live at `http://localhost:5000/api`.

> `requirements.txt` already has the full, correct package set (including `openai`/`pydantic` and their dependencies).

### Step 4 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:3000`. You don't need a `.env` file for local dev — the API client falls back to `http://localhost:5000` automatically. Only add one if you want to point at a different backend:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000/api
```

### Step 5 — Verify

- `http://localhost:3000` loads the intake flow.
- `http://localhost:5000/api/...` responds from Flask.
- `docker compose ps` shows both containers healthy.

---

### Inspecting chat sessions in RedisInsight

Chat state (system prompt, message history, turn count) is cached in Redis under `chat:<session_id>`, with a 2-hour TTL, so you can watch it live while testing the chat flow.

1. With `docker compose up -d` running, open `http://localhost:5540`.
2. Click **Add Redis Database**.
3. Connect using the Docker service name, not the host-mapped port — RedisInsight reaches Redis over the internal Docker network:
   - **Host:** `redis`
   - **Port:** `6379`
   - Leave username/password blank (no auth is configured locally).
4. Once connected, use the key browser and filter by pattern `chat:*` to find the active session. Select a key to view its JSON value — `messages` is the running conversation, `turn_count` tracks how many turns have happened.
