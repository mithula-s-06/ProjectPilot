package com.project.controller;

import com.project.entity.User;
import com.project.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.project.entity.DBFile;
import com.project.repository.DBFileRepository;
import com.project.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Collections;

/**
 * REST controller for User management and AI Resume skill extraction.
 * Communicates with the standalone Python ai-service microservice.
 */
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Autowired
    private AIService aiService;

    @Autowired
    private DBFileRepository dbFileRepository;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/extract-skills")
    public ResponseEntity<?> extractSkills(@RequestBody Map<String, String> request) {
        String fileId = request.get("fileId");
        if (fileId == null || fileId.isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "fileId is required"));
        }

        DBFile dbFile = dbFileRepository.findById(fileId).orElse(null);
        if (dbFile == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            List<String> skills = aiService.extractSkills(dbFile.getData(), dbFile.getContentType(), dbFile.getFileName());
            Map<String, Object> response = new HashMap<>();
            response.put("skills", skills);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Skill extraction failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Collections.singletonMap("error", "Failed to extract skills: " + e.getMessage()));
        }
    }

    @GetMapping
    public List<User> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Boolean paginate) {
        if (paginate != null && paginate) {
            return userService.getAllUsers(org.springframework.data.domain.PageRequest.of(page, size)).getContent();
        }
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable String id) {
        User user = userService.getUserById(id);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            userService.addUser(user);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(exception.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody User user) {
        if (userService.getUserById(id) == null) {
            return ResponseEntity.notFound().build();
        }
        try {
            user.setId(id);
            userService.updateUser(user);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(exception.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        if (userService.getUserById(id) == null) {
            return ResponseEntity.notFound().build();
        }
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
