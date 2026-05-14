package Model.Controller;

import Model.Classes.User;
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

    record RoleUpdateRequest(String role) {}

    public UserController(UserRespository repo) {
        this.repo = repo;
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
