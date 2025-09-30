package Model.Security;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import static org.springframework.security.config.Customizer.withDefaults;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.filter.CorsFilter;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.StaticHeadersWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

import Model.Database.UserRespository;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

        private final JwtUtil jwtUtil;

        public SecurityConfig(JwtUtil jwtUtil) {
                this.jwtUtil = jwtUtil;
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                // 1) HTTP → HTTPS umleiten
                                .redirectToHttps(withDefaults())

                                // 2) HSTS aktivieren
                                .headers(headers -> headers
                                                .httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true)
                                                                .maxAgeInSeconds(31_536_000))
                                                .contentSecurityPolicy(csp -> csp
                                                                .policyDirectives(
                                                                                "default-src 'self'; " +
                                                                                                "script-src 'self'; " +
                                                                                                "object-src 'none'; " +
                                                                                                "base-uri 'none'; " +
                                                                                                "form-action 'self'; " +
                                                                                                "style-src 'self' 'unsafe-inline'; "
                                                                                                +
                                                                                                "img-src 'self' data:; "
                                                                                                +
                                                                                                "connect-src 'self' https://localhost:8443; "
                                                                                                +
                                                                                                "font-src 'self'; " +
                                                                                                "frame-ancestors 'none';"))
                                                .addHeaderWriter(new StaticHeadersWriter("X-Content-Type-Options",
                                                                "nosniff"))
                                                // Verhindert MIME-Sniffing im Browser (erzwingt den Content-Type,
                                                // schützt vor XSS durch falsche Dateitypen)
                                                .addHeaderWriter(new StaticHeadersWriter("Referrer-Policy",
                                                                "no-referrer"))
                                                // Browser schickt keinen Referer-Header bei Requests → schützt interne
                                                // Pfade/Token vor Leaks
                                                .addHeaderWriter(new StaticHeadersWriter("X-XSS-Protection", "0"))
                                                // Schaltet den alten Browser-internen XSS-Filter explizit aus
                                                // (veraltet, CSP übernimmt den Schutz)
                                                .frameOptions(frame -> frame.deny()))
                                // Setzt X-Frame-Options: DENY → verhindert, dass deine Seite in <iframe>
                                // eingebettet wird (Clickjacking-Schutz)

                                .csrf(csrf -> csrf.disable())
                                .sessionManagement(sm -> sm
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth
                                                // öffentlich: Login/Register
                                                .requestMatchers("/api/auth/**").permitAll()
                                                // nur Admins: z.B. Nutzerverwaltung
                                                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                                                // normale User‑Funktionen
                                                .requestMatchers("/api/meal/**").hasAnyRole("USER", "ADMIN")
                                                // feedback
                                                .requestMatchers("/api/feedback/**").hasAnyRole("USER", "ADMIN")
                                                // alles andere: angemeldet
                                                .anyRequest().authenticated())
                                .addFilterBefore(new JwtFilter(jwtUtil),
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public AuthenticationManager authenticationManager(
                        AuthenticationConfiguration cfg) throws Exception {
                return cfg.getAuthenticationManager();
        }

        @Bean
        public UserDetailsService userDetailsService(UserRespository repo) {
                return username -> repo.findByUsername(username)
                                .map(u -> User.builder() // Spring-UserDetails
                                                .username(u.getUsername())
                                                .password(u.getPasswordHash()) // muss mit demEncoder übereinstimmen
                                                .roles(u.getRole()) // z.B. "USER" oder "ADMIN"
                                                .build())
                                .orElseThrow(() -> new UsernameNotFoundException("User nicht gefunden"));
        }

        // Bei Rate Limit müssen trotzdem Cors angehängt werden, damit der Browser der
        // die Anfrage annimmt ansonsten schickt das Bucket4j ohne CORS-Header
        @Bean
        public FilterRegistrationBean<CorsFilter> corsFilterRegistration() {
                // 1) Definiere CORS-Regeln
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(List.of("https://localhost:3000"));
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("*"));
                config.setAllowCredentials(true);
                config.setExposedHeaders(List.of("Retry-After", "X-Rate-Limit-Remaining"));

                // 2) URL-Pfade, auf die CORS angewendet wird
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);

                // 3) Erzeuge den Filter
                CorsFilter corsFilter = new CorsFilter(source);

                // 4) Registriere ihn mit höchster Priorität
                FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(corsFilter);
                bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
                bean.addUrlPatterns("/*");
                return bean;
        }
}