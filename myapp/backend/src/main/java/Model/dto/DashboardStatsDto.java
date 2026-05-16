package Model.dto;

public record DashboardStatsDto(
    int totalUsers,
    int totalMeals,
    int totalFeedback,
    int totalVisits,
    int weeklyVisits
) {}
