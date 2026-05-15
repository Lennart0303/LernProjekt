package Model.Database;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import Model.Classes.Meal;
import java.util.List;

@Repository
public class MealRepository {
    private static final Logger log = LoggerFactory.getLogger(MealRepository.class);
    private final JdbcTemplate jbdc;

    public MealRepository(JdbcTemplate template) {
        this.jbdc = template;
    }

    public List<Meal> getAllMeals(int userId) {
        try {
            return jbdc.query("SELECT * FROM MEAL WHERE user_id = ?",
                    (rs, rowNum) -> new Meal(
                            rs.getInt("id"),
                            rs.getString("mealName"),
                            rs.getString("mealDescription"),
                            rs.getInt("calories"),
                            rs.getInt("user_id")),
                    userId);
        } catch (Exception e) {
            log.error("Error while fetching meals", e);
            return List.of();
        }
    }

    public List<Meal> getMealByName(String query, int userId) {
        if (query == null || query.isEmpty()) {
            return getAllMeals(userId);
        }
        String wildcard = "%" + query.trim() + "%";
        try {
            return jbdc.query("SELECT * FROM MEAL WHERE mealName LIKE ? AND user_id = ?",
                    (rs, rowNum) -> new Meal(
                            rs.getInt("id"),
                            rs.getString("mealName"),
                            rs.getString("mealDescription"),
                            rs.getInt("calories"),
                            rs.getInt("user_id")),
                    wildcard, userId);
        } catch (Exception e) {
            log.error("Error while fetching meals by name", e);
            return List.of();
        }
    }

    public Meal getMealByID(int id) {
        try {
            return jbdc.queryForObject("SELECT * FROM MEAL WHERE id=?",
                    (rs, rowNum) -> new Meal(
                            rs.getInt("id"),
                            rs.getString("mealName"),
                            rs.getString("mealDescription"),
                            rs.getInt("calories"),
                            rs.getInt("user_id")),
                    id);
        } catch (Exception e) {
            log.error("Error while fetching meal by ID", e);
            return null;
        }
    }

    public int createMeal(Meal meal) {
        try {
            return jbdc.update("INSERT INTO MEAL (mealName, mealDescription, calories, user_id) VALUES(?,?,?,?)",
                    meal.getName(),
                    meal.getDescription(),
                    meal.getCalories(),
                    meal.getUserId());
        } catch (Exception e) {
            log.error("Error while creating meal", e);
            return 0;
        }
    }
}
