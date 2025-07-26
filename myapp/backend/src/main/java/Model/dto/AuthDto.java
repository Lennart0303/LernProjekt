package Model.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotBlank;

public class AuthDto {

  public record AuthRequest(
      @NotBlank(message = "Benutzername darf nicht leer sein") @Size(min = 4, max = 50, message = "Benutzername muss 4–50 Zeichen lang sein") String username,

      @NotBlank(message = "Passwort darf nicht leer sein") @Size(min = 8, message = "Passwort muss mindestens 8 Zeichen lang sein") @Pattern(regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d).+$", message = "Passwort muss Groß-, Kleinbuchstaben und Ziffern enthalten") String password) {
  }

  public record AuthResponse(String accessToken) {
  }

}
