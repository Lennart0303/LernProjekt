# Deploy-Plan: terzenbach.com/essensrad

## Context

Das Projekt soll unter `terzenbach.com/essensrad` deployed werden. Traefik v3.5 läuft bereits auf dem Server im Netzwerk `frontend_network`. TLS ist global am `websecure`-Entry-Point konfiguriert — Container-Labels brauchen kein eigenes `certresolver`.

Ein vollständiger Audit hat ergeben: Die meisten Änderungen aus dem ursprünglichen Plan sind **bereits umgesetzt**. Es gibt noch **1 kritischen Code-Bug** der vor dem Deploy behoben werden muss.

---

## Status-Übersicht nach Audit

| Datei | Status |
|---|---|
| `application.yml` | ✓ Fertig |
| `SecurityConfig.java` | ✓ Fertig |
| `AuthenticationController.java` | ✓ Fertig (SameSite Strict) |
| `JwtUtil.java` | ✓ Fertig (@Value) |
| `backend/Dockerfile` | ✓ Fertig (JRE, 8080) |
| `frontend/server.js` | ✓ Fertig (HTTP) |
| `frontend/Dockerfile` | ✓ Fertig (slim, kein pem) |
| `docker-compose.yml` | ✓ Fertig (external network, terzenbach.com) |
| `.env.production` | ✓ Fertig (leer = relative URLs) |
| `.env.development` | ✓ Fertig (localhost:8443) |
| `next.config.ts` | ✓ Fertig (basePath: "/essensrad") |
| **9× Frontend fetch-Calls** | **✗ Anführungszeichen statt Backticks** |
| `types/global.d.ts` | ✓ Vorhanden |

---

## Offene Änderungen

### 1. Frontend — 9 fetch-Calls: Anführungszeichen → Backticks (DEPLOY-BLOCKER)

**Das Problem:** Die hardcoded `localhost:8443`-URLs wurden bereits ersetzt, aber mit normalen Anführungszeichen statt Backticks:

```typescript
// Aktuell (falsch — Template-Literal wird NICHT interpoliert):
fetch("${process.env.NEXT_PUBLIC_API_URL}/api/auth/login", { ... })

// Richtig — Backticks:
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, { ... })
```

Mit Anführungszeichen wird der String literal als `"${process.env.NEXT_PUBLIC_API_URL}/api/auth/login"` gesendet — alle API-Calls schlagen fehl.

**Betroffene Dateien:**

| Datei | Zeile |
|---|---|
| `src/components/Login/page.tsx` | 17 |
| `src/components/context/AuthContext.tsx` | 32 |
| `src/components/utils/page.tsx` | 9 |
| `src/app/meal/page.tsx` | 19, 48 |
| `src/app/wheel_of_fortune/page.tsx` | 18 |
| `src/app/feedback/page.tsx` | 23 |
| `src/app/create_Meal/page.tsx` | 26 |
| `src/app/feedback/einsehen/page.tsx` | 24 |

---

## docker-compose.yml (zur Referenz — bereits korrekt)

```yaml
version: "3.9"

services:

  backend:
    build: ./backend
    container_name: myapp-backend
    restart: unless-stopped
    expose:
      - "8080"
    volumes:
      - ./backend/meals.db:/app/data/app.db
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - JWT_SECRET=${JWT_SECRET}
    networks:
      - frontend_network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.essensraf-backend.rule=Host(`terzenbach.com`) && PathPrefix(`/api`)"
      - "traefik.http.routers.essensraf-backend.entrypoints=websecure"
      - "traefik.http.routers.essensraf-backend.tls=true"
      - "traefik.http.services.essensraf-backend.loadbalancer.server.port=8080"

  frontend:
    build:
      context: ./frontend
      args:
        - NEXT_PUBLIC_API_URL=
    container_name: myapp-frontend
    restart: unless-stopped
    expose:
      - "3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - backend
    networks:
      - frontend_network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.essensraf-frontend.rule=Host(`terzenbach.com`) && PathPrefix(`/essensrad`)"
      - "traefik.http.routers.essensraf-frontend.entrypoints=websecure"
      - "traefik.http.routers.essensraf-frontend.tls=true"
      - "traefik.http.services.essensraf-frontend.loadbalancer.server.port=3000"

networks:
  frontend_network:
    external: true
```

---

## Deployment auf dem Server

```bash
# 1. Projekt in den Server-Ordner (neben traefik/) kopieren / git clone

# 2. JWT Secret generieren (auf dem Server, in Bash ausführen):
echo "JWT_SECRET=$(openssl rand -base64 32)" > myapp/.env

# 3. Starten
cd myapp
docker compose up -d --build

# 4. Logs prüfen
docker compose logs -f backend
docker compose logs -f frontend
```

**Hinweis `.env`:** Das `$(openssl rand ...)` muss in einer Bash-Shell ausgeführt werden — nicht den Text literal in die .env-Datei schreiben. Die obige `echo`-Zeile macht das automatisch korrekt.

---

## Verifikation

```bash
curl -I https://terzenbach.com/essensrad
# Erwartung: HTTP 200, Strict-Transport-Security Header

curl https://terzenbach.com/api/auth/login
# Erwartung: HTTP 405 (Method Not Allowed für GET) — NICHT 502
```

Browser:
1. `https://terzenbach.com/essensrad` lädt die Next.js-App
2. Login funktioniert → Cookie ist `SameSite=Strict`
3. `/meal`, `/feedback`, `/wheel_of_fortune` laden Daten ohne CORS-Fehler
