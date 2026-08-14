package com.project.service;

import com.project.entity.WeeklyReport;
import com.project.entity.DBFile;
import com.project.entity.SimilarityRecord;
import com.project.entity.AIDetectionRecord;
import com.project.repository.DBFileRepository;
import com.project.repository.SimilarityRecordRepository;
import com.project.repository.AIDetectionRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;

@Service
public class AIService {

    private final SimilarityService similarityService;
    private final AIDetectionService aiDetectionService;
    private final DBFileRepository dbFileRepository;
    private final SimilarityRecordRepository similarityRecordRepository;
    private final AIDetectionRecordRepository aiDetectionRecordRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String FILE_ANALYSIS_URL = "http://localhost:8083/api/ai/analyze-file";

    public AIService(
            SimilarityService similarityService, 
            AIDetectionService aiDetectionService,
            DBFileRepository dbFileRepository,
            SimilarityRecordRepository similarityRecordRepository,
            AIDetectionRecordRepository aiDetectionRecordRepository) {
        this.similarityService = similarityService;
        this.aiDetectionService = aiDetectionService;
        this.dbFileRepository = dbFileRepository;
        this.similarityRecordRepository = similarityRecordRepository;
        this.aiDetectionRecordRepository = aiDetectionRecordRepository;
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

        // If there is an attached file, use the Python file analysis endpoint!
        if (dbFile != null && dbFile.getData() != null) {
            try {
                String fileContentBase64 = Base64.getEncoder().encodeToString(dbFile.getData());

                // Prepare comparison texts with cached extracted texts where possible
                List<Map<String, String>> compareTexts = new ArrayList<>();
                for (WeeklyReport prev : previousReports) {
                    if (!prev.getId().equals(report.getId())) {
                        String prevText = prev.getRemarks();
                        
                        // Query cache from similarity records
                        SimilarityRecord cached = similarityRecordRepository.findByReportId(prev.getId())
                                .stream().findFirst().orElse(null);
                        if (cached != null && cached.getTargetText() != null && !cached.getTargetText().isEmpty()) {
                            prevText = cached.getTargetText();
                        }

                        if (prevText != null && !prevText.trim().isEmpty()) {
                            Map<String, String> doc = new HashMap<>();
                            doc.put("id", prev.getId());
                            doc.put("text", prevText);
                            compareTexts.add(doc);
                        }
                    }
                }

                Map<String, Object> request = new HashMap<>();
                request.put("file_content_base64", fileContentBase64);
                request.put("content_type", dbFile.getContentType());
                request.put("file_name", dbFile.getFileName());
                request.put("remarks", report.getRemarks() != null ? report.getRemarks() : "");
                request.put("compare_texts", compareTexts);

                Map<String, Object> response = restTemplate.postForObject(FILE_ANALYSIS_URL, request, Map.class);
                if (response != null) {
                    Number simScore = (Number) response.get("similarityScore");
                    String matchedId = (String) response.get("matchedReportId");
                    Number aiScore = (Number) response.get("aiProbability");
                    String extractedText = (String) response.get("extractedText");

                    report.setSimilarityScore(simScore != null ? simScore.doubleValue() : 0.0);
                    report.setMatchedReportId(matchedId != null ? matchedId : "");
                    report.setAiGeneratedScore(aiScore != null ? aiScore.doubleValue() : 0.0);

                    // Cache results to MongoDB records
                    String combinedText = (report.getRemarks() != null ? report.getRemarks() : "") 
                            + "\n" + (extractedText != null ? extractedText : "");
                    similarityRecordRepository.save(new SimilarityRecord(report.getId(), combinedText, report.getMatchedReportId(), report.getSimilarityScore()));
                    aiDetectionRecordRepository.save(new AIDetectionRecord(report.getId(), combinedText, report.getAiGeneratedScore()));

                    report.setIsFlagged(report.getSimilarityScore() >= 30.0 || report.getAiGeneratedScore() >= 70.0);
                    return; // Successfully processed via file extractor endpoint!
                }
            } catch (Exception e) {
                System.err.println("FastAPI base64 file analysis failed. Falling back to default remarks checkers: " + e.getMessage());
            }
        }

        // 2. Standard Fallback / remarks-only checks
        similarityService.checkSimilarity(report, previousReports);
        aiDetectionService.detectAI(report);

        // Evaluate Thresholds (Similarity > 30% or AI > 70% flags a warning)
        boolean exceedsSimilarity = report.getSimilarityScore() >= 30.0;
        boolean exceedsAI = report.getAiGeneratedScore() >= 70.0;
        report.setIsFlagged(exceedsSimilarity || exceedsAI);
    }
}
