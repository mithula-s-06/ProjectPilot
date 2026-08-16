package com.project.service;

import com.project.entity.WeeklyReport;
import com.project.entity.SimilarityRecord;
import com.project.repository.SimilarityRecordRepository;
import com.project.entity.DBFile;
import com.project.repository.DBFileRepository;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SimilarityService {

    private final SimilarityRecordRepository similarityRecordRepository;
    private final GeminiService geminiService;
    private final DBFileRepository dbFileRepository;

    public SimilarityService(
            SimilarityRecordRepository similarityRecordRepository,
            GeminiService geminiService,
            DBFileRepository dbFileRepository) {
        this.similarityRecordRepository = similarityRecordRepository;
        this.geminiService = geminiService;
        this.dbFileRepository = dbFileRepository;
    }

    public void checkSimilarity(WeeklyReport report, List<WeeklyReport> previousReports, String text) {
        if (text == null || text.trim().isEmpty() || previousReports == null || previousReports.isEmpty()) {
            report.setSimilarityScore(0.0);
            report.setMatchedReportId("");
            return;
        }

        // 1. Try Gemini embedding model
        try {
            double[] currentEmbedding = geminiService.getEmbedding(text);
            if (currentEmbedding != null && currentEmbedding.length > 0) {
                double maxSimilarity = 0.0;
                String matchedId = "";

                for (WeeklyReport prev : previousReports) {
                    if (!prev.getId().equals(report.getId())) {
                        double[] prevEmbedding = null;
                        
                        // Check cache in MongoDB
                        SimilarityRecord prevRecord = similarityRecordRepository.findByReportId(prev.getId())
                                .stream().findFirst().orElse(null);
                        
                        String prevText = prev.getRemarks() != null ? prev.getRemarks() : "";
                        
                        if (prevRecord != null && prevRecord.getTargetText() != null && !prevRecord.getTargetText().trim().isEmpty()) {
                            prevText = prevRecord.getTargetText();
                        } else {
                            // Cache miss for text: build it by extracting document text if any exists
                            String fileId = null;
                            String fileUrl = prev.getFileUrl();
                            if (fileUrl != null && fileUrl.contains("/download/")) {
                                fileId = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
                            }
                            if (fileId != null) {
                                DBFile dbFile = dbFileRepository.findById(fileId).orElse(null);
                                if (dbFile != null && dbFile.getData() != null) {
                                    try {
                                        String extracted = geminiService.extractTextFromDocument(dbFile.getData(), dbFile.getContentType(), dbFile.getFileName());
                                        if (extracted != null && !extracted.trim().isEmpty()) {
                                            prevText = (prevText.isEmpty() ? "" : prevText + "\n") + extracted;
                                        }
                                    } catch (Exception e) {
                                        System.err.println("[SimilarityService] Failed to extract doc text for previous report " + prev.getId() + ": " + e.getMessage());
                                    }
                                }
                            }
                            // Save this resolved combined text in the record for future audits
                            if (prevRecord == null) {
                                prevRecord = new SimilarityRecord(prev.getId(), prevText, "", 0.0);
                            } else {
                                prevRecord.setTargetText(prevText);
                            }
                            similarityRecordRepository.save(prevRecord);
                        }

                        // Now resolve embedding
                        if (prevRecord != null && prevRecord.getEmbedding() != null && prevRecord.getEmbedding().length > 0) {
                            prevEmbedding = prevRecord.getEmbedding();
                        } else {
                            if (!prevText.trim().isEmpty()) {
                                prevEmbedding = geminiService.getEmbedding(prevText);
                                if (prevEmbedding != null && prevEmbedding.length > 0) {
                                    prevRecord.setEmbedding(prevEmbedding);
                                    similarityRecordRepository.save(prevRecord);
                                }
                            }
                        }

                        if (prevEmbedding != null && prevEmbedding.length > 0) {
                            double sim = calculateVectorCosineSimilarity(currentEmbedding, prevEmbedding);
                            if (sim > maxSimilarity) {
                                maxSimilarity = sim;
                                matchedId = prev.getId();
                            }
                        }
                    }
                }

                report.setSimilarityScore(Math.round(maxSimilarity * 1000.0) / 10.0);
                report.setMatchedReportId(matchedId);

                SimilarityRecord record = new SimilarityRecord(report.getId(), text, report.getMatchedReportId(), report.getSimilarityScore());
                record.setEmbedding(currentEmbedding);
                similarityRecordRepository.save(record);
                return;
            }
        } catch (Exception e) {
            System.err.println("[SimilarityService] Gemini embedding check failed. Falling back to local bag-of-words: " + e.getMessage());
        }

        // 2. Local Java Fallback bag-of-words Cosine Similarity
        double maxSimilarity = 0.0;
        String matchedId = "";

        for (WeeklyReport prev : previousReports) {
            if (!prev.getId().equals(report.getId())) {
                String prevText = prev.getRemarks() != null ? prev.getRemarks() : "";
                
                SimilarityRecord prevRecord = similarityRecordRepository.findByReportId(prev.getId())
                        .stream().findFirst().orElse(null);
                if (prevRecord != null && prevRecord.getTargetText() != null && !prevRecord.getTargetText().trim().isEmpty()) {
                    prevText = prevRecord.getTargetText();
                }
                
                if (!prevText.trim().isEmpty()) {
                    double sim = calculateCosineSimilarity(text, prevText);
                    if (sim > maxSimilarity) {
                        maxSimilarity = sim;
                        matchedId = prev.getId();
                    }
                }
            }
        }

        report.setSimilarityScore(Math.round(maxSimilarity * 1000.0) / 10.0);
        report.setMatchedReportId(matchedId);
        
        SimilarityRecord record = new SimilarityRecord(report.getId(), text, report.getMatchedReportId(), report.getSimilarityScore());
        similarityRecordRepository.save(record);
    }

    private double calculateVectorCosineSimilarity(double[] v1, double[] v2) {
        if (v1.length != v2.length || v1.length == 0) {
            return 0.0;
        }
        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;
        for (int i = 0; i < v1.length; i++) {
            dotProduct += v1[i] * v2[i];
            norm1 += v1[i] * v1[i];
            norm2 += v2[i] * v2[i];
        }
        if (norm1 == 0.0 || norm2 == 0.0) {
            return 0.0;
        }
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
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
