package Model.Classes;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class Meal {
    private int id;
    @NotBlank(message = "Name darf nicht leer sein")
    @Size(min = 3, max = 100, message = "Name muss 3–100 Zeichen lang sein")
    private String name;

    @NotBlank(message = "Beschreibung darf nicht leer sein")
    @Size(min = 5, max = 500, message = "Beschreibung muss 5–500 Zeichen lang sein")
    private String description;


    // Default
    public Meal() {
    }

    // Neues Gericht
    public Meal(String name, String description) {
        this.name = name;
        this.description = description;
    }

    // Bestehendes Gericht
    public Meal(int id, String name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
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

}
