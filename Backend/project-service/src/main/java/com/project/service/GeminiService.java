package com.project.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public GeminiService() {
        this.restTemplate = new RestTemplate();
    }

    private boolean isApiKeyConfigured() {
        return apiKey != null && !apiKey.trim().isEmpty() && !apiKey.equals("${GEMINI_API_KEY:}");
    }

    /**
     * Extracts text content from a document or image using Gemini
     */
    @SuppressWarnings("unchecked")
    public String extractTextFromDocument(byte[] fileBytes, String contentType, String fileName) {
        if (!isApiKeyConfigured()) {
            return "This is a fallback extracted text from the document name: " + fileName;
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=" + apiKey;

            String base64Data = Base64.getEncoder().encodeToString(fileBytes);
            
            String mimeType = contentType;
            if (contentType == null || contentType.isEmpty()) {
                mimeType = "application/pdf";
            } else if (contentType.contains("wordprocessingml") || fileName.endsWith(".docx")) {
                mimeType = "application/pdf";
            }

            Map<String, Object> inlineData = new HashMap<>();
            inlineData.put("mimeType", mimeType);
            inlineData.put("data", base64Data);

            Map<String, Object> mediaPart = new HashMap<>();
            mediaPart.put("inlineData", inlineData);

            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", "Extract and transcribe all the written text content of this document or image. Return only the plain text content exactly as written, with no extra formatting, headers, or markdown fences.");

            List<Map<String, Object>> parts = new ArrayList<>();
            parts.add(mediaPart);
            parts.add(textPart);

            Map<String, Object> contentMap = new HashMap<>();
            contentMap.put("parts", parts);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", Collections.singletonList(contentMap));

            ResponseEntity<Map> responseEntity = postToGeminiWithFallback(requestBody);

            if (responseEntity.getStatusCode() == HttpStatus.OK && responseEntity.getBody() != null) {
                Map<String, Object> responseBody = responseEntity.getBody();
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    if (content != null) {
                        List<Map<String, Object>> partsList = (List<Map<String, Object>>) content.get("parts");
                        if (partsList != null && !partsList.isEmpty()) {
                            return (String) partsList.get(0).get("text");
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("[GeminiService] Failed to extract text from document: " + e.getMessage());
        }

        return "Failed to extract text from " + fileName;
    }

    /**
     * Extracts skills from resume using gemini-flash-latest model
     */
    @SuppressWarnings("unchecked")
    public List<String> extractSkills(byte[] fileBytes, String contentType, String fileName) {
        if (!isApiKeyConfigured()) {
            System.err.println("[GeminiService] API Key is not configured. Returning default demo skills.");
            try (java.io.FileWriter fw = new java.io.FileWriter("c:/Users/mithu/OneDrive/Documents/FSJ INT/Project/ProjectPilot/gemini_error.log", true);
                 java.io.PrintWriter pw = new java.io.PrintWriter(fw)) {
                pw.println("--- API Key Not Configured ---");
                pw.println(new java.util.Date());
                pw.println("API Key value in Java: '" + apiKey + "'");
                pw.println();
            } catch (Exception ioEx) {
                ioEx.printStackTrace();
            }
            return Arrays.asList("Java", "Spring Boot", "React", "MongoDB", "Node.js", "Docker", "Git");
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=" + apiKey;

            String base64Data = Base64.getEncoder().encodeToString(fileBytes);
            
            String mimeType = contentType;
            if (contentType == null || contentType.isEmpty()) {
                mimeType = "application/pdf";
            } else if (contentType.contains("wordprocessingml") || fileName.endsWith(".docx")) {
                mimeType = "application/pdf"; // Fallback coercion
            }

            Map<String, Object> inlineData = new HashMap<>();
            inlineData.put("mimeType", mimeType);
            inlineData.put("data", base64Data);

            Map<String, Object> mediaPart = new HashMap<>();
            mediaPart.put("inlineData", inlineData);

            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", "You are an expert recruitment system. Analyze the uploaded resume and extract a clean list of professional skills, technical tools, framework names, and programming languages. Return ONLY a valid JSON list of strings, e.g. [\"Java\", \"React\", \"Python\"]. Do not wrap it in markdown code fences or add extra explanations.");

            List<Map<String, Object>> parts = new ArrayList<>();
            parts.add(mediaPart);
            parts.add(textPart);

            Map<String, Object> contentMap = new HashMap<>();
            contentMap.put("parts", parts);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", Collections.singletonList(contentMap));

            // Force JSON response
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("responseMimeType", "application/json");
            requestBody.put("generationConfig", generationConfig);

            ResponseEntity<Map> responseEntity = postToGeminiWithFallback(requestBody);

            if (responseEntity.getStatusCode() == HttpStatus.OK && responseEntity.getBody() != null) {
                Map<String, Object> responseBody = responseEntity.getBody();
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    if (content != null) {
                        List<Map<String, Object>> partsList = (List<Map<String, Object>>) content.get("parts");
                        if (partsList != null && !partsList.isEmpty()) {
                            String responseText = (String) partsList.get(0).get("text");
                            if (responseText != null) {
                                responseText = responseText.trim();
                                
                                List<String> skills = new ArrayList<>();
                                String cleaned = responseText.replace("[", "").replace("]", "").replace("\"", "").replace("'", "");
                                String[] tokens = cleaned.split(",");
                                for (String token : tokens) {
                                    String skill = token.trim();
                                    if (!skill.isEmpty()) {
                                        skills.add(skill);
                                    }
                                }
                                return skills;
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("[GeminiService] Failed to extract skills: " + e.getMessage());
            try (java.io.FileWriter fw = new java.io.FileWriter("c:/Users/mithu/OneDrive/Documents/FSJ INT/Project/ProjectPilot/gemini_error.log", true);
                 java.io.PrintWriter pw = new java.io.PrintWriter(fw)) {
                pw.println("--- Skill Extraction Error ---");
                pw.println(new java.util.Date());
                pw.println("Message: " + e.getMessage());
                e.printStackTrace(pw);
                pw.println();
            } catch (Exception ioEx) {
                ioEx.printStackTrace();
            }
        }

        return Arrays.asList("Java", "Spring Boot", "React", "MongoDB", "Node.js", "Docker", "Git");
    }

    /**
     * Determines the probability (0 to 100) that report text is AI generated
     */
    @SuppressWarnings("unchecked")
    public double detectAIGenerated(String text) {
        if (text == null || text.trim().isEmpty()) {
            return 0.0;
        }

        if (!isApiKeyConfigured()) {
            System.err.println("[GeminiService] API Key is not configured. Returning default human-like score.");
            return 15.0;
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=" + apiKey;

            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", "Analyze the following student weekly progress report text and determine the probability (0 to 100) that it was generated by an AI assistant (ChatGPT, Gemini, Claude, etc.). Return only the percentage score as an integer (e.g. 75), with no other text.\n\nReport Text:\n" + text);

            Map<String, Object> contentMap = new HashMap<>();
            contentMap.put("parts", Collections.singletonList(textPart));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", Collections.singletonList(contentMap));

            ResponseEntity<Map> responseEntity = postToGeminiWithFallback(requestBody);

            if (responseEntity.getStatusCode() == HttpStatus.OK && responseEntity.getBody() != null) {
                Map<String, Object> responseBody = responseEntity.getBody();
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    if (content != null) {
                        List<Map<String, Object>> partsList = (List<Map<String, Object>>) content.get("parts");
                        if (partsList != null && !partsList.isEmpty()) {
                            String responseText = (String) partsList.get(0).get("text");
                            if (responseText != null) {
                                String cleaned = responseText.trim().replaceAll("[^0-9]", "");
                                if (!cleaned.isEmpty()) {
                                    return Double.parseDouble(cleaned);
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("[GeminiService] Failed to analyze AI text: " + e.getMessage());
        }

        return 15.0; // Fallback default
    }

    /**
     * Gets text embedding values using gemini-embedding-2 model
     */
    @SuppressWarnings("unchecked")
    public double[] getEmbedding(String text) {
        if (text == null || text.trim().isEmpty()) {
            return new double[0];
        }

        if (!isApiKeyConfigured()) {
            return new double[0];
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=" + apiKey;

            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", text);

            Map<String, Object> contentMap = new HashMap<>();
            contentMap.put("parts", Collections.singletonList(textPart));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "models/gemini-embedding-2");
            requestBody.put("content", contentMap);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(url, entity, Map.class);

            if (responseEntity.getStatusCode() == HttpStatus.OK && responseEntity.getBody() != null) {
                Map<String, Object> responseBody = responseEntity.getBody();
                Map<String, Object> embeddingMap = (Map<String, Object>) responseBody.get("embedding");
                if (embeddingMap != null) {
                    List<Number> valuesList = (List<Number>) embeddingMap.get("values");
                    if (valuesList != null) {
                        double[] embedding = new double[valuesList.size()];
                        for (int i = 0; i < valuesList.size(); i++) {
                            embedding[i] = valuesList.get(i).doubleValue();
                        }
                        return embedding;
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("[GeminiService] Failed to fetch embeddings: " + e.getMessage());
        }

        return new double[0];
    }

    private ResponseEntity<Map> postToGeminiWithFallback(Map<String, Object> requestBody) {
        String[] models = {"gemini-flash-lite-latest", "gemini-3.7-flash", "gemini-pro-latest"};
        Exception lastException = null;
        
        for (String model : models) {
            try {
                String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                
                ResponseEntity<Map> responseEntity = restTemplate.postForEntity(url, entity, Map.class);
                if (responseEntity.getStatusCode() == HttpStatus.OK) {
                    return responseEntity;
                }
            } catch (Exception e) {
                System.err.println("[GeminiService] Model " + model + " failed: " + e.getMessage());
                lastException = e;
            }
        }
        
        if (lastException != null) {
            throw new RuntimeException("All Gemini models failed. Last error: " + lastException.getMessage(), lastException);
        }
        throw new RuntimeException("All Gemini models failed.");
    }
}
