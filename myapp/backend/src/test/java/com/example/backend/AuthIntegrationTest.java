package com.example.backend;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Map;
import java.util.Objects;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integrationstests fuer den Auth-Flow.
 *
 * Strategie:
 * - @SpringBootTest faehrt den vollstaendigen Spring-Kontext hoch (inkl. Security, JwtFilter, JdbcTemplate)
 * - SQLite In-Memory via application-test.yml — keine echte Datei wird beruehrt
 * - TestRestTemplate schickt echte HTTP-Requests gegen den RANDOM_PORT
 * - Kein Mock fuer DB oder Security
 * - @TestInstance(PER_CLASS) erlaubt @BeforeAll ohne static — damit koennen @Autowired-Felder genutzt werden
 */
@SpringBootTest(
        classes = Model.BackendApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class AuthIntegrationTest {

    // ParameterizedTypeReference vermeidet raw-type-Warnungen beim Deserialisieren
    private static final ParameterizedTypeReference<Map<String, Object>> MAP_TYPE =
            new ParameterizedTypeReference<>() {};
    private static final ParameterizedTypeReference<List<Object>> LIST_TYPE =
            new ParameterizedTypeReference<>() {};

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String baseUrl() {
        return "http://localhost:" + port;
    }

    /**
     * Legt einmalig vor allen Tests einen Admin-User an.
     * Da SQLite In-Memory mit pool-size=1 arbeitet, bleibt die Connection
     * (und damit die Daten) fuer die gesamte Test-Session erhalten.
     */
    @BeforeAll
    void seedTestUser() {
        // schema.sql wird beim Context-Start ausgefuehrt (sql.init.mode=always)
        String passwordHash = passwordEncoder.encode("Admin123");
        jdbc.update(
                "INSERT OR IGNORE INTO users(username, passwordHash, role) VALUES(?,?,?)",
                "admin", passwordHash, "ADMIN"
        );
    }

    // -------------------------------------------------------------------------
    // Hilfsmethoden
    // -------------------------------------------------------------------------

    private HttpEntity<Map<String, String>> loginRequest(String username, String password) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(Map.of("username", username, "password", password), headers);
    }

    /**
     * Fuehrt einen erfolgreichen Login durch und gibt den Access-Token zurueck.
     * Wird von mehreren Tests als Vorbereitung benoetigt.
     */
    private String loginAndGetAccessToken() {
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                baseUrl() + "/api/auth/login",
                HttpMethod.POST,
                loginRequest("admin", "Admin123"),
                MAP_TYPE
        );
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<String, Object> body = response.getBody();
        assertThat(body).as("Login-Response-Body darf nicht null sein").isNotNull();
        return (String) Objects.requireNonNull(body).get("accessToken");
    }

    /**
     * Extrahiert den refreshToken-Cookie-Wert (nur "refreshToken=<wert>", ohne Attribute)
     * aus einem Set-Cookie-Header.
     */
    private String extractRefreshCookieValue(List<String> setCookieHeaders) {
        return setCookieHeaders.stream()
                .filter(c -> c.startsWith("refreshToken="))
                .findFirst()
                .map(c -> c.split(";")[0])
                .orElse(null);
    }

    // -------------------------------------------------------------------------
    // Test 1: Login mit korrekten Credentials
    // -------------------------------------------------------------------------

    @Test
    void login_mitKorrektenCredentials_gibt200UndAccessToken() {
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                baseUrl() + "/api/auth/login",
                HttpMethod.POST,
                loginRequest("admin", "Admin123"),
                MAP_TYPE
        );

        assertThat(response.getStatusCode())
                .as("HTTP-Status bei erfolgreichem Login muss 200 sein")
                .isEqualTo(HttpStatus.OK);

        Map<String, Object> body = response.getBody();
        assertThat(body)
                .as("Login-Response-Body darf nicht null sein")
                .isNotNull();

        String accessToken = (String) Objects.requireNonNull(body).get("accessToken");
        assertThat(accessToken)
                .as("Access-Token darf nicht null oder leer sein")
                .isNotBlank();

        // Set-Cookie-Header muss den refreshToken enthalten
        List<String> setCookieHeaders = response.getHeaders().get(HttpHeaders.SET_COOKIE);
        assertThat(setCookieHeaders)
                .as("Set-Cookie-Header muss vorhanden sein (refreshToken)")
                .isNotEmpty();

        boolean hasRefreshTokenCookie = Objects.requireNonNull(setCookieHeaders).stream()
                .anyMatch(c -> c.startsWith("refreshToken="));
        assertThat(hasRefreshTokenCookie)
                .as("refreshToken-Cookie muss im Set-Cookie-Header stehen")
                .isTrue();
    }

    // -------------------------------------------------------------------------
    // Test 2: Login mit falschem Passwort
    // -------------------------------------------------------------------------

    @Test
    void login_mitFalchemPasswort_gibt401() {
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                baseUrl() + "/api/auth/login",
                HttpMethod.POST,
                loginRequest("admin", "FalschesPasswort1"),
                MAP_TYPE
        );

        assertThat(response.getStatusCode())
                .as("Falsches Passwort muss 401 zurueckgeben, nicht 200 oder 403")
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    // -------------------------------------------------------------------------
    // Test 3: Login mit nicht-existentem User
    // -------------------------------------------------------------------------

    @Test
    void login_mitUnbekanntemUser_gibt401() {
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                baseUrl() + "/api/auth/login",
                HttpMethod.POST,
                loginRequest("nichtvorhanden", "Admin123"),
                MAP_TYPE
        );

        assertThat(response.getStatusCode())
                .as("Unbekannter User muss 401 zurueckgeben")
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    // -------------------------------------------------------------------------
    // Test 4: Logout loescht den Cookie
    // -------------------------------------------------------------------------

    @Test
    void logout_gibt200UndLoeschtRefreshTokenCookie() {
        // Erst einloggen, dann ausloggen
        ResponseEntity<Map<String, Object>> loginResponse = restTemplate.exchange(
                baseUrl() + "/api/auth/login",
                HttpMethod.POST,
                loginRequest("admin", "Admin123"),
                MAP_TYPE
        );
        assertThat(loginResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Logout aufrufen (kein Body noetig)
        HttpHeaders logoutHeaders = new HttpHeaders();
        logoutHeaders.setContentType(MediaType.APPLICATION_JSON);
        ResponseEntity<Void> logoutResponse = restTemplate.exchange(
                baseUrl() + "/api/auth/logout",
                HttpMethod.POST,
                new HttpEntity<>(logoutHeaders),
                Void.class
        );

        assertThat(logoutResponse.getStatusCode())
                .as("Logout muss 200 zurueckgeben")
                .isEqualTo(HttpStatus.OK);

        // Cookie muss mit Max-Age=0 geloescht werden
        List<String> setCookieHeaders = logoutResponse.getHeaders().get(HttpHeaders.SET_COOKIE);
        assertThat(setCookieHeaders)
                .as("Logout muss einen Set-Cookie-Header zum Loeschen senden")
                .isNotEmpty();

        // Wir brauchen den vollstaendigen Header-Wert (inkl. Attribute) fuer die Max-Age-Pruefung
        String fullRefreshHeader = Objects.requireNonNull(setCookieHeaders).stream()
                .filter(c -> c.startsWith("refreshToken="))
                .findFirst()
                .orElse(null);
        assertThat(fullRefreshHeader)
                .as("refreshToken-Cookie muss im Logout-Response gesetzt werden")
                .isNotNull();

        // Max-Age=0 signalisiert dem Browser, den Cookie zu loeschen
        assertThat(Objects.requireNonNull(fullRefreshHeader).toLowerCase())
                .as("Der refreshToken-Cookie muss Max-Age=0 enthalten, um geloescht zu werden")
                .contains("max-age=0");
    }

    // -------------------------------------------------------------------------
    // Test 5: Refresh ohne Cookie gibt 401
    // -------------------------------------------------------------------------

    @Test
    void refresh_ohneRefreshTokenCookie_gibt401() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                baseUrl() + "/api/auth/refresh",
                HttpMethod.POST,
                new HttpEntity<>(headers),
                MAP_TYPE
        );

        assertThat(response.getStatusCode())
                .as("Refresh ohne Cookie muss 401 zurueckgeben")
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    // -------------------------------------------------------------------------
    // Test 6: Refresh mit gueltigem Cookie liefert neuen Access-Token
    // -------------------------------------------------------------------------

    @Test
    void refresh_mitGueltigemRefreshTokenCookie_gibtNeuenAccessToken() {
        // 1) Login, um den refreshToken-Cookie zu erhalten
        ResponseEntity<Map<String, Object>> loginResponse = restTemplate.exchange(
                baseUrl() + "/api/auth/login",
                HttpMethod.POST,
                loginRequest("admin", "Admin123"),
                MAP_TYPE
        );
        assertThat(loginResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        // 2) Den refreshToken-Cookie aus der Login-Response extrahieren
        List<String> setCookieHeaders = loginResponse.getHeaders().get(HttpHeaders.SET_COOKIE);
        assertThat(setCookieHeaders)
                .as("Login-Response muss Set-Cookie-Header enthalten")
                .isNotEmpty();

        String refreshCookieValue = extractRefreshCookieValue(
                Objects.requireNonNull(setCookieHeaders)
        );
        assertThat(refreshCookieValue)
                .as("refreshToken-Cookie muss im Login-Response vorhanden sein")
                .isNotNull();

        // 3) Refresh-Request mit dem Cookie abschicken
        HttpHeaders refreshHeaders = new HttpHeaders();
        refreshHeaders.setContentType(MediaType.APPLICATION_JSON);
        refreshHeaders.add(HttpHeaders.COOKIE, refreshCookieValue);

        ResponseEntity<Map<String, Object>> refreshResponse = restTemplate.exchange(
                baseUrl() + "/api/auth/refresh",
                HttpMethod.POST,
                new HttpEntity<>(refreshHeaders),
                MAP_TYPE
        );

        assertThat(refreshResponse.getStatusCode())
                .as("Refresh mit gueltigem Cookie muss 200 zurueckgeben")
                .isEqualTo(HttpStatus.OK);

        Map<String, Object> refreshBody = refreshResponse.getBody();
        assertThat(refreshBody)
                .as("Refresh-Response-Body darf nicht null sein")
                .isNotNull();

        String newAccessToken = (String) Objects.requireNonNull(refreshBody).get("accessToken");
        assertThat(newAccessToken)
                .as("Neuer Access-Token darf nicht null oder leer sein")
                .isNotBlank();
    }

    // -------------------------------------------------------------------------
    // Test 7: Geschuetzter Endpunkt ohne Token gibt 401/403
    // -------------------------------------------------------------------------

    @Test
    void getMeal_ohneToken_gibt401() {
        ResponseEntity<String> response = restTemplate.exchange(
                baseUrl() + "/api/meal",
                HttpMethod.GET,
                new HttpEntity<>(new HttpHeaders()),
                String.class
        );

        assertThat(response.getStatusCode().value())
                .as("GET /api/meal ohne Token muss 401 oder 403 zurueckgeben")
                .isIn(401, 403);
    }

    // -------------------------------------------------------------------------
    // Test 8: Geschuetzter Endpunkt mit gueltigem Token gibt 200
    // -------------------------------------------------------------------------

    @Test
    void getMeal_mitGueltigemBearerToken_gibt200() {
        String accessToken = loginAndGetAccessToken();

        HttpHeaders authHeaders = new HttpHeaders();
        authHeaders.setBearerAuth(accessToken);

        ResponseEntity<List<Object>> response = restTemplate.exchange(
                baseUrl() + "/api/meal",
                HttpMethod.GET,
                new HttpEntity<>(authHeaders),
                LIST_TYPE
        );

        assertThat(response.getStatusCode())
                .as("GET /api/meal mit gueltigem Token muss 200 zurueckgeben")
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .as("Response-Body muss eine Liste sein (auch wenn leer)")
                .isNotNull();
    }

    // -------------------------------------------------------------------------
    // Test 9: Manipulierter Token wird abgelehnt
    // -------------------------------------------------------------------------

    @Test
    void getMeal_mitManipuliertumToken_gibt401() {
        // Einen syntaktisch validen, aber falsch signierten JWT zusammenbauen.
        // Wir nehmen den echten Token und veraendern das letzte Zeichen der Signatur.
        String realToken = loginAndGetAccessToken();
        // JWT hat Format: header.payload.signature — letztes Zeichen der Signatur aendern
        String tampered = realToken.substring(0, realToken.length() - 1) + "X";

        HttpHeaders authHeaders = new HttpHeaders();
        authHeaders.setBearerAuth(tampered);

        ResponseEntity<String> response = restTemplate.exchange(
                baseUrl() + "/api/meal",
                HttpMethod.GET,
                new HttpEntity<>(authHeaders),
                String.class
        );

        assertThat(response.getStatusCode().value())
                .as("Manipulierter Token muss 401 oder 403 zurueckgeben")
                .isIn(401, 403);
    }
}
