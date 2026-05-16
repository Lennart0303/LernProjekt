package Model.Controller;

import Model.Database.AnalyticsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
    private final AnalyticsRepository analyticsRepo;

    public AnalyticsController(AnalyticsRepository analyticsRepo) {
        this.analyticsRepo = analyticsRepo;
    }

    @PostMapping("/track")
    public ResponseEntity<Void> trackVisit() {
        analyticsRepo.trackVisit();
        return ResponseEntity.noContent().build();
    }
}
