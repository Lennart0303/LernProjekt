package Model.Controller;

import org.springframework.http.ResponseEntity;
import java.time.Duration;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import Model.Database.UserRespository;

import java.time.temporal.ChronoUnit;
import java.util.List;
import Model.Classes.User;
import Model.Security.JwtUtil;
import Model.dto.AuthDto.AuthRequest;
import Model.dto.AuthDto.AuthResponse;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {
    private final AuthenticationManager authMgr;
    private final JwtUtil jwtUtil;
    private final UserRespository userRepo;
    private final PasswordEncoder encoder;

    public AuthenticationController(AuthenticationManager authMgr,
            JwtUtil jwtUtil,
            UserRespository userRepo,
            PasswordEncoder encoder) {
        this.authMgr = authMgr;
        this.jwtUtil = jwtUtil;
        this.userRepo = userRepo;
        this.encoder = encoder;
    }

    /**
     * Registrierung: legt einen neuen User an, hasht das Passwort
     * und liefert anschließend direkt das JWT zurück.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest req, HttpServletResponse resp) {
        // 1) Prüfen, ob Username schon existiert
        if (userRepo.findByUsername(req.username()).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body(new AuthResponse("Username bereits vergeben"));
        }

        // 2) Passwort hashen und User anlegen
        String hash = encoder.encode(req.password());
        User u = new User(0, req.username(), hash, "USER");
        userRepo.creatUser(u);

        // --- 3) Tokens erzeugen ---
        List<String> roles = List.of(u.getRole());
        String accessToken = jwtUtil.generateToken(u.getUsername(), roles, 5, ChronoUnit.MINUTES);
        String refreshToken = jwtUtil.generateToken(u.getUsername(), roles, 7, ChronoUnit.DAYS);

        // 4) Refresh-Token-Cookie setzen
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/api/auth/refresh")
                .maxAge(Duration.ofDays(7))
                .build();
        resp.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // 5) Access-Token zurückgeben
        return ResponseEntity.ok(new AuthResponse(accessToken));
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest req, HttpServletResponse resp) {
        // 1) Credentials prüfen
        authMgr.authenticate(
                new UsernamePasswordAuthenticationToken(req.username(), req.password()));
        // 2) Rolle aus der Datenbank holen
        User user = userRepo.findByUsername(req.username())
                .orElseThrow(() -> new UsernameNotFoundException("User nicht gefunden"));
        // 3) Tokens erzeugen
        String accessToken = jwtUtil.generateToken(user.getUsername(), List.of(user.getRole()), 5, ChronoUnit.MINUTES);
        String refreshToken = jwtUtil.generateToken(user.getUsername(), List.of(user.getRole()), 7, ChronoUnit.DAYS);

        // 4) Refresh-Token-Cookie setzen
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/api/auth/refresh")
                .maxAge(Duration.ofDays(7))
                .build();
        resp.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // 5) Access-Token zurückgeben
        return ResponseEntity.ok(new AuthResponse(accessToken));
    }

    /** Refresh: liest HttpOnly-Cookie und gibt neuen Access-Token aus */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(name = "refreshToken", required = false) String refreshToken) {
        // 1) prüfen, ob Cookie existiert und valide ist
        var claims = jwtUtil.validate(refreshToken);
        if (claims == null) {
            return ResponseEntity.status(401).build();
        }
        // 2) neuen Access-Token erzeugen
        String username = claims.getSubject();
        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) claims.get("roles");
        String accessToken = jwtUtil.generateToken(username, roles, 5, ChronoUnit.MINUTES);

        return ResponseEntity.ok(new AuthResponse(accessToken));
    }
}
