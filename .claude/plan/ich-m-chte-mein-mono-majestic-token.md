# Migrationsplan: Monorepo → Server mit Traefik als Reverse Proxy

## Context

Das Projekt läuft aktuell lokal mit selbst-signierten Zertifikaten: Backend auf HTTPS Port 8443, Frontend auf HTTPS Port 3000. Auf dem Server übernimmt **Traefik** die TLS-Terminierung (Let's Encrypt), sodass alle internen Container über **HTTP** kommunizieren. Dabei muss alles was `localhost:8443` oder `localhost:3000` referenziert auf die echte Domain umgestellt werden.

**Routing-Entscheidung: Path-based (empfohlen)**
- `https://yourdomain.com` → Frontend
- `https://yourdomain.com/api/...` → Backend
- Vorteil: Kein CORS-Problem, `SameSite=Strict` Cookies möglich, ein einziges TLS-Zertifikat

---

## Übersicht aller zu ändernden Dateien

| Datei | Art |
|---|---|
| `myapp/docker-compose.yml` | Ersetzen |
| `myapp/traefik/traefik.yml` | Neu erstellen |
| `myapp/.env` | Neu erstellen (nicht committen!) |
| `myapp/backend/src/main/resources/application.yml` | Ändern |
| `myapp/backend/src/main/java/Model/Security/SecurityConfig.java` | Ändern |
| `myapp/backend/src/main/java/Model/Controller/AuthenticationController.java` | Ändern |
| `myapp/backend/src/main/java/Model/Security/JwtUtil.java` | Ändern |
| `myapp/backend/Dockerfile` | Ändern |
| `myapp/frontend/server.js` | Ersetzen |
| `myapp/frontend/Dockerfile` | Ändern |
| `myapp/frontend/.env.production` | Neu erstellen |
| `myapp/frontend/.env.development` | Neu erstellen |
| 9× Frontend-Seiten mit hardcoded URLs | Ändern |

---

## 1. `myapp/docker-compose.yml` — Komplett ersetzen

```yaml
version: "3.9"

services:

  traefik:
    image: traefik:v3.0
    container_name: myapp-traefik
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik/traefik.yml:/etc/traefik/traefik.yml:ro
      - ./traefik/acme.json:/acme.json
    networks:
      - web

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
      - web
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`yourdomain.com`) && PathPrefix(`/api`)"
      - "traefik.http.routers.backend.entrypoints=websecure"
      - "traefik.http.routers.backend.tls.certresolver=letsencrypt"
      - "traefik.http.services.backend.loadbalancer.server.port=8080"

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
      - web
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`yourdomain.com`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
      - "traefik.http.services.frontend.loadbalancer.server.port=3000"

networks:
  web:
    external: false
```

**Wichtig:** `expose` statt `ports` — Container sind nur intern erreichbar, nicht vom Host oder Internet. Traefik routet über das Docker-Netzwerk.

---

## 2. `myapp/traefik/traefik.yml` — Neu erstellen

```yaml
global:
  checkNewVersion: false
  sendAnonymousUsage: false

api:
  dashboard: false

entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
          permanent: true

  websecure:
    address: ":443"

certificatesResolvers:
  letsencrypt:
    acme:
      email: lvermehr@gmail.com
      storage: /acme.json
      httpChallenge:
        entryPoint: web

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: myapp_web

log:
  level: WARN
```

**Vor dem ersten Start auf dem Server:**
```bash
mkdir -p myapp/traefik
touch myapp/traefik/acme.json
chmod 600 myapp/traefik/acme.json
```

---

## 3. `myapp/.env` — Neu erstellen (NIE committen, in .gitignore eintragen)

```bash
JWT_SECRET=<generieren mit: openssl rand -base64 32>
```

---

## 4. `myapp/backend/src/main/resources/application.yml` — Ändern

**Änderungen:**
- `server.port`: `8443` → `8080`
- `server.ssl`-Block komplett entfernen
- `spring.ssl.enabled: true` entfernen
- `spring.jpa.show-sql`: `true` → `false`
- Logging-Level: `DEBUG` → `WARN`
- `server.forward-headers-strategy: native` hinzufügen (damit Spring den `X-Forwarded-Proto: https` Header von Traefik versteht)

```yaml
spring:
  application:
    name: backend
  cache:
    type: jcache
    jcache:
      provider: com.github.benmanes.caffeine.jcache.spi.CaffeineCachingProvider
    cache-names:
      - bucket4j-login-cache

  datasource:
    url: jdbc:sqlite:/app/data/app.db
    driver-class-name: org.sqlite.JDBC

  sql:
    init:
      mode: always
      schema-locations: classpath:schema.sql

  jpa:
    show-sql: false

jwt:
  secret: ${JWT_SECRET}

server:
  port: 8080
  forward-headers-strategy: native

logging:
  level:
    org.springframework.security: WARN
    org.springframework.web: WARN

bucket4j:
  enabled: true
  filters:
    - name: loginFilter
      cache-name: bucket4j-login-cache
      url: '^/api/auth/login$'
      filter-method: servlet
      http-status-code: TOO_MANY_REQUESTS
      strategy: first
      rate-limits:
        - bandwidths:
            - capacity: 5
              refill-capacity: 5
              time: 1
              unit: minutes
              refill-speed: interval
```

---

## 5. `myapp/backend/src/main/java/Model/Security/SecurityConfig.java` — 3 Änderungen

**Änderung 1 — Zeile 41: `.redirectToHttps(withDefaults())` entfernen**

Traefik macht die HTTP→HTTPS Umleitung. Der Backend-Container empfängt nur noch HTTP von Traefik — ein Redirect-Versuch aus Spring würde zu Problemen führen.

```java
// ENTFERNEN:
.redirectToHttps(withDefaults())
```

**Änderung 2 — Zeile 58: CSP `connect-src` anpassen**

```java
// Vorher:
"connect-src 'self' https://localhost:8443; "
// Nachher (path-based: gleiche Origin):
"connect-src 'self'; "
```

**Änderung 3 — Zeile 125: CORS Origin anpassen**

```java
// Vorher:
config.setAllowedOrigins(List.of("https://localhost:3000"));
// Nachher:
config.setAllowedOrigins(List.of("https://yourdomain.com"));
```

---

## 6. `myapp/backend/src/main/java/Model/Controller/AuthenticationController.java` — 2 Änderungen

**SameSite von `"None"` auf `"Strict"` ändern** (da Frontend und Backend jetzt gleiche Domain teilen)

- Zeile 75 (register):
```java
// Vorher:
.sameSite("None")
// Nachher:
.sameSite("Strict")
```

- Zeile 102 (login):
```java
// Vorher:
.sameSite("None")
// Nachher:
.sameSite("Strict")
```

---

## 7. `myapp/backend/src/main/java/Model/Security/JwtUtil.java` — Stabiler JWT-Secret

**Problem:** Aktuell wird bei jedem Container-Neustart ein neuer zufälliger Key generiert → alle Tokens ungültig, alle User ausgeloggt.

**Lösung:** Secret aus Umgebungsvariable lesen.

```java
@Component
public class JwtUtil {
    private Key key;

    @Value("${jwt.secret}")
    private String jwtSecretBase64;

    @PostConstruct
    public void init() {
        byte[] keyBytes = java.util.Base64.getDecoder().decode(jwtSecretBase64);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }
    // ... Rest bleibt unverändert
}
```

Import hinzufügen: `import org.springframework.beans.factory.annotation.Value;`

---

## 8. `myapp/backend/Dockerfile` — Port ändern

Zeile 25:
```dockerfile
# Vorher:
EXPOSE 8443
# Nachher:
EXPOSE 8080
```

Optional: Runtime-Image von `eclipse-temurin:21-jdk` auf `eclipse-temurin:21-jre` ändern (spart ~200 MB):
```dockerfile
FROM eclipse-temurin:21-jre
```

---

## 9. `myapp/frontend/server.js` — HTTPS → HTTP

```javascript
const { createServer } = require("http");   // war "https"
const { parse }        = require("url");
const next             = require("next");

const dev    = process.env.NODE_ENV !== "production";
const app    = next({ dev });
const handle = app.getRequestHandler();

// fs, path und Zertifikat-Reads komplett entfernt

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log("> Server ready on http://localhost:3000");
  });
});
```

---

## 10. `myapp/frontend/Dockerfile` — Build-Arg für API URL + schlankes Image

```dockerfile
FROM node:20 AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# slim spart ~200 MB
FROM node:20-slim

WORKDIR /app

COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/server.js ./server.js
# WICHTIG: localhost+2.pem und localhost+2-key.pem werden NICHT kopiert

EXPOSE 3000

CMD ["node", "server.js"]
```

---

## 11. `myapp/frontend/.env.production` — Neu erstellen

```bash
NEXT_PUBLIC_API_URL=
```

Leer lassen → relative URLs. `"" + "/api/meal"` = `"/api/meal"` (same-origin, Traefik routet intern weiter).

## `myapp/frontend/.env.development` — Neu erstellen (für lokale Entwicklung)

```bash
NEXT_PUBLIC_API_URL=https://localhost:8443
```

---

## 12. Frontend — 9 hardcoded URLs ersetzen

**Alle Vorkommen** `"https://localhost:8443/..."` → `` `${process.env.NEXT_PUBLIC_API_URL}/...` ``

| Datei | Zeile | URL |
|---|---|---|
| `src/components/Login/page.tsx` | 17 | `.../api/auth/login` |
| `src/components/context/AuthContext.tsx` | 32 | `.../api/auth/refresh` |
| `src/components/utils/page.tsx` | 9 | `.../api/auth/refresh` |
| `src/app/meal/page.tsx` | 19 | `.../api/meal` |
| `src/app/meal/page.tsx` | 48 | `.../api/meal/search?q=...` |
| `src/app/wheel_of_fortune/page.tsx` | 18 | `.../api/meal` |
| `src/app/feedback/page.tsx` | 23 | `.../api/feedback` |
| `src/app/create_Meal/page.tsx` | 26 | `.../api/meal` |
| `src/app/feedback/einsehen/page.tsx` | 24 | `.../api/feedback` |

Beispiel für `meal/page.tsx` Zeile 48:
```typescript
// Vorher:
fetch("https://localhost:8443/api/meal/search" + "?q=" + query, {
// Nachher:
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/meal/search?q=${query}`, {
```

---

## 13. Aufräumen — Zertifikats-Altlasten

- `myapp/backend/src/main/resources/keystore.p12` → kann gelöscht werden (SSL im Backend deaktiviert)
- `myapp/frontend/localhost+2.pem` + `localhost+2-key.pem` → werden nicht mehr in Dockerfile kopiert; optional löschen
- `.gitignore` ergänzen:
  ```
  myapp/.env
  myapp/traefik/acme.json
  myapp/frontend/localhost+2.pem
  myapp/frontend/localhost+2-key.pem
  ```

---

## Deployment-Reihenfolge auf dem Server

```bash
# 1. Docker + Docker Compose installieren

# 2. Projekt auf den Server kopieren / clonen

# 3. acme.json mit richtigen Rechten anlegen
mkdir -p myapp/traefik
touch myapp/traefik/acme.json
chmod 600 myapp/traefik/acme.json

# 4. JWT Secret generieren und in .env speichern
echo "JWT_SECRET=$(openssl rand -base64 32)" > myapp/.env

# 5. DNS A-Record für yourdomain.com → Server-IP setzen und warten

# 6. Firewall: Port 80 und 443 öffnen

# 7. Starten
cd myapp
docker compose up -d --build

# 8. Traefik-Logs prüfen (Let's Encrypt Zertifikat)
docker compose logs -f traefik

# 9. Testen
curl -I https://yourdomain.com
# Erwartung: HTTP 200, Header "Strict-Transport-Security" vorhanden

curl https://yourdomain.com/api/auth/login
# Erwartung: HTTP 405 (Method Not Allowed für GET) — NICHT 502 (Bad Gateway)
```

---

## Verifikation (End-to-End)

1. `https://yourdomain.com` lädt die Next.js-App im Browser
2. Login funktioniert → Access-Token wird zurückgegeben
3. Refresh-Cookie ist `HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh`
4. `/meal`, `/feedback`, `/wheel_of_fortune` laden Daten vom Backend
5. Kein CORS-Fehler in der Browser-Konsole
6. `curl -I https://yourdomain.com` zeigt `Strict-Transport-Security`-Header
7. `curl http://yourdomain.com` → redirect 301 auf HTTPS
