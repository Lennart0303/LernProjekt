package Database;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import Classes.Meal;
import java.util.List;

@Repository
public class MealRepository {
    private final JdbcTemplate jbdc;

    public MealRepository(JdbcTemplate template) {
        this.jbdc = template;
    }

    public List<Meal> getAllMeals() {
        return jbdc.query("SELECT * FROM meal",
                (rs, rowNum) -> {
                    Meal meal = new Meal(rs.getInt("id"), rs.getString("name"), rs.getString("description"),
                            rs.getInt("imageID"));
                    return meal;
                });
    }

    public Meal getMealByID(int id) {
        return jbdc.queryForObject("SELECT * FROM meal WHERE id=?",
                (rs, rowNum) -> {
                    Meal meal = new Meal(rs.getInt("id"), rs.getString("name"), rs.getString("description"),
                            rs.getInt("imageID"));
                    return meal;
                }, id);
    }

    public int createMeal(Meal meal){
        return 1; // Placeholder for actual implementation TODO

    }
}
