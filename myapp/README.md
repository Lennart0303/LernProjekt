## Deployment

### Voraussetzungen
- Docker und Docker Compose installiert
- Traefik läuft auf dem Server mit dem Netzwerk `frontend_network`

### Erster Start (einmalig)
```bash
# Docker-Netzwerk erstellen (nur wenn noch nicht vorhanden):
docker network create frontend_network

# JWT-Secret generieren und als Umgebungsvariable setzen:
export JWT_SECRET=$(openssl rand -base64 32)
```

### App starten
```bash
JWT_SECRET=<dein-secret> docker compose up --build -d
```

### Standard-Admin
Beim ersten Start wird automatisch ein Admin-User angelegt:
- Benutzername: `admin`
- Passwort: `Admin123`

**Bitte das Passwort nach dem ersten Login sofort ändern.**

### Netzwerk prüfen
```bash
docker network ls | grep frontend_network
```
