package com.project.service;

import com.project.entity.WeeklyReport;
import com.project.entity.SimilarityRecord;
import com.project.repository.SimilarityRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SimilarityService {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String SIMILARITY_URL = "http://localhost:8083/api/ai/similarity";
    private final SimilarityRecordRepository similarityRecordRepository;

    public SimilarityService(SimilarityRecordRepository similarityRecordRepository) {
        this.similarityRecordRepository = similarityRecordRepository;
    }

    public void checkSimilarity(WeeklyReport report, List<WeeklyReport> previousReports) {
        String text = report.getRemarks();
        if (text == null || text.trim().isEmpty() || previousReports == null || previousReports.isEmpty()) {
            report.setSimilarityScore(0.0);
            report.setMatchedReportId("");
            return;
        }

        try {
            List<Map<String, String>> compareTexts = new ArrayList<>();
            for (WeeklyReport prev : previousReports) {
                if (prev.getRemarks() != null && !prev.getRemarks().trim().isEmpty() && !prev.getId().equals(report.getId())) {
                    Map<String, String> doc = new HashMap<>();
                    doc.put("id", prev.getId());
                    doc.put("text", prev.getRemarks());
                    compareTexts.add(doc);
                }
            }

            if (!compareTexts.isEmpty()) {
                Map<String, Object> simRequest = new HashMap<>();
                simRequest.put("text", text);
                simRequest.put("compare_texts", compareTexts);

                Map<String, Object> simResponse = restTemplate.postForObject(SIMILARITY_URL, simRequest, Map.class);
                if (simResponse != null) {
                    Number score = (Number) simResponse.get("similarityScore");
                    String matchedId = (String) simResponse.get("matchedReportId");
                    report.setSimilarityScore(score != null ? score.doubleValue() : 0.0);
                    report.setMatchedReportId(matchedId != null ? matchedId : "");
                    
                    SimilarityRecord record = new SimilarityRecord(report.getId(), text, report.getMatchedReportId(), report.getSimilarityScore());
                    similarityRecordRepository.save(record);
                    return;
                }
            }
        } catch (Exception e) {
            System.err.println("Similarity FastAPI service failed. Using Java fallback: " + e.getMessage());
        }

        // Native Java Fallback Cosine Similarity
        double maxSimilarity = 0.0;
        String matchedId = "";

        for (WeeklyReport prev : previousReports) {
            if (prev.getRemarks() != null && !prev.getRemarks().trim().isEmpty() && !prev.getId().equals(report.getId())) {
                double sim = calculateCosineSimilarity(text, prev.getRemarks());
                if (sim > maxSimilarity) {
                    maxSimilarity = sim;
                    matchedId = prev.getId();
                }
            }
        }

        report.setSimilarityScore(Math.round(maxSimilarity * 1000.0) / 10.0);
        report.setMatchedReportId(matchedId);
        
        SimilarityRecord record = new SimilarityRecord(report.getId(), text, report.getMatchedReportId(), report.getSimilarityScore());
        similarityRecordRepository.save(record);
    }

    private double calculateCosineSimilarity(String t1, String t2) {
        Map<String, Integer> words1 = getWordFrequencies(t1);
        Map<String, Integer> words2 = getWordFrequencies(t2);

        Set<String> uniqueWords = new HashSet<>(words1.keySet());
        uniqueWords.addAll(words2.keySet());

        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;

        for (String word : uniqueWords) {
            int f1 = words1.getOrDefault(word, 0);
            int f2 = words2.getOrDefault(word, 0);
            dotProduct += f1 * f2;
            norm1 += f1 * f1;
            norm2 += f2 * f2;
        }

        if (norm1 == 0.0 || norm2 == 0.0) return 0.0;
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

    private Map<String, Integer> getWordFrequencies(String text) {
        Map<String, Integer> freq = new HashMap<>();
        Matcher m = Pattern.compile("\\b[a-zA-Z0-9']+\\b").matcher(text.toLowerCase());
        while (m.find()) {
            String word = m.group();
            freq.put(word, freq.getOrDefault(word, 0) + 1);
        }
        return freq;
    }
}
