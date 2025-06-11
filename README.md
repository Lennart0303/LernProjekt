# LernProjekt Monorepo

Dieses Repository enthält eine einfache Full-Stack-Anwendung mit einem React-Next.js-Frontend und einem Spring-Boot-Backend – inklusive SQLite-Datenbank für lokale Entwicklung. Ideal, um erste Erfahrungen mit einer echten Front- und Backend-Architektur zu sammeln und später zu erweitern.

---

## 📁 Ordnerstruktur
LernProjekt/
└── myapp/
├── frontend/ # React-Next.js-Frontend
│ ├── public/
│ ├── src/
│ ├── package.json
│ └── tsconfig.json
└── backend/ # Spring-Boot-Backend
├── src/
│ ├── main/java/com/example/backend
│ └── main/resources
├── pom.xml
└── application.properties
.gitignore # gemeinsame Ignorierregeln
README.md # dieses Dokument

## 🛠 Technologien & Dependencies

### Frontend (myapp/frontend)
- **Next.js** (App Router)  
- **React** & **TypeScript**  
- **react-custom-roulette** für das Essens-Glücksrad  
- **Fetch API** für REST-Zugriff 

### Backend (myapp/backend)
- **Java 21 (LTS)**
- **Spring Boot Starter Web** (REST-API)
- **Spring JDBC** (direkter SQLite-Zugriff)
- **SQLite-JDBC** (org.xerial:sqlite-jdbc)
- **Validation** für Request-Prüfung

## 📈 Roadmap
1. Lokaler Prototyp
    - Frontend mit Glücksrad
    - Backend mit SQLite-Anbindung

2. Erweiterungen
    - User-Authentifizierung (Spring Security)
    - Wechsel SQLite → PostgreSQL/MySQL

3. Deployment
    - Alles auf einem eigenen Server Hosten


## 📚 Lernziele
- Monorepo-Architektur: Klare Trennung Frontend/Backend
- TypeScript & Java: Typ­sichere Codebasis
- REST & CORS: JSON-Kommunikation
- Datenbank: SQLite lokal, Migration auf Produktions-DB
- Modularität: Skalierbarer Aufbau für zukünftige Erweiterungen