package Model.Controller;

import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
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
public class FeedbackController {
    private final FeedbackRepository repo;

    public FeedbackController(FeedbackRepository repo) {
        this.repo = repo;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<Feedback>> getAllFeedback() {
        return ResponseEntity.ok(repo.getFeedback());
    }

    @PreAuthorize("hasRole('USER')  or hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Feedback> createFeedback(@Valid @RequestBody Feedback feedback) {
        int success = repo. createFeedback(feedback);
        if (success > 0) {
            return ResponseEntity.ok(feedback);
        } else {
            throw new RuntimeException("Feedback konnte nicht gespeichert werden");
        }
    }

}
