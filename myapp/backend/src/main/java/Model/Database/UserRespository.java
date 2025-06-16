package Model.Database;

import Model.Classes.User;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository

public class UserRespository {
    private final JdbcTemplate jdbc;

    public UserRespository(JdbcTemplate jbdc) {
        this.jdbc = jbdc;
    }

    public List<User> getAllUser() {
        try {
            return jdbc.query("SELECT id, username, role FROM users",
                    (rs, rowNum) -> {
                        User user = new User(
                                rs.getInt("id"),
                                rs.getString("username"),
                                rs.getString("role"));
                        return user;
                    });
        } catch (Exception e) {
            System.out.println("Error while fetching User: " + e.getMessage());
            return List.of(); // Return an empty list in case of error
        }
    }

    public Optional<User> findByUsername(String username) {
        String sql = "SELECT id, username, passwordHash, role FROM users WHERE username = ?";
        try {
            User u = jdbc.queryForObject(sql,
                    (rs, rn) -> new User(
                            rs.getInt("id"),
                            rs.getString("username"),
                            rs.getString("passwordH ash"),
                            rs.getString("role")),
                    username);
            return Optional.of(u);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public int creatUser(User user) {
        return jdbc.update(
                "INSERT INTO users(username, passwordHash, role) VALUES(?,?,?)",
                user.getUsername(),
                user.getPasswordHash(),
                user.getRole());
    }

}
