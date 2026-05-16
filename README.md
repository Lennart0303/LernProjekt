# Dreh & Schmatz

Eine Full-Stack-Webanwendung zum zufälligen Auswählen von Gerichten via Glücksrad.

**Live:** https://terzenbach.com/essensrad

---

## Technologie-Stack

| Bereich | Technologie |
|---|---|
| Frontend | Next.js 14 (TypeScript), React, CSS |
| Backend | Spring Boot 3, Java 21 |
| Datenbank | SQLite (via JDBC) |
| Auth | JWT (Access Token + Refresh Token via HttpOnly Cookie) |
| Infrastruktur | Docker, Docker Compose, Traefik, Let's Encrypt |

---

## Projektstruktur

```
myapp/
├── backend/          # Spring Boot Backend
│   ├── src/
│   └── Dockerfile
├── frontend/         # Next.js Frontend
│   ├── src/
│   └── Dockerfile
├── data/             # SQLite-Datenbankdatei (lokal, nicht committen)
└── docker-compose.yml
```

---

## Frontend — Seiten

| Route | Beschreibung | Zugriff |
|---|---|---|
| `/` | Startseite / Login | Öffentlich |
| `/signup` | Registrierung | Öffentlich |
| `/wheel_of_fortune` | Glücksrad | USER, ADMIN |
| `/create_Meal` | Neues Gericht anlegen | USER, ADMIN |
| `/meal` | Alle eigenen Gerichte | USER, ADMIN |
| `/feedback` | Feedback senden | USER, ADMIN |
| `/profil` | Eigenes Profil & Account löschen | USER, ADMIN |
| `/dashboard` | Admin-Dashboard (Statistiken) | ADMIN |
| `/benutzer` | Benutzerverwaltung | ADMIN |
| `/feedback/einsehen` | Alle Feedbacks einsehen | ADMIN |
| `/impressum` | Impressum | Öffentlich |
| `/datenschutz` | Datenschutzerklärung | Öffentlich |

Der Basispfad ist `/essensrad` — alle Routen sind unter `terzenbach.com/essensrad/...` erreichbar.

---

## Backend — API-Endpunkte

### Authentifizierung (`/api/auth`)
| Methode | Pfad | Beschreibung | Rate Limit |
|---|---|---|---|
| POST | `/api/auth/signup` | Registrierung (Rolle: USER) | 10/min |
| POST | `/api/auth/login` | Login, gibt Access-Token zurück | 5/min |
| POST | `/api/auth/refresh` | Neuen Access-Token via Refresh-Cookie ausstellen | — |
| POST | `/api/auth/logout` | Refresh-Cookie löschen | — |
| POST | `/api/auth/register` | Nutzer anlegen (nur ADMIN) | — |

### Gerichte (`/api/meal`)
| Methode | Pfad | Beschreibung | Zugriff |
|---|---|---|---|
| GET | `/api/meal` | Alle eigenen Gerichte | USER, ADMIN |
| POST | `/api/meal` | Neues Gericht anlegen | USER, ADMIN |
| GET | `/api/meal/{id}` | Gericht nach ID | USER, ADMIN |
| GET | `/api/meal/search?q=` | Gerichte nach Name suchen | USER, ADMIN |
| DELETE | `/api/meal/{id}` | Gericht löschen | USER, ADMIN |

### Nutzer (`/api/users`)
| Methode | Pfad | Beschreibung | Zugriff |
|---|---|---|---|
| GET | `/api/users/me` | Eigenes Profil + Gerichtanzahl | Authenticated |
| DELETE | `/api/users/me` | Eigenen Account löschen | Authenticated |
| GET | `/api/users` | Alle Nutzer auflisten | ADMIN |
| DELETE | `/api/users/{id}` | Nutzer löschen | ADMIN |
| PATCH | `/api/users/{id}/role` | Rolle ändern (`USER` / `ADMIN`) | ADMIN |

### Feedback (`/api/feedback`)
| Methode | Pfad | Beschreibung | Zugriff |
|---|---|---|---|
| POST | `/api/feedback` | Feedback einreichen | USER, ADMIN |
| GET | `/api/feedback` | Alle Feedbacks einsehen | ADMIN |

### Admin & Sonstiges
| Methode | Pfad | Beschreibung | Zugriff |
|---|---|---|---|
| GET | `/api/admin/dashboard` | Statistiken (Nutzer, Gerichte, Besuche) | ADMIN |
| POST | `/api/analytics/track` | Seitenbesuch tracken | Öffentlich (60/min) |
| GET | `/actuator/health` | Health-Check | Öffentlich |

---

## Authentifizierung & Sicherheit

### JWT-Flow
- **Access Token**: Gültig 5 Minuten, wird im Arbeitsspeicher des Browsers gehalten
- **Refresh Token**: Gültig 7 Tage, wird als `HttpOnly`-Cookie gesetzt (`SameSite=Strict`, `Secure`)
- Bei jedem Seitenaufruf versucht das Frontend den Access Token automatisch zu erneuern

### Sicherheits-Header (Spring Security)
| Header | Wert |
|---|---|
| HSTS | `max-age=31536000; includeSubDomains` |
| Content-Security-Policy | `default-src 'self'`, kein Inline-Script |
| X-Content-Type-Options | `nosniff` |
| Referrer-Policy | `no-referrer` |
| X-Frame-Options | `DENY` |

### Rate Limiting (Bucket4j + Caffeine)
| Endpunkt | Limit |
|---|---|
| `/api/auth/login` | 5 Anfragen / Minute |
| `/api/auth/signup` | 10 Anfragen / Minute |
| `/api/analytics/track` | 60 Anfragen / Minute |

### Passwörter
- BCrypt-Hashing im Backend
- Mindestanforderungen (clientseitig geprüft): mind. 8 Zeichen, Groß- und Kleinbuchstaben, eine Ziffer

---

## Datenbank

SQLite-Datenbank mit 4 Tabellen:

```sql
-- Gerichte (nutzergebunden via Foreign Key)
CREATE TABLE IF NOT EXISTS MEAL (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mealName TEXT NOT NULL,
    mealDescription TEXT,
    calories INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Nutzer
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    role TEXT NOT NULL  -- 'USER' oder 'ADMIN'
);

-- Feedback
CREATE TABLE IF NOT EXISTS FEEDBACK (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    feedback TEXT NOT NULL
);

-- Seitenbesuche (Analytics)
CREATE TABLE IF NOT EXISTS page_visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visited_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Die Datenbank liegt im Docker Volume (`./data:/app/data`) und überlebt Container-Rebuilds.

---

## Deployment

### Voraussetzungen auf dem Server
- Docker und Docker Compose installiert
- Traefik läuft als Reverse Proxy im Netzwerk `frontend_network`
- Domain zeigt auf den Server (für Let's Encrypt)

### Netzwerk prüfen
```bash
docker network ls | grep frontend
```
Erwartet: eine Zeile mit `frontend_network`.

### Umgebungsvariablen
Eine `.env`-Datei im Deploy-Verzeichnis erstellen:
```
JWT_SECRET=<generierter-string>
```
JWT-Secret generieren:
```bash
openssl rand -base64 64
```

### Container starten (erstmaliger Start oder Update)
```bash
docker compose up -d --build
```
Beim ersten Build: 3–5 Minuten (Maven + npm).

### Health-Check
```bash
curl https://terzenbach.com/api/actuator/health
# Erwartet: {"status":"UP"}
```

### Logs prüfen
```bash
docker compose logs -f backend
docker compose logs -f frontend
```

---

## Admin-Account in Produktion anlegen

In der Produktionsumgebung (`SPRING_PROFILES_ACTIVE=prod`) wird **kein** Standard-Admin automatisch angelegt.

**Schritt 1** — Account über die Webseite registrieren:
https://terzenbach.com/essensrad/signup

**Schritt 2** — sqlite3 installieren (einmalig):
```bash
sudo apt install -y sqlite3
```

**Schritt 3** — Rolle auf ADMIN setzen:
```bash
sudo sqlite3 <deploy-pfad>/data/app.db \
  "UPDATE users SET role='ADMIN' WHERE username='DEIN-BENUTZERNAME';"
```

**Schritt 4** — Prüfen:
```bash
sudo sqlite3 <deploy-pfad>/data/app.db \
  "SELECT username, role FROM users;"
```

**Wichtig:** Nach der Rollenänderung in der Datenbank musst du dich **neu einloggen**, da die Rolle im bestehenden JWT-Token eingefroren ist und erst beim nächsten Login aktualisiert wird.

---

## Lokale Entwicklung

```bash
# Backend (Port 8080)
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# Frontend (Port 3000)
cd frontend
npm install
npm run dev
```

Im `local`-Profil wird automatisch ein Test-Admin angelegt (nur für lokale Entwicklung).

---

## Traefik-Konfiguration (docker-compose.yml)

Das Frontend läuft unter dem Basispfad `/essensrad`. Da Next.js statische Assets (`_next/static/`) intern **ohne** Basispfad serviert, sind zwei Traefik-Router nötig:

| Router | Regel | Middleware | Zweck |
|---|---|---|---|
| `essensraf-next` | `PathPrefix('/essensrad/_next')` | StripPrefix `/essensrad` | CSS/JS-Assets |
| `essensraf-frontend` | `PathPrefix('/essensrad')` | StripPrefix `/essensrad` | Alle Seiten |
| `essensraf-backend` | `PathPrefix('/api')` | — | Backend-API |
