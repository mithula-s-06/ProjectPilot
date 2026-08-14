package com.project.controller;

import com.project.entity.Suggestion;
import com.project.repository.SuggestionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/suggestions")
public class SuggestionController {

    private final SuggestionRepository suggestionRepository;

    public SuggestionController(SuggestionRepository suggestionRepository) {
        this.suggestionRepository = suggestionRepository;
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
        suggestionRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
