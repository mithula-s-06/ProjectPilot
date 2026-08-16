package com.project.service;

import com.project.entity.WeeklyReport;
import com.project.entity.DBFile;
import com.project.entity.SimilarityRecord;
import com.project.entity.AIDetectionRecord;
import com.project.repository.DBFileRepository;
import com.project.repository.SimilarityRecordRepository;
import com.project.repository.AIDetectionRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AIService {

    private final SimilarityService similarityService;
    private final DBFileRepository dbFileRepository;
    private final SimilarityRecordRepository similarityRecordRepository;
    private final AIDetectionRecordRepository aiDetectionRecordRepository;
    private final GeminiService geminiService;

    public AIService(
            SimilarityService similarityService, 
            DBFileRepository dbFileRepository,
            SimilarityRecordRepository similarityRecordRepository,
            AIDetectionRecordRepository aiDetectionRecordRepository,
            GeminiService geminiService) {
        this.similarityService = similarityService;
        this.dbFileRepository = dbFileRepository;
        this.similarityRecordRepository = similarityRecordRepository;
        this.aiDetectionRecordRepository = aiDetectionRecordRepository;
        this.geminiService = geminiService;
    }

    public void analyzeReport(WeeklyReport report, List<WeeklyReport> previousReports) {
        // 1. Resolve attached file if any
        String fileId = null;
        String fileUrl = report.getFileUrl();
        if (fileUrl != null && fileUrl.contains("/download/")) {
            fileId = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
        }

        DBFile dbFile = null;
        if (fileId != null) {
            dbFile = dbFileRepository.findById(fileId).orElse(null);
        }

        String extractedText = "";
        if (dbFile != null && dbFile.getData() != null) {
            try {
                // Extract document text using Gemini
                extractedText = geminiService.extractTextFromDocument(
                    dbFile.getData(), 
                    dbFile.getContentType(), 
                    dbFile.getFileName()
                );
            } catch (Exception e) {
                System.err.println("[AIService] Gemini file extraction failed: " + e.getMessage());
            }
        }

        // Combine student remarks with any extracted text
        String originalRemarks = report.getRemarks() != null ? report.getRemarks() : "";
        String combinedText = originalRemarks;
        if (extractedText != null && !extractedText.trim().isEmpty()) {
            combinedText = originalRemarks + "\n" + extractedText;
        }

        // 2. AI Text Detection
        double aiScore = 0.0;
        try {
            aiScore = geminiService.detectAIGenerated(combinedText);
        } catch (Exception e) {
            System.err.println("[AIService] Gemini AI detection failed: " + e.getMessage());
        }
        report.setAiGeneratedScore(aiScore);

        // Cache AI detection record to database
        aiDetectionRecordRepository.save(new AIDetectionRecord(report.getId(), combinedText, report.getAiGeneratedScore()));

        // 3. Semantic Similarity checking
        try {
            similarityService.checkSimilarity(report, previousReports, combinedText);
        } catch (Exception e) {
            System.err.println("[AIService] Similarity check failed: " + e.getMessage());
        }

        // Evaluate thresholds: Similarity >= 50% or AI probability >= 60% flags the report
        boolean exceedsSimilarity = report.getSimilarityScore() >= 50.0;
        boolean exceedsAI = report.getAiGeneratedScore() >= 60.0;
        report.setIsFlagged(exceedsSimilarity || exceedsAI);
    }
}
