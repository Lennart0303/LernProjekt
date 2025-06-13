package Model.Database;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import Model.Classes.Meal;
import java.util.List;

@Repository
public class MealRepository {
    private final JdbcTemplate jbdc;

    public MealRepository(JdbcTemplate template) {
        this.jbdc = template;
    }

    public List<Meal> getAllMeals() {
        try {
            return jbdc.query("SELECT * FROM MEAL",
                    (rs, rowNum) -> {
                        Meal meal = new Meal(
                                rs.getInt("id"),
                                rs.getString("mealName"),
                                rs.getString("mealDescription"),
                                rs.getInt("imageID"));
                        return meal;
                    });
        } catch (Exception e) {
            System.out.println("Error while fetching meals: " + e.getMessage());
            return List.of(); // Return an empty list in case of error
        }
    }

    public List<Meal> getMealByName(String query) {
        if (query == null || query.isEmpty()) {
            return getAllMeals();
        }
        String wildcad = "%" + query.trim() + "%";
        try {
            return jbdc.query("SELECT * FROM MEAL WHERE mealName LIKE ?",
                    (rs, rowNum) -> {
                        Meal meal = new Meal(
                                rs.getInt("id"),
                                rs.getString("mealName"),
                                rs.getString("mealDescription"),
                                rs.getInt("imageID"));
                        return meal;
                    }, wildcad);
        } catch (Exception e) {
            System.out.println("Error while fetching meals: " + e.getMessage());
            return List.of(); // Return an empty list in case of error
        }
    }

    public Meal getMealByID(int id) {
        try {
            return jbdc.queryForObject("SELECT * FROM MEAL WHERE id=?",
                    (rs, rowNum) -> {
                        Meal meal = new Meal(
                                rs.getInt("id"),
                                rs.getString("mealName"),
                                rs.getString("mealDescription"),
                                rs.getInt("imageID"));
                        return meal;
                    }, id);
        } catch (Exception e) {
            System.out.println("Error while fetching meal by ID: " + e.getMessage());
            return null; // Return null in case of error
        }

    }

    public int createMeal(Meal meal) {
        try {
            return jbdc.update("INSERT INTO MEAL (mealName, mealDescription, imageID) VALUES(?,?,?)",
                    meal.getName(),
                    meal.getDescription(),
                    meal.getImageID());
        } catch (Exception e) {
            System.out.println("Error while creating meal: " + e.getMessage());
            return 0; // Return 0 in case of error
        }
    }
}
