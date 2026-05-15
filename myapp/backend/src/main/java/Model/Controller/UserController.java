package Model.Controller;

import Model.Classes.User;
import Model.Database.MealRepository;
import Model.Database.UserRespository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRespository repo;
    private final MealRepository mealRepo;

    record RoleUpdateRequest(String role) {}
    record UserProfileResponse(String username, int mealCount) {}

    public UserController(UserRespository repo, MealRepository mealRepo) {
        this.repo = repo;
        this.mealRepo = mealRepo;
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getOwnProfile(Principal principal) {
        User user = repo.findByUsername(principal.getName()).orElseThrow();
        int mealCount = mealRepo.countMealsByUserId(user.getId());
        return ResponseEntity.ok(new UserProfileResponse(user.getUsername(), mealCount));
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteOwnAccount(Principal principal) {
        User user = repo.findByUsername(principal.getName()).orElseThrow();
        repo.deleteUser(user.getId());
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(repo.getAllUser());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable int id, Principal principal) {
        User self = repo.findByUsername(principal.getName()).orElseThrow();
        if (self.getId() == id) {
            return ResponseEntity.badRequest().build();
        }
        repo.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/role")
    public ResponseEntity<Void> updateRole(@PathVariable int id, @RequestBody RoleUpdateRequest req, Principal principal) {
        if (!Set.of("USER", "ADMIN").contains(req.role())) {
            return ResponseEntity.badRequest().build();
        }
        User self = repo.findByUsername(principal.getName()).orElseThrow();
        if (self.getId() == id) {
            return ResponseEntity.badRequest().build();
        }
        repo.updateRole(id, req.role());
        return ResponseEntity.ok().build();
    }
}
