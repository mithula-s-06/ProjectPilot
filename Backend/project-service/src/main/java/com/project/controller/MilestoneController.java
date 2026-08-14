package com.project.controller;

import com.project.entity.Milestone;
import com.project.repository.MilestoneRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/milestones")
public class MilestoneController {

    private final MilestoneRepository milestoneRepository;

    public MilestoneController(MilestoneRepository milestoneRepository) {
        this.milestoneRepository = milestoneRepository;
    }

    @GetMapping
    public List<Milestone> listMilestones(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Boolean paginate) {
        if (paginate != null && paginate) {
            return milestoneRepository.findAll(org.springframework.data.domain.PageRequest.of(page, size)).getContent();
        }
        return milestoneRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Milestone> getMilestone(@PathVariable String id) {
        return milestoneRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Milestone createMilestone(@RequestBody Milestone milestone) {
        if (milestone.getId() == null || milestone.getId().isEmpty()) {
            milestone.setId(UUID.randomUUID().toString());
        }
        return milestoneRepository.save(milestone);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Milestone> updateMilestone(@PathVariable String id, @RequestBody Milestone milestoneDetails) {
        return milestoneRepository.findById(id).map(milestone -> {
            milestone.setName(milestoneDetails.getName());
            milestone.setDueDate(milestoneDetails.getDueDate());
            milestone.setProgress(milestoneDetails.getProgress());
            milestone.setStatus(milestoneDetails.getStatus());
            Milestone updated = milestoneRepository.save(milestone);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMilestone(@PathVariable String id) {
        if (!milestoneRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        milestoneRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
