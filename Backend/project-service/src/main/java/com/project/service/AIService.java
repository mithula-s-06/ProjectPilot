package com.project.service;

import com.project.entity.WeeklyReport;
import com.project.entity.DBFile;
import com.project.entity.SimilarityRecord;
import com.project.entity.AIDetectionRecord;
import com.project.repository.DBFileRepository;
import com.project.repository.SimilarityRecordRepository;
import com.project.repository.AIDetectionRecordRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Single, clean AI Service bridge for project-service.
 * Communicates with the standalone Python ai-service microservice (Port 8083).
 */
@Service
public class AIService {

    @Value("${ai.service.url:http://localhost:8083}")
    private String aiServiceUrl;

    private final DBFileRepository dbFileRepository;
    private final SimilarityRecordRepository similarityRecordRepository;
    private final AIDetectionRecordRepository aiDetectionRecordRepository;
    private final RestTemplate restTemplate;

    public AIService(
            DBFileRepository dbFileRepository,
            SimilarityRecordRepository similarityRecordRepository,
            AIDetectionRecordRepository aiDetectionRecordRepository,
            RestTemplate restTemplate) {
        this.dbFileRepository = dbFileRepository;
        this.similarityRecordRepository = similarityRecordRepository;
        this.aiDetectionRecordRepository = aiDetectionRecordRepository;
        this.restTemplate = restTemplate;
    }

    /**
     * Extracts technical skills from resume document bytes via Python ai-service
     */
    @SuppressWarnings("unchecked")
    public List<String> extractSkills(byte[] fileBytes, String contentType, String fileName) {
        if (fileBytes == null || fileBytes.length == 0) {
            return getDefaultSkills();
        }

        try {
            String url = aiServiceUrl + "/api/ai/extract-skills";
            String base64Data = Base64.getEncoder().encodeToString(fileBytes);

            Map<String, Object> request = new HashMap<>();
            request.put("fileBytesBase64", base64Data);
            request.put("contentType", contentType);
            request.put("fileName", fileName);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<String> skills = (List<String>) response.getBody().get("skills");
                if (skills != null && !skills.isEmpty()) {
                    return skills;
                }
            }
        } catch (Exception e) {
            System.err.println("[AIService] extractSkills failed: " + e.getMessage());
        }

        return getDefaultSkills();
    }

    /**
     * Full weekly report analysis pipeline via Python ai-service
     */
    @SuppressWarnings("unchecked")
    public void analyzeReport(WeeklyReport report, List<WeeklyReport> previousReports) {
        if (report == null) return;

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

        // 2. Build previous reports text payload
        List<Map<String, String>> prevList = new ArrayList<>();
        if (previousReports != null) {
            for (WeeklyReport prev : previousReports) {
                if (!prev.getId().equals(report.getId())) {
                    String prevText = prev.getRemarks() != null ? prev.getRemarks() : "";
                    
                    SimilarityRecord prevRecord = similarityRecordRepository.findByReportId(prev.getId())
                            .stream().findFirst().orElse(null);
                    if (prevRecord != null && prevRecord.getTargetText() != null && !prevRecord.getTargetText().trim().isEmpty()) {
                        prevText = prevRecord.getTargetText();
                    }

                    if (!prevText.trim().isEmpty()) {
                        Map<String, String> item = new HashMap<>();
                        item.put("id", prev.getId());
                        item.put("text", prevText);
                        prevList.add(item);
                    }
                }
            }
        }

        // 3. Call Python ai-service /api/ai/analyze-report
        try {
            String url = aiServiceUrl + "/api/ai/analyze-report";
            Map<String, Object> request = new HashMap<>();
            request.put("reportId", report.getId());
            request.put("remarks", report.getRemarks() != null ? report.getRemarks() : "");
            if (dbFile != null && dbFile.getData() != null) {
                request.put("fileBytesBase64", Base64.getEncoder().encodeToString(dbFile.getData()));
                request.put("fileContentType", dbFile.getContentType());
                request.put("fileName", dbFile.getFileName());
            }
            request.put("previousReports", prevList);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();

                double aiScore = ((Number) body.getOrDefault("aiGeneratedScore", 0.0)).doubleValue();
                double simScore = ((Number) body.getOrDefault("similarityScore", 0.0)).doubleValue();
                String matchedId = (String) body.getOrDefault("matchedReportId", "");
                boolean isFlagged = (Boolean) body.getOrDefault("isFlagged", false);
                String combinedText = (String) body.getOrDefault("combinedText", report.getRemarks() != null ? report.getRemarks() : "");

                report.setAiGeneratedScore(aiScore);
                report.setSimilarityScore(simScore);
                report.setMatchedReportId(matchedId);
                report.setIsFlagged(isFlagged);

                // Save audit records
                aiDetectionRecordRepository.save(new AIDetectionRecord(report.getId(), combinedText, report.getAiGeneratedScore()));
                
                SimilarityRecord simRecord = new SimilarityRecord(report.getId(), combinedText, matchedId, simScore);
                List<Number> embList = (List<Number>) body.get("embedding");
                if (embList != null) {
                    double[] emb = new double[embList.size()];
                    for (int i = 0; i < embList.size(); i++) {
                        emb[i] = embList.get(i).doubleValue();
                    }
                    simRecord.setEmbedding(emb);
                }
                similarityRecordRepository.save(simRecord);
                return;
            }
        } catch (Exception e) {
            System.err.println("[AIService] analyzeReport failed: " + e.getMessage());
        }

        // Fallback default
        report.setAiGeneratedScore(0.0);
        report.setSimilarityScore(0.0);
        report.setIsFlagged(false);
    }

    private List<String> getDefaultSkills() {
        return Arrays.asList("Java", "Spring Boot", "React", "MongoDB", "Node.js", "Docker", "Git");
    }
}
