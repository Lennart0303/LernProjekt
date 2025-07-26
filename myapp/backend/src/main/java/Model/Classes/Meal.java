package Model.Classes;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Positive;

public class Meal {
    private int id;
    @NotBlank(message = "Name darf nicht leer sein")
    @Size(min = 3, max = 100, message = "Name muss 3–100 Zeichen lang sein")
    private String name;

    @NotBlank(message = "Beschreibung darf nicht leer sein")
    @Size(min = 5, max = 500, message = "Beschreibung muss 5–500 Zeichen lang sein")
    private String description;

    @Positive(message = "imageID muss positiv sein")
    private int imageID;

    // Default
    public Meal() {
    }

    // Neues Gericht
    public Meal(String name, String description, int imageID) {
        this.name = name;
        this.description = description;
        this.imageID = imageID;
    }

    // Bestehendes Gericht
    public Meal(int id, String name, String description, int imageID) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.imageID = imageID;
    }

    // Getter
    public int getID() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public int getImageID() {
        return imageID;
    }

    // SETTER
    public void setID(int id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setImageID(int imageID) {
        this.imageID = imageID;
    }
}
