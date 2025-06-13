package Model.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import Model.Database.MealRepository;
import java.util.List;
import Model.Classes.Meal;

@RestController
@RequestMapping("/api/meal")
@CrossOrigin(origins = "http://localhost:3000")
public class MealController {
    private final MealRepository mealRepository;

    public MealController(MealRepository mealRepository) {
        this.mealRepository = mealRepository;
    }

    @GetMapping
    public ResponseEntity<List<Meal>> getAllMeals() {
        List<Meal> meals = mealRepository.getAllMeals();
        if (meals.isEmpty()) {
            return ResponseEntity.status(500).body(null);
        } else {
            return ResponseEntity.ok(mealRepository.getAllMeals());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Meal>> getMealByID(@RequestParam(name = "q", required = false) String query){
        List<Meal> queryMeal = mealRepository.getMealByName(query);
        return ResponseEntity.ok(queryMeal);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Meal> getMealByID(@PathVariable int id) {
        Meal meal = mealRepository.getMealByID(id);
        if(meal == null){
            return ResponseEntity.status(500).body(null);
        }else {
            return ResponseEntity.ok(meal);
        }
    }

    @PostMapping
    public ResponseEntity<Meal> createMeal(@RequestBody Meal meal){
        int success = mealRepository.createMeal(meal);
        if (success>0){
            return ResponseEntity.ok(meal);
        }else {
            return ResponseEntity.status(500).body(null);
        }
    }

}
