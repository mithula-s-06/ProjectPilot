package com.project.service;

import com.project.entity.WeeklyReport;
import com.project.entity.AIDetectionRecord;
import com.project.repository.AIDetectionRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class AIDetectionService {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String DETECTION_URL = "http://localhost:8083/api/ai/detect-ai";
    private final AIDetectionRecordRepository aiDetectionRecordRepository;

    public AIDetectionService(AIDetectionRecordRepository aiDetectionRecordRepository) {
        this.aiDetectionRecordRepository = aiDetectionRecordRepository;
    }

    private static final List<String> LLM_MARKER_WORDS = Arrays.asList(
        "delve", "testament", "pivotal", "furthermore", "moreover", 
        "in conclusion", "it is important to note", "demystify", 
        "beacon", "multi-faceted", "holistic", "tapestry", "underscores"
    );

    public void detectAI(WeeklyReport report) {
        String text = report.getRemarks();
        if (text == null || text.trim().isEmpty()) {
            report.setAiGeneratedScore(0.0);
            return;
        }

        try {
            Map<String, String> aiRequest = new HashMap<>();
            aiRequest.put("text", text);

            Map<String, Object> aiResponse = restTemplate.postForObject(DETECTION_URL, aiRequest, Map.class);
            if (aiResponse != null) {
                Number score = (Number) aiResponse.get("aiProbability");
                report.setAiGeneratedScore(score != null ? score.doubleValue() : 0.0);
                
                AIDetectionRecord record = new AIDetectionRecord(report.getId(), text, report.getAiGeneratedScore());
                aiDetectionRecordRepository.save(record);
                return;
            }
        } catch (Exception e) {
            System.err.println("AI Detection FastAPI service failed. Using Java fallback: " + e.getMessage());
        }

        // Native Java Fallback AI detection
        double aiScore = calculateLocalAIDetectionScore(text);
        report.setAiGeneratedScore(Math.round(aiScore * 10.0) / 10.0);
        
        AIDetectionRecord record = new AIDetectionRecord(report.getId(), text, report.getAiGeneratedScore());
        aiDetectionRecordRepository.save(record);
    }

    private double calculateLocalAIDetectionScore(String text) {
        String lower = text.toLowerCase();
        
        int markerMatches = 0;
        for (String marker : LLM_MARKER_WORDS) {
            if (lower.contains(marker)) {
                markerMatches++;
            }
        }
        double vocabWeight = Math.min((markerMatches / 3.0) * 50.0, 50.0);

        String[] sentences = text.split("[.!?]+");
        List<Integer> lengths = new ArrayList<>();
        for (String s : sentences) {
            String trimmed = s.trim();
            if (!trimmed.isEmpty()) {
                lengths.add(trimmed.split("\\s+").length);
            }
        }

        double uniformityWeight = 15.0;
        if (lengths.size() > 1) {
            double mean = 0.0;
            for (int len : lengths) mean += len;
            mean /= lengths.size();

            double variance = 0.0;
            for (int len : lengths) {
                variance += Math.pow(len - mean, 2);
            }
            variance /= lengths.size();

            uniformityWeight = Math.max(0.0, 50.0 - (variance * 1.5));
        }

        double finalScore = vocabWeight + uniformityWeight;

        if (lower.contains("as an ai language model") || 
            lower.contains("in summary") || 
            lower.contains("important to note") ||
            lower.contains("it is important to delve")) {
            finalScore = Math.max(finalScore, 85.0);
        }

        return Math.min(finalScore, 99.0);
    }
}
