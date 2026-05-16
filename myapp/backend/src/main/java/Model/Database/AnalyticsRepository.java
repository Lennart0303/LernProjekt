package Model.Database;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AnalyticsRepository {
    private static final Logger log = LoggerFactory.getLogger(AnalyticsRepository.class);
    private final JdbcTemplate jdbc;

    public AnalyticsRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void trackVisit() {
        try {
            jdbc.update("INSERT INTO page_visits (visited_at) VALUES (CURRENT_TIMESTAMP)");
        } catch (Exception e) {
            log.error("Error tracking visit", e);
        }
    }

    public int countTotalVisits() {
        try {
            Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM page_visits", Integer.class);
            return count != null ? count : 0;
        } catch (Exception e) {
            log.error("Error counting visits", e);
            return 0;
        }
    }

    public int countWeeklyVisits() {
        try {
            Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM page_visits WHERE visited_at >= datetime('now', '-7 days')",
                Integer.class
            );
            return count != null ? count : 0;
        } catch (Exception e) {
            log.error("Error counting weekly visits", e);
            return 0;
        }
    }

    public int countTotalUsers() {
        try {
            Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
            return count != null ? count : 0;
        } catch (Exception e) {
            log.error("Error counting users", e);
            return 0;
        }
    }

    public int countTotalMeals() {
        try {
            Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM MEAL", Integer.class);
            return count != null ? count : 0;
        } catch (Exception e) {
            log.error("Error counting meals", e);
            return 0;
        }
    }

    public int countTotalFeedback() {
        try {
            Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM FEEDBACK", Integer.class);
            return count != null ? count : 0;
        } catch (Exception e) {
            log.error("Error counting feedback", e);
            return 0;
        }
    }
}
