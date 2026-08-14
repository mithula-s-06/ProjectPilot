package com.project.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "similarity_records")
public class SimilarityRecord {

    @Id
    private String id;
    private String reportId;
    private String targetText;
    private String matchedReportId;
    private Double similarityScore;
    private LocalDateTime analyzedAt;

    public SimilarityRecord() {}

    public SimilarityRecord(String reportId, String targetText, String matchedReportId, Double similarityScore) {
        this.reportId = reportId;
        this.targetText = targetText;
        this.matchedReportId = matchedReportId;
        this.similarityScore = similarityScore;
        this.analyzedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getReportId() { return reportId; }
    public void setReportId(String reportId) { this.reportId = reportId; }

    public String getTargetText() { return targetText; }
    public void setTargetText(String targetText) { this.targetText = targetText; }

    public String getMatchedReportId() { return matchedReportId; }
    public void setMatchedReportId(String matchedReportId) { this.matchedReportId = matchedReportId; }

    public Double getSimilarityScore() { return similarityScore; }
    public void setSimilarityScore(Double similarityScore) { this.similarityScore = similarityScore; }

    public LocalDateTime getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; }
}
