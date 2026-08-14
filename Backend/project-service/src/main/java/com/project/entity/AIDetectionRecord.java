package com.project.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "ai_detection_records")
public class AIDetectionRecord {

    @Id
    private String id;
    private String reportId;
    private String text;
    private Double aiGeneratedScore;
    private LocalDateTime analyzedAt;

    public AIDetectionRecord() {}

    public AIDetectionRecord(String reportId, String text, Double aiGeneratedScore) {
        this.reportId = reportId;
        this.text = text;
        this.aiGeneratedScore = aiGeneratedScore;
        this.analyzedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getReportId() { return reportId; }
    public void setReportId(String reportId) { this.reportId = reportId; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public Double getAiGeneratedScore() { return aiGeneratedScore; }
    public void setAiGeneratedScore(Double aiGeneratedScore) { this.aiGeneratedScore = aiGeneratedScore; }

    public LocalDateTime getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; }
}
