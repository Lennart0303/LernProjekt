package Model.Controller;

import Model.Database.AnalyticsRepository;
import Model.dto.DashboardStatsDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminDashboardController {
    private final AnalyticsRepository analyticsRepo;

    public AdminDashboardController(AnalyticsRepository analyticsRepo) {
        this.analyticsRepo = analyticsRepo;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(new DashboardStatsDto(
            analyticsRepo.countTotalUsers(),
            analyticsRepo.countTotalMeals(),
            analyticsRepo.countTotalFeedback(),
            analyticsRepo.countTotalVisits(),
            analyticsRepo.countWeeklyVisits()
        ));
    }
}
