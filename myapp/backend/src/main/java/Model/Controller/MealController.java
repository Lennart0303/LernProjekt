package Model.Controller;

import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import Model.Database.MealRepository;
import Model.Database.UserRespository;
import java.util.List;
import Model.Classes.Meal;

@RestController
@RequestMapping("/api/meal")
public class MealController {
    private final MealRepository mealRepository;
    private final UserRespository userRespository;

    public MealController(MealRepository mealRepository, UserRespository userRespository) {
        this.mealRepository = mealRepository;
        this.userRespository = userRespository;
    }

    private int getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRespository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<Meal>> getAllMeals() {
        List<Meal> meals = mealRepository.getAllMeals(getCurrentUserId());
        return ResponseEntity.ok(meals);
    }

    @PreAuthorize("hasRole('USER')  or hasRole('ADMIN')")
    @GetMapping("/search")
    public ResponseEntity<List<Meal>> getMealByID(@RequestParam(name = "q", required = false) String query) {
        List<Meal> queryMeal = mealRepository.getMealByName(query, getCurrentUserId());
        return ResponseEntity.ok(queryMeal);
    }

    @PreAuthorize("hasRole('USER')  or hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<Meal> getMealByID(@PathVariable int id) {
        Meal meal = mealRepository.getMealByID(id);
        if (meal == null || meal.getUserId() != getCurrentUserId()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(meal);
    }

    @PreAuthorize("hasRole('USER')  or hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Meal> createMeal(@Valid @RequestBody Meal meal) {
        meal.setUserId(getCurrentUserId());
        mealRepository.createMeal(meal);
        return ResponseEntity.ok(meal);
    }

}
