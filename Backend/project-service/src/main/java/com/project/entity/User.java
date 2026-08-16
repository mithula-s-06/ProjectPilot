package com.project.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;

    private String email;

    private String department;

    private String role;

    private String team;

    private String collegeName;

    private String yearOfStudy;
    private String resumeId;
    private String resumeName;
    private String resumeUrl;
    private java.util.List<String> skills;

    private Boolean feedbackNotifications = true;
    private Boolean reportDueAlerts = true;
    private Boolean riskAlerts = true;

    public User() {
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getTeam() { return team; }
    public void setTeam(String team) { this.team = team; }
    public String getCollegeName() { return collegeName; }
    public void setCollegeName(String collegeName) { this.collegeName = collegeName; }

    public String getYearOfStudy() { return yearOfStudy; }
    public void setYearOfStudy(String yearOfStudy) { this.yearOfStudy = yearOfStudy; }
    public String getResumeId() { return resumeId; }
    public void setResumeId(String resumeId) { this.resumeId = resumeId; }
    public String getResumeName() { return resumeName; }
    public void setResumeName(String resumeName) { this.resumeName = resumeName; }
    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
    public java.util.List<String> getSkills() { return skills; }
    public void setSkills(java.util.List<String> skills) { this.skills = skills; }

    public Boolean getFeedbackNotifications() { return feedbackNotifications; }
    public void setFeedbackNotifications(Boolean feedbackNotifications) { this.feedbackNotifications = feedbackNotifications; }
    public Boolean getReportDueAlerts() { return reportDueAlerts; }
    public void setReportDueAlerts(Boolean reportDueAlerts) { this.reportDueAlerts = reportDueAlerts; }
    public Boolean getRiskAlerts() { return riskAlerts; }
    public void setRiskAlerts(Boolean riskAlerts) { this.riskAlerts = riskAlerts; }
}
