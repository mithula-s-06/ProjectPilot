package com.project.entity;

import org.springframework.data.annotation.Id;
import java.time.LocalDate;

public class Task {
    @Id
    private String id;
    private String name;
    private LocalDate assignedDate;
    private LocalDate deadline;
    private String priority;
    private String status = "Pending"; // Pending, In Progress, Completed
    private String student;
    private String projectName;
    private Boolean reportSubmitted = false;
    private WeeklyReport reportDetails;
    private Boolean isReassigned = false;
    private String reassignFeedback;

    public Task() {}

    public Task(String id, String name, LocalDate assignedDate, LocalDate deadline, String priority, String status, String student) {
        this.id = id;
        this.name = name;
        this.assignedDate = assignedDate;
        this.deadline = deadline;
        this.priority = priority;
        this.status = status;
        this.student = student;
    }

    public Task(String id, String name, LocalDate assignedDate, LocalDate deadline, String priority, String status, String student, String projectName) {
        this.id = id;
        this.name = name;
        this.assignedDate = assignedDate;
        this.deadline = deadline;
        this.priority = priority;
        this.status = status;
        this.student = student;
        this.projectName = projectName;
    }

    public Task(String id, String name, LocalDate assignedDate, LocalDate deadline, String priority, String status, String student, String projectName, Boolean reportSubmitted, WeeklyReport reportDetails, Boolean isReassigned, String reassignFeedback) {
        this.id = id;
        this.name = name;
        this.assignedDate = assignedDate;
        this.deadline = deadline;
        this.priority = priority;
        this.status = status;
        this.student = student;
        this.projectName = projectName;
        this.reportSubmitted = reportSubmitted;
        this.reportDetails = reportDetails;
        this.isReassigned = isReassigned;
        this.reassignFeedback = reassignFeedback;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDate getAssignedDate() { return assignedDate; }
    public void setAssignedDate(LocalDate assignedDate) { this.assignedDate = assignedDate; }

    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getStudent() { return student; }
    public void setStudent(String student) { this.student = student; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public Boolean getReportSubmitted() { return reportSubmitted; }
    public void setReportSubmitted(Boolean reportSubmitted) { this.reportSubmitted = reportSubmitted; }

    public WeeklyReport getReportDetails() { return reportDetails; }
    public void setReportDetails(WeeklyReport reportDetails) { this.reportDetails = reportDetails; }

    public Boolean getIsReassigned() { return isReassigned; }
    public void setIsReassigned(Boolean isReassigned) { this.isReassigned = isReassigned; }

    public String getReassignFeedback() { return reassignFeedback; }
    public void setReassignFeedback(String reassignFeedback) { this.reassignFeedback = reassignFeedback; }
}
