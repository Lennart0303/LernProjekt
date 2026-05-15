package Model.Database;

import Model.Classes.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository

public class UserRespository {
    private static final Logger log = LoggerFactory.getLogger(UserRespository.class);
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
            log.error("Error while fetching users", e);
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
                            rs.getString("passwordHash"),
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

    public int deleteUser(int id) {
        return jdbc.update("DELETE FROM users WHERE id = ?", id);
    }

    public int updateRole(int id, String role) {
        return jdbc.update("UPDATE users SET role = ? WHERE id = ?", role, id);
    }

}
