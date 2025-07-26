package Model.Classes;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class Feedback {
    private int id;

    @NotBlank(message = "Feedback darf nicht leer sein")
    @Size(min = 3, max = 1024, message = "Feedback muss 3–1024 Zeichen lang sein")
    private String feedback;

    public Feedback() {
    }

    public Feedback(String feedback) {
        this.feedback = feedback;
    }

    public Feedback(int id, String feedback) {
        this.id = id;
        this.feedback = feedback;
    }

    public int getID() {
        return id;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setID(int id) {
        this.id = id;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}
