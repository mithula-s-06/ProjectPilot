package com.project.controller;

import com.project.entity.Suggestion;
import com.project.repository.SuggestionRepository;
import com.project.repository.ProjectRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/suggestions")
public class SuggestionController {

    private final SuggestionRepository suggestionRepository;
    private final ProjectRepository projectRepository;

    public SuggestionController(SuggestionRepository suggestionRepository, ProjectRepository projectRepository) {
        this.suggestionRepository = suggestionRepository;
        this.projectRepository = projectRepository;
    }

    @GetMapping
    public List<Suggestion> getAllSuggestions() {
        return suggestionRepository.findAll();
    }

    @GetMapping("/project/{projectId}")
    public List<Suggestion> getSuggestionsByProject(@PathVariable String projectId) {
        return suggestionRepository.findByProjectId(projectId);
    }

    @GetMapping("/email/{email}")
    public List<Suggestion> getSuggestionsByRecipient(@PathVariable String email) {
        return suggestionRepository.findByRecipientEmail(email);
    }

    @GetMapping("/team/{teamName}")
    public List<Suggestion> getSuggestionsByTeam(@PathVariable String teamName) {
        return suggestionRepository.findByTeamName(teamName);
    }

    @PostMapping
    public ResponseEntity<Suggestion> createSuggestion(@RequestBody Suggestion suggestion) {
        if (suggestion.getTimestamp() == null) {
            suggestion.setTimestamp(System.currentTimeMillis());
        }
        Suggestion saved = suggestionRepository.save(suggestion);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSuggestion(@PathVariable String id) {
        suggestionRepository.findById(id).ifPresent(suggestion -> {
            String projId = suggestion.getProjectId();
            if (projId != null && !projId.isEmpty()) {
                projectRepository.findById(projId).ifPresent(project -> {
                    java.util.Map<String, Object> feedback = project.getMentorFeedback();
                    if (feedback != null && feedback.containsKey("allComments")) {
                        Object commentsObj = feedback.get("allComments");
                        if (commentsObj instanceof java.util.List) {
                            java.util.List<java.util.Map<String, Object>> comments = (java.util.List<java.util.Map<String, Object>>) commentsObj;
                            comments.removeIf(comment -> id.equals(comment.get("id")));
                            
                            // Re-calculate latestFeedback
                            if (comments.isEmpty()) {
                                feedback.put("latestFeedback", "No feedback submitted yet.");
                                feedback.put("date", "--");
                            } else {
                                java.util.Map<String, Object> latest = comments.get(0);
                                String textVal = (String) latest.get("text");
                                if (textVal != null) {
                                    int idx = textVal.indexOf("]: ");
                                    if (idx != -1) {
                                        feedback.put("latestFeedback", textVal.substring(idx + 3));
                                    } else {
                                        feedback.put("latestFeedback", textVal);
                                    }
                                }
                                feedback.put("date", latest.get("date"));
                            }
                            projectRepository.save(project);
                        }
                    }
                });
            }
        });
        suggestionRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
