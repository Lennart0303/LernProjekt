package Model.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Model.Database.FeedbackRepository;
import Model.Classes.Feedback;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "https://localhost:3000")
public class FeedbackController {
    private final FeedbackRepository repo;

    public FeedbackController(FeedbackRepository repo) {
        this.repo = repo;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<Feedback>> getAllMeals() {
        List<Feedback> feedbacks = repo.getFeedback();
        if (feedbacks.isEmpty()) {
            return ResponseEntity.status(500).body(null);
        } else {
            return ResponseEntity.ok(feedbacks);
        }
    }

    @PreAuthorize("hasRole('USER')  or hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Feedback> createMeal(@RequestBody Feedback feedback) {
        int success = repo. createFeedback(feedback);
        if (success > 0) {
            return ResponseEntity.ok(feedback);
        } else {
            return ResponseEntity.status(500).body(null);
        }
    }

}
