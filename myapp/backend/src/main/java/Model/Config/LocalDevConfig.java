package Model.Config;

import Model.Classes.User;
import Model.Database.UserRespository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("local")
public class LocalDevConfig {

    @Bean
    public CommandLineRunner seedAdminUser(UserRespository repo, PasswordEncoder encoder) {
        return args -> {
            if (repo.findByUsername("admin").isEmpty()) {
                String hash = encoder.encode("Admin123");
                repo.creatUser(new User("admin", hash, "ADMIN"));
                System.out.println("[DEV] Admin-User angelegt. Benutzername: admin");
            }
        };
    }
}
