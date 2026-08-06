package com.project.controller;

import com.project.entity.Project;
import com.project.entity.Task;
import com.project.entity.Milestone;
import com.project.entity.WeeklyReport;
import com.project.repository.ProjectRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectRepository projectRepository;

    public ProjectController(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @GetMapping
    public List<Project> listProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Boolean paginate) {
        if (paginate != null && paginate) {
            return projectRepository.findAll(org.springframework.data.domain.PageRequest.of(page, size)).getContent();
        }
        return projectRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProject(@PathVariable String id) {
        return projectRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Project createProject(@RequestBody Project project) {
        if (project.getId() == null || project.getId().isEmpty()) {
            project.setId(UUID.randomUUID().toString());
        }
        return projectRepository.save(project);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable String id, @RequestBody Project projectDetails) {
        return projectRepository.findById(id).map(project -> {
            project.setName(projectDetails.getName());
            project.setDomain(projectDetails.getDomain());
            project.setHealth(projectDetails.getHealth());
            project.setPhase(projectDetails.getPhase());
            project.setMentorName(projectDetails.getMentorName());
            project.setProgress(projectDetails.getProgress());
            project.setStatus(projectDetails.getStatus());
            project.setDescription(projectDetails.getDescription());
            project.setCommits(projectDetails.getCommits());
            project.setPrs(projectDetails.getPrs());
            project.setIssuesClosed(projectDetails.getIssuesClosed());
            project.setContributionPercentage(projectDetails.getContributionPercentage());
            project.setRepoUrl(projectDetails.getRepoUrl());
            project.setTeamName(projectDetails.getTeamName());
            if (projectDetails.getTasks() != null) {
                project.setTasks(projectDetails.getTasks());
            }
            if (projectDetails.getMilestones() != null) {
                project.setMilestones(projectDetails.getMilestones());
            }
            if (projectDetails.getWeeklyReports() != null) {
                project.setWeeklyReports(projectDetails.getWeeklyReports());
            }
            Project updated = projectRepository.save(project);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable String id) {
        if (!projectRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        projectRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // --- Embedded Tasks Operations ---

    @PostMapping("/{id}/tasks")
    public ResponseEntity<Project> addTask(@PathVariable String id, @RequestBody Task task) {
        return projectRepository.findById(id).map(project -> {
            task.setId(UUID.randomUUID().toString());
            if (task.getAssignedDate() == null) {
                task.setAssignedDate(LocalDate.now());
            }
            task.setProjectName(project.getName());
            project.getTasks().add(task);
            Project updated = projectRepository.save(project);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/tasks/{taskId}")
    public ResponseEntity<Project> updateTask(@PathVariable String id, @PathVariable String taskId, @RequestBody Task taskDetails) {
        return projectRepository.findById(id).map(project -> {
            boolean found = false;
            for (Task t : project.getTasks()) {
                if (t.getId().equals(taskId)) {
                    t.setName(taskDetails.getName());
                    t.setDeadline(taskDetails.getDeadline());
                    t.setPriority(taskDetails.getPriority());
                    t.setStatus(taskDetails.getStatus());
                    found = true;
                    break;
                }
            }
            if (found) {
                Project updated = projectRepository.save(project);
                return ResponseEntity.ok(updated);
            }
            return ResponseEntity.badRequest().<Project>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/tasks/{taskId}")
    public ResponseEntity<Project> deleteTask(@PathVariable String id, @PathVariable String taskId) {
        return projectRepository.findById(id).map(project -> {
            boolean removed = project.getTasks().removeIf(t -> t.getId().equals(taskId));
            if (removed) {
                Project updated = projectRepository.save(project);
                return ResponseEntity.ok(updated);
            }
            return ResponseEntity.badRequest().<Project>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- Embedded Milestones Operations ---

    @PostMapping("/{id}/milestones")
    public ResponseEntity<Project> addMilestone(@PathVariable String id, @RequestBody Milestone milestone) {
        return projectRepository.findById(id).map(project -> {
            milestone.setId(UUID.randomUUID().toString());
            project.getMilestones().add(milestone);
            Project updated = projectRepository.save(project);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/milestones/{milestoneId}")
    public ResponseEntity<Project> updateMilestone(@PathVariable String id, @PathVariable String milestoneId, @RequestBody Milestone milestoneDetails) {
        return projectRepository.findById(id).map(project -> {
            boolean found = false;
            for (Milestone m : project.getMilestones()) {
                if (m.getId().equals(milestoneId)) {
                    m.setName(milestoneDetails.getName());
                    m.setDueDate(milestoneDetails.getDueDate());
                    m.setProgress(milestoneDetails.getProgress());
                    m.setStatus(milestoneDetails.getStatus());
                    found = true;
                    break;
                }
            }
            if (found) {
                Project updated = projectRepository.save(project);
                return ResponseEntity.ok(updated);
            }
            return ResponseEntity.badRequest().<Project>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- Embedded Weekly Reports Operations ---

    @PostMapping("/{id}/reports")
    public ResponseEntity<Project> addReport(@PathVariable String id, @RequestBody WeeklyReport report) {
        return projectRepository.findById(id).map(project -> {
            report.setId(UUID.randomUUID().toString());
            report.setSubmittedDate(LocalDate.now());
            report.setSubmissionStatus("Submitted");
            project.getWeeklyReports().add(report);
            Project updated = projectRepository.save(project);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/reports/{reportId}/review")
    public ResponseEntity<Project> reviewReport(@PathVariable String id, @PathVariable String reportId, @RequestBody WeeklyReport reportDetails) {
        return projectRepository.findById(id).map(project -> {
            boolean found = false;
            for (WeeklyReport r : project.getWeeklyReports()) {
                if (r.getId().equals(reportId)) {
                    r.setRemarks(reportDetails.getRemarks());
                    r.setSubmissionStatus(reportDetails.getSubmissionStatus());
                    found = true;
                    break;
                }
            }
            if (found) {
                Project updated = projectRepository.save(project);
                return ResponseEntity.ok(updated);
            }
            return ResponseEntity.badRequest().<Project>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
