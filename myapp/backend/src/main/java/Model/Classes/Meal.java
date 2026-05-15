package Model.Classes;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class Meal {
    private int id;
    @NotBlank(message = "Name darf nicht leer sein")
    @Size(min = 3, max = 100, message = "Name muss 3–100 Zeichen lang sein")
    private String name;

    @NotBlank(message = "Beschreibung darf nicht leer sein")
    @Size(min = 5, max = 1500, message = "Beschreibung muss 5–1500 Zeichen lang sein")
    private String description;

    @Min(value = 1, message = "Kalorien müssen mindestens 1 sein")
    private int calories;

    private int userId;


    // Default
    public Meal() {
    }

    // Neues Gericht
    public Meal(String name, String description) {
        this.name = name;
        this.description = description;
    }

    // Neues Gericht mit Kalorien
    public Meal(String name, String description, int calories) {
        this.name = name;
        this.description = description;
        this.calories = calories;
    }

    // Bestehendes Gericht
    public Meal(int id, String name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }

    // Bestehendes Gericht mit Kalorien und User
    public Meal(int id, String name, String description, int calories, int userId) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.calories = calories;
        this.userId = userId;
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

    public int getCalories() {
        return calories;
    }

    public int getUserId() {
        return userId;
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

    public void setCalories(int calories) {
        this.calories = calories;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

}
