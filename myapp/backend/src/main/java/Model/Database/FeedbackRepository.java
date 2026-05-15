package Model.Database;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import Model.Classes.Feedback;

import java.util.List;

@Repository
public class FeedbackRepository {
    private static final Logger log = LoggerFactory.getLogger(FeedbackRepository.class);
    private final JdbcTemplate jbdc;

    public FeedbackRepository(JdbcTemplate jbdc) {
        this.jbdc = jbdc;
    }

    public List<Feedback> getFeedback() {
        try {
            return jbdc.query("SELECT id, feedback FROM FEEDBACK",
                    (rs, rowNum) -> {
                        Feedback result = new Feedback(
                                rs.getInt("id"),
                                rs.getString("feedback"));
                        return result;
                    });
        } catch (Exception e) {
            log.error("Error while fetching feedback", e);
            return List.of(); // Return an empty list in case of error
        }
    }

    public int createFeedback(Feedback feedback) {
        try {
            return jbdc.update("INSERT INTO Feedback (feedback) VALUES(?)",
                    feedback.getFeedback());
        } catch (Exception e) {
            log.error("Error while creating feedback", e);
            return 0; // Return 0 in case of error
        }
    }
}
