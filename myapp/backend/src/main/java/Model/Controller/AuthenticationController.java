package Model.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import Model.Database.UserRespository;
import java.util.List;
import Model.Classes.User;
import Model.Security.JwtUtil;
import Model.dto.AuthDto.AuthRequest;
import Model.dto.AuthDto.AuthResponse;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "https://localhost:3000")
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
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest req) {
        // 1) Prüfen, ob Username schon existiert
        if (userRepo.findByUsername(req.username()).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body(new AuthResponse("Username bereits vergeben"));
        }

        // 2) Passwort hashen und User anlegen
        String hash = encoder.encode(req.password());
        User u = new User(0, req.username(), hash, "ROLE_USER");
        userRepo.creatUser(u);

        // 3) Token erzeugen – hier direkt nach Registration
        String token = jwtUtil.generateToken(u.getUsername(), List.of(u.getRole()));

        // 4) JSON-Antwort mit Token
        return ResponseEntity.ok(new AuthResponse(token));
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest req) {
        // 1) Credentials prüfen
        authMgr.authenticate(
                new UsernamePasswordAuthenticationToken(req.username(), req.password()));
        // 2) Rolle aus der Datenbank holen
        User user = userRepo.findByUsername(req.username())
                .orElseThrow(() -> new UsernameNotFoundException("User nicht gefunden"));
        // 3) Token mit Username und Rolle generieren
        String token = jwtUtil.generateToken(user.getUsername(), List.of(user.getRole()));
        // 4) Zurück an den Client
        return ResponseEntity.ok(new AuthResponse(token));
    }
}
