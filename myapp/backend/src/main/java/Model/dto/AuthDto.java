package Model.dto;

public class AuthDto {

    public record AuthRequest(String username, String password) {
    }

    public record AuthResponse(String accessToken) {
    }

}
