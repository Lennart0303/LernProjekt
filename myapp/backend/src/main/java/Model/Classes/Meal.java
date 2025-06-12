package Model.Classes;

public class Meal {
    private int id;
    private String name;
    private String description;
    private int imageID;

    //Default
    public Meal() {}

    // Neues Gericht
    public Meal(String name, String description, int imageID){
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
    public void setID(int id){
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
