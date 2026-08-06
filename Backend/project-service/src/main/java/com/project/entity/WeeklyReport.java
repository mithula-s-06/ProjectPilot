package com.project.entity;

import org.springframework.data.annotation.Id;
import java.time.LocalDate;

public class WeeklyReport {
    @Id
    private String id;
    private String week; // e.g. "Week 1 (Sprint 1 Summary)"
    private String title;
    private String submissionStatus = "Pending"; // Submitted, Pending
    private LocalDate submittedDate;
    private String remarks; // Mentor remarks / grades
    private String fileUrl; // Path to submitted document
    private String fileName;
    private String fileSize;
    private String feedback;

    public WeeklyReport() {}

    public WeeklyReport(String id, String week, String submissionStatus, LocalDate submittedDate, String remarks, String fileUrl) {
        this.id = id;
        this.week = week;
        this.submissionStatus = submissionStatus;
        this.submittedDate = submittedDate;
        this.remarks = remarks;
        this.fileUrl = fileUrl;
    }

    public WeeklyReport(String id, String week, String title, String submissionStatus, LocalDate submittedDate, String remarks, String fileUrl, String fileName, String fileSize, String feedback) {
        this.id = id;
        this.week = week;
        this.title = title;
        this.submissionStatus = submissionStatus;
        this.submittedDate = submittedDate;
        this.remarks = remarks;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
        this.fileSize = fileSize;
        this.feedback = feedback;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getWeek() { return week; }
    public void setWeek(String week) { this.week = week; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSubmissionStatus() { return submissionStatus; }
    public void setSubmissionStatus(String status) { this.submissionStatus = status; }

    public LocalDate getSubmittedDate() { return submittedDate; }
    public void setSubmittedDate(LocalDate submittedDate) { this.submittedDate = submittedDate; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileSize() { return fileSize; }
    public void setFileSize(String fileSize) { this.fileSize = fileSize; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
}
