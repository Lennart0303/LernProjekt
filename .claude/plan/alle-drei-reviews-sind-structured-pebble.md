# Security-Review Umsetzungsplan

## Kontext

Drei parallele Agenten haben das Projekt auf Sicherheits- und Qualitätsprobleme geprüft. Die Ergebnisse wurden konsolidiert und werden hier als ausführbarer Plan mit Begründungen dokumentiert. Die Fixes sind nach echtem Risiko sortiert — nicht nach Aufwand.

---

## KRITISCH — Sofort beheben

### 1. JWT-Secret aus dem Repository entfernen
**Datei:** `myapp/backend/src/main/resources/application-local.yml:9`

**Was:** Das Secret `YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU=` (Base64 von `abcdefghijklmnopqrstuvwxy0123456`) liegt im Klartext im Repo.

**Warum kritisch:** Jeder mit Zugriff auf das Repository kann alle jemals ausgestellten JWTs fälschen — also sich als beliebiger User, einschließlich Admins, ausgeben. Das Secret ist auch in der Git-History.

**Fix:**
1. `application-local.yml` in `.gitignore` aufnehmen (Zeile ergänzen: `myapp/backend/src/main/resources/application-local.yml`)
2. Neues Secret generieren: `openssl rand -base64 32`
3. Secret als Umgebungsvariable übergeben: In `application.yml` → `jwt.secret: ${JWT_SECRET}`, in Docker-Compose als `JWT_SECRET=<wert>` setzen
4. Git-History bereinigen: `git filter-repo --path myapp/backend/src/main/resources/application-local.yml --invert-paths` (oder BFG Repo Cleaner)

---

### 2. NPE in JwtFilter → 500 statt 401
**Datei:** `myapp/backend/src/main/java/Model/Security/JwtFilter.java:36-37`

**Was:** `jwtUtil.validate()` gibt `null` zurück bei ungültigem Token. Der darauffolgende `claims.getSubject()` wirft eine NullPointerException. Der `catch`-Block fängt nur `JwtException`, nicht NPE → unkontrollierter 500-Fehler.

**Warum kritisch:** Angreifer können gezielt kaputte Tokens senden, um Fehlermeldungen auszulösen und ggf. Stack-Traces zu extrahieren. Außerdem: falsches HTTP-Status-Signal für Clients.

**Fix** (nach Zeile 36 einfügen):
```java
Claims claims = jwtUtil.validate(token);
if (claims == null) {
    chain.doFilter(req, res);
    return;
}
```

---

### 3. Logout-Endpunkt im Backend fehlt komplett
**Datei:** `myapp/backend/src/main/java/Model/Controller/AuthenticationController.java` — neuer Endpunkt

**Was:** `POST /api/auth/logout` existiert nicht. Das Frontend ruft ihn auf, aber der Server antwortet mit 404. Das Cookie läuft 7 Tage weiter.

**Warum kritisch:** Ein User der sich "ausloggt" ist nicht wirklich ausgeloggt — das Cookie (und damit das Refresh-Token) bleibt aktiv. Bei gestohlenen Cookies ist kein Widerruf möglich.

**Fix** (neue Methode in `AuthenticationController`):
```java
@PostMapping("/logout")
public ResponseEntity<Void> logout(HttpServletResponse response) {
    ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
        .httpOnly(true)
        .secure(true)
        .sameSite("Strict")
        .path("/api/auth/refresh")
        .maxAge(0)
        .build();
    response.addHeader("Set-Cookie", cookie.toString());
    return ResponseEntity.noContent().build();
}
```
Außerdem: `/api/auth/logout` in `SecurityConfig` zu `permitAll()` hinzufügen (sonst 401 beim Logout ohne gültigen Token).

---

### 4. logout() im Frontend falsche URL
**Datei:** `myapp/frontend/src/components/context/AuthContext.tsx:39`

**Was:** `fetch("/api/auth/logout", ...)` — relative URL ohne `NEXT_PUBLIC_API_URL`. In Produktion zeigt das auf den falschen Host.

**Warum kritisch:** Der Logout-Request landet nie beim Backend → Cookie wird nie gelöscht → Logout funktioniert in Produktion gar nicht.

**Fix:**
```typescript
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, { method: "POST", credentials: "include" });
```

---

### 5. IDOR: GET /api/meal/{id} ohne Ownership-Check
**Datei:** `myapp/backend/src/main/java/Model/Controller/MealController.java:56-62`

**Was:** Der Endpunkt lädt das Meal anhand der ID ohne zu prüfen, ob es dem aktuellen User gehört.

**Warum kritisch:** User A kann durch simples Durchzählen von IDs alle Gerichte anderer User lesen (Insecure Direct Object Reference). Datenschutzverstoß.

**Fix:**
```java
@GetMapping("/{id}")
public ResponseEntity<Meal> getMealByID(@PathVariable int id) {
    Meal meal = mealRepository.getMealByID(id);
    if (meal == null) {
        return ResponseEntity.notFound().build();
    }
    if (meal.getUserId() != getCurrentUserId()) {
        return ResponseEntity.status(403).build();
    }
    return ResponseEntity.ok(meal);
}
```
Nebenbei: `status(500)` auf `notFound()` korrigiert (semantisch falsch).

---

### 6. Admin-Seiten im Frontend ohne Rollen-Check
**Dateien:**
- `myapp/frontend/src/app/benutzer/page.tsx` (Benutzerverwaltung)
- `myapp/frontend/src/app/register/page.tsx` (Neuen User anlegen)

**Was:** Beide Seiten prüfen nur ob ein Token vorhanden ist, nicht ob der User die Rolle ADMIN hat.

**Warum kritisch:** Jeder eingeloggte USER kann die Benutzerverwaltung aufrufen und (da der Backend-Schutz via `@PreAuthorize` existiert) zumindest die Fehlermeldungen sehen — bei fehlerhafter Config wären die Aktionen ausführbar. Defense-in-depth erfordert Checks auf beiden Ebenen.

**Fix** (am Seitenanfang, nach `useAuth()`):
```typescript
const { role } = useAuth();
if (role !== 'ADMIN') return <p>Zugriff verweigert.</p>;
```

---

### 7. Login-Flash — kein initializing-State
**Dateien:** `myapp/frontend/src/components/context/AuthContext.tsx`, `myapp/frontend/src/components/context/AuthGate.tsx`

**Was:** Beim Laden der App zeigt `AuthGate` sofort das Login-Formular, weil `accessToken` noch `null` ist — auch wenn der User bereits eingeloggt ist und der `/refresh`-Request noch läuft.

**Warum:** Schlechte UX (sichtbares Flackern) und potentiell fehlerhafte Weiterleitungen.

**Fix:** In `AuthContext` einen `initializing`-State einführen:
```typescript
const [initializing, setInitializing] = useState(true);
// Im useEffect nach dem /refresh-Aufruf: setInitializing(false)
```
In `AuthGate`:
```typescript
if (initializing) return <p>Lade…</p>;
return accessToken ? <>{children}</> : <LoginForm />;
```

---

### 8. Refresh-Token-Rotation fehlt
**Datei:** `myapp/backend/src/main/java/Model/Controller/AuthenticationController.java:113`

**Was:** Bei jedem `/api/auth/refresh` wird ein neuer Access-Token ausgestellt, aber das Refresh-Token-Cookie bleibt unverändert — immer dasselbe Token, 7 Tage gültig.

**Warum:** Gestohlene Refresh-Tokens bleiben unbegrenzt nutzbar bis zur Ablaufzeit. Token-Rotation erkennt Missbrauch: Wenn ein bereits rotiertes Token nochmal genutzt wird, deutet das auf Diebstahl hin.

**Fix:** Bei jedem `/refresh` neues Refresh-Token-Cookie mit frischer Ablaufzeit setzen (neues `UUID` oder neues JWT als Refresh-Token). Erfordert serverseitige Speicherung der gültigen Refresh-Tokens (z.B. in der Datenbank), um Wiederverwendung zu erkennen — das ist der größte Aufwand dieser Änderung.

---

## MITTEL — Bald beheben

### 9. `/api/users/**` nicht in SecurityConfig gesichert
**Datei:** `myapp/backend/src/main/java/Model/Security/SecurityConfig.java:80`

**Was:** `UserController` ist nur durch `@PreAuthorize("hasRole('ADMIN')")` geschützt, kein Eintrag in der SecurityConfig.

**Warum:** Defense-in-depth. Falls `@EnableMethodSecurity` mal deaktiviert wird oder ein neuer Endpoint ohne Annotation ergänzt wird, sind die Endpoints ungeschützt.

**Fix** (in `authorizeHttpRequests`):
```java
.requestMatchers("/api/users/**").hasRole("ADMIN")
```

---

### 10. YAML-Syntaxfehler: `server.forward-headers-strategy`
**Datei:** `myapp/backend/src/main/resources/application.yml:29`

**Was:** 
```yaml
server:
  port: 8080
  server.forward-headers-strategy: native  # falsch!
```
Der Schlüssel hat den falschen Präfix — Spring ignoriert diese Zeile.

**Warum:** Ohne korrekte Header-Strategie werden `X-Forwarded-For`-Header nicht ausgewertet → Rate-Limiting trifft Traefik-IP statt Client-IP (alle Requests werden vom selben "Client" gesehen).

**Fix:**
```yaml
server:
  port: 8080
  forward-headers-strategy: native  # ohne "server." Präfix
```

---

### 11. `@Valid` fehlt beim Login-Endpoint
**Datei:** `myapp/backend/src/main/java/Model/Controller/AuthenticationController.java:87`

**Was:** `@RequestBody LoginRequest request` ohne `@Valid` → Bean-Validation-Constraints (z.B. `@NotBlank`) werden nicht geprüft.

**Fix:** `@Valid @RequestBody LoginRequest request`

---

### 12. UserController: 0 Rows → trotzdem 204/200
**Datei:** `myapp/backend/src/main/java/Model/Controller/UserController.java:38, 52`

**Was:** `repo.deleteUser(id)` und `repo.updateRole(id, req.role())` geben keinen Fehler wenn kein User mit der ID existiert. Der Controller antwortet trotzdem mit 204/200.

**Fix:** Repository-Methoden `int`-Rückgabe nutzen, bei 0 `ResponseEntity.notFound().build()` zurückgeben.

---

### 13. Rate Limiting trifft Traefik-IP statt Client-IP
**Datei:** `myapp/backend/src/main/resources/application.yml` Bucket4j-Config

**Was:** Hängt direkt von Fix #10 ab. Solange `forward-headers-strategy` falsch gesetzt ist, sieht Bucket4j als Client-IP die interne Traefik-IP — alle Nutzer teilen ein einziges Rate-Limit-Bucket.

**Fix:** Nach Fix #10 in der Bucket4j-Config die Key-Expression auf die echte Client-IP setzen:
```yaml
rate-limits:
  - expression: "getHeader('X-Forwarded-For')"
```

---

### 14. Kein `isSubmitting`-State — Doppelsubmit möglich
**Dateien:** `myapp/frontend/src/app/create_Meal/page.tsx`, `myapp/frontend/src/app/feedback/page.tsx`, `myapp/frontend/src/app/register/page.tsx`

**Was:** Submit-Button bleibt nach Klick aktiv → bei langsamer Verbindung können mehrere identische Requests abgeschickt werden.

**Fix:** `const [isSubmitting, setIsSubmitting] = useState(false)` + Button `disabled={isSubmitting}` + `setIsSubmitting(true/false)` um den fetch-Aufruf.

---

### 15. Kein Loading-State auf Listenseiten
**Dateien:** Alle Seiten die Daten per `useEffect` laden.

**Was:** Während der initiale Fetch läuft, sieht der User eine leere Liste — nicht unterscheidbar von "keine Daten".

**Fix:** `const [loading, setLoading] = useState(true)` — während `loading` true: Spinner oder "Lade…"-Text anzeigen.

---

### 16. Race Condition — kein AbortController in useEffect
**Dateien:** Alle Seiten mit `fetch()` in `useEffect`.

**Was:** Wenn der User schnell zwischen Seiten wechselt, können ältere Requests nach dem Unmount noch antworten und `setState` aufrufen → React-Warnung und potentiell falscher State.

**Fix:** AbortController in useEffect:
```typescript
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal }).then(...);
  return () => controller.abort();
}, []);
```

---

### 17. Feedback-Textarea: unkontrolliertes Formular
**Datei:** `myapp/frontend/src/app/feedback/page.tsx:71`

**Was:** `<textarea onChange={e => setNeuesFeedback(e.target.value)}>` — hat `onChange` aber kein `value={neuesFeedback}`. React behandelt das als uncontrolled, daher funktioniert `setNeuesFeedback("")` nach dem Submit nicht (Textarea bleibt gefüllt).

**Fix:** `value={neuesFeedback}` zum Textarea hinzufügen.

---

### 18. Glücksrad: Button während Drehung nicht deaktiviert
**Datei:** `myapp/frontend/src/app/wheel_of_fortune/page.tsx`

**Was:** Spin-Button bleibt während der Drehung klickbar → mehrfache gleichzeitige Spins möglich.

**Fix:** `const [isSpinning, setIsSpinning] = useState(false)` + `disabled={isSpinning}` am Button + `setIsSpinning(true)` beim Start, `setIsSpinning(false)` im `onFinished`-Callback.

---

### 19. MealController.getCurrentUserId() wirft RuntimeException → 500
**Datei:** `myapp/backend/src/main/java/Model/Controller/MealController.java:36`

**Was:** `orElseThrow(() -> new RuntimeException("User not found"))` → unkontrollierter 500-Fehler.

**Warum:** Der User ist im Token gültig aber nicht in der DB — das ist ein Auth-Fehler, kein Server-Fehler. 500 verrät interne Details.

**Fix:**
```java
.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"))
```

---

## NIEDRIG — Bei Gelegenheit

| Problem | Datei | Fix |
|---------|-------|-----|
| `getID()` erzeugt JSON-Feld `"iD"` statt `"id"` | `Meal.java`, Feedback-Klasse | Getter in `getId()` umbenennen |
| `Collectors.toMap` ohne Merge-Funktion → ISE bei Duplikaten | Validation-Code | `(a, b) -> a` als dritten Parameter |
| Tippfehler: `UserRespository` | Alle Java-Dateien | Umbenennen in `UserRepository` |
| Tippfehler: `creatUser`, `setSuccesMessage`, "Glücksrat" | Diverse Dateien | Korrekte Schreibweise |
| Lowercase Komponenten-Namen: `feedback()`, `feedback einsehen()` | `feedback/page.tsx`, `feedback/einsehen/page.tsx` | PascalCase: `Feedback`, `FeedbackEinsehen` |
| `array.index` als React-Key statt echte ID | Alle `.map()` mit Index-Key | `key={item.id}` verwenden |
| `next/dist/server/app-render/types` importiert | `types/`-Ordner | Durch öffentliche Next.js-Types ersetzen |
| Kein `Retry-After`-Header im 429-Response | Bucket4j-Config | `httpResponseHeaders` ergänzen |
| `ignoreBuildErrors: true` in `next.config.ts` | `next.config.ts` | Entfernen — TypeScript-Fehler nicht stillschweigend ignorieren |

---

## Empfohlene Reihenfolge

**Runde 1 — Backend (ca. 20 min):**
Fix #1 (Secret), #2 (NPE JwtFilter), #3 (Logout-Endpoint), #5 (IDOR), #10 (YAML), #9 (SecurityConfig), #11 (@Valid), #19 (RuntimeException)

**Runde 2 — Frontend (ca. 20 min):**
Fix #4 (logout URL), #6 (Admin-Rollen-Check), #7 (initializing-State), #17 (Textarea value), #18 (Wheel Button)

**Runde 3 — Mittlere Fixes (ca. 30 min):**
Fix #12 (UserController 404), #13 (Rate-Limit IP), #14 (isSubmitting), #15 (Loading-State), #16 (AbortController)

**Runde 4 — Architektur (größerer Aufwand):**
Fix #8 (Refresh-Token-Rotation — erfordert DB-Tabelle für Tokens)

**Runde 5 — Cleanup (bei Gelegenheit):**
Alle NIEDRIG-Punkte

---

## Verifikation

Nach Runde 1+2:
- `curl -H "Authorization: Bearer invalidtoken" http://localhost:8080/api/meal` → muss **401** zurückgeben (nicht 500)
- `curl http://localhost:8080/api/meal/1` ohne Auth → **401**
- Als User A einloggen, Meal-ID eines anderen Users raten → **403**
- `/logout` aufrufen, Cookie prüfen: `Max-Age=0` im Set-Cookie-Header
- Als normaler USER `/benutzer` aufrufen → "Zugriff verweigert" im Browser
- Login-Flash: Seite neu laden → kein kurzes Aufblitzen des Login-Formulars
