package com.project.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    private String title;
    private String message;
    private String time;
    private String date;
    private String type; // info, success, warning, danger
    private String targetEmail;
    private String targetTeam;

    public Notification() {}

    public Notification(String id, String title, String message, String time, String date, String type, String targetEmail, String targetTeam) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.time = time;
        this.date = date;
        this.type = type;
        this.targetEmail = targetEmail;
        this.targetTeam = targetTeam;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTargetEmail() { return targetEmail; }
    public void setTargetEmail(String targetEmail) { this.targetEmail = targetEmail; }

    public String getTargetTeam() { return targetTeam; }
    public void setTargetTeam(String targetTeam) { this.targetTeam = targetTeam; }
}
