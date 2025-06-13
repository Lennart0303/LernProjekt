package Model.Classes;

public class Feedback {
    private int id;
    private String feedback;

    public Feedback() {
    }

    public Feedback(String feedback){
        this.feedback = feedback;
    }
    public Feedback(int id, String feedback){
        this.id = id;
        this.feedback = feedback;
    }

    public int getID(){
        return id;
    }

    public String getFeedback(){
        return feedback;
    }

    public void setID(int id){
        this.id = id;
    }

    public void setFeedback(String feedback){
        this.feedback = feedback;
    }
}
