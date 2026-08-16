package com.project.controller;

import com.project.entity.Project;
import com.project.entity.Task;
import com.project.entity.Milestone;
import com.project.entity.WeeklyReport;
import com.project.repository.ProjectRepository;
import com.project.repository.TaskRepository;
import com.project.repository.MilestoneRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.project.service.AIService;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final MilestoneRepository milestoneRepository;
    private final AIService aiService;

    public ProjectController(ProjectRepository projectRepository, TaskRepository taskRepository, MilestoneRepository milestoneRepository, AIService aiService) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.milestoneRepository = milestoneRepository;
        this.aiService = aiService;
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

    @GetMapping("/submissions")
    public List<Task> getAllSubmissions() {
        List<Project> projects = projectRepository.findAll();
        List<Task> submissions = new ArrayList<>();
        for (Project p : projects) {
            if (p.getTasks() != null) {
                for (Task t : p.getTasks()) {
                    if (t.getReportSubmitted() != null && t.getReportSubmitted()) {
                        submissions.add(t);
                    }
                }
            }
        }
        return submissions;
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
        return saveProjectAndSync(project);
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
            if (projectDetails.getDocuments() != null) {
                project.setDocuments(projectDetails.getDocuments());
            }
            if (projectDetails.getReferenceLinks() != null) {
                project.setReferenceLinks(projectDetails.getReferenceLinks());
            }
            if (projectDetails.getWeeklyReports() != null) {
                List<WeeklyReport> allReportsInDB = new ArrayList<>();
                try {
                    List<Project> allProjects = projectRepository.findAll();
                    if (allProjects != null) {
                        for (Project p : allProjects) {
                            if (p.getWeeklyReports() != null) {
                                allReportsInDB.addAll(p.getWeeklyReports());
                            }
                        }
                    }
                } catch (Exception e) {}

                for (WeeklyReport r : projectDetails.getWeeklyReports()) {
                    boolean isNew = true;
                    if (project.getWeeklyReports() != null) {
                        for (WeeklyReport existing : project.getWeeklyReports()) {
                            if (existing.getId().equals(r.getId())) {
                                isNew = false;
                                break;
                            }
                        }
                    }
                    if (isNew && "Submitted".equals(r.getSubmissionStatus())) {
                        aiService.analyzeReport(r, allReportsInDB);
                    }
                }
                project.setWeeklyReports(projectDetails.getWeeklyReports());
            }
            if (projectDetails.getMentorFeedback() != null) {
                project.setMentorFeedback(projectDetails.getMentorFeedback());
            }
            Project updated = saveProjectAndSync(project);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable String id) {
        return projectRepository.findById(id).map(project -> {
            if (project.getTasks() != null) {
                for (Task t : project.getTasks()) {
                    taskRepository.deleteById(t.getId());
                }
            }
            if (project.getMilestones() != null) {
                for (Milestone m : project.getMilestones()) {
                    milestoneRepository.deleteById(m.getId());
                }
            }
            projectRepository.deleteById(id);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
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
            Project updated = saveProjectAndSync(project);
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
                Project updated = saveProjectAndSync(project);
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
                Project updated = saveProjectAndSync(project);
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
            Project updated = saveProjectAndSync(project);
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
                Project updated = saveProjectAndSync(project);
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

            // Fetch all existing reports in DB to compare similarity
            List<WeeklyReport> allReportsInDB = new ArrayList<>();
            try {
                List<Project> allProjects = projectRepository.findAll();
                if (allProjects != null) {
                    for (Project p : allProjects) {
                        if (p.getWeeklyReports() != null) {
                            allReportsInDB.addAll(p.getWeeklyReports());
                        }
                    }
                }
            } catch (Exception ex) {
                System.err.println("Failed to fetch all projects for similarity comparison: " + ex.getMessage());
            }

            // Run AI analysis
            try {
                aiService.analyzeReport(report, allReportsInDB);
            } catch (Exception ex) {
                System.err.println("AI analysis failed: " + ex.getMessage());
            }

            project.getWeeklyReports().add(report);
            Project updated = saveProjectAndSync(project);
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
                Project updated = saveProjectAndSync(project);
                return ResponseEntity.ok(updated);
            }
            return ResponseEntity.badRequest().<Project>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/reports/{reportId}")
    public ResponseEntity<Project> deleteReport(@PathVariable String id, @PathVariable String reportId) {
        return projectRepository.findById(id).map(project -> {
            project.getWeeklyReports().removeIf(r -> r.getId().equals(reportId));
            if (project.getTasks() != null) {
                for (com.project.entity.Task t : project.getTasks()) {
                    if (t.getReportDetails() != null && reportId.equals(t.getReportDetails().getId())) {
                        t.setReportDetails(null);
                        t.setReportSubmitted(false);
                        t.setStatus("Pending");
                    }
                }
            }
            Project updated = saveProjectAndSync(project);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/reports/{reportId}")
    public ResponseEntity<Project> updateReport(@PathVariable String id, @PathVariable String reportId, @RequestBody WeeklyReport reportDetails) {
        return projectRepository.findById(id).map(project -> {
            WeeklyReport target = null;
            for (WeeklyReport r : project.getWeeklyReports()) {
                if (r.getId().equals(reportId)) {
                    target = r;
                    break;
                }
            }
            if (target != null) {
                target.setWeek(reportDetails.getWeek());
                target.setTitle(reportDetails.getTitle());
                target.setRemarks(reportDetails.getRemarks());
                if (reportDetails.getFileName() != null) target.setFileName(reportDetails.getFileName());
                if (reportDetails.getFileSize() != null) target.setFileSize(reportDetails.getFileSize());
                if (reportDetails.getFileUrl() != null) target.setFileUrl(reportDetails.getFileUrl());
                
                if (project.getTasks() != null) {
                    for (com.project.entity.Task t : project.getTasks()) {
                        if (t.getReportDetails() != null && reportId.equals(t.getReportDetails().getId())) {
                            t.getReportDetails().setWeek(reportDetails.getWeek());
                            t.getReportDetails().setTitle(reportDetails.getTitle());
                            t.getReportDetails().setRemarks(reportDetails.getRemarks());
                            if (reportDetails.getFileName() != null) t.getReportDetails().setFileName(reportDetails.getFileName());
                            if (reportDetails.getFileSize() != null) t.getReportDetails().setFileSize(reportDetails.getFileSize());
                            if (reportDetails.getFileUrl() != null) t.getReportDetails().setFileUrl(reportDetails.getFileUrl());
                        }
                    }
                }

                // Re-run AI analysis
                List<WeeklyReport> allReportsInDB = new ArrayList<>();
                try {
                    List<Project> allProjects = projectRepository.findAll();
                    if (allProjects != null) {
                        for (Project p : allProjects) {
                            if (p.getWeeklyReports() != null) {
                                for (WeeklyReport other : p.getWeeklyReports()) {
                                    if (!other.getId().equals(reportId)) {
                                        allReportsInDB.add(other);
                                    }
                                }
                            }
                        }
                    }
                } catch (Exception ex) {}

                try {
                    aiService.analyzeReport(target, allReportsInDB);
                } catch (Exception ex) {}

                Project updated = saveProjectAndSync(project);
                return ResponseEntity.ok(updated);
            }
            return ResponseEntity.badRequest().<Project>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/reports/{reportId}/analyze")
    public ResponseEntity<Project> analyzeExistingReport(@PathVariable String id, @PathVariable String reportId) {
        return projectRepository.findById(id).map(project -> {
            WeeklyReport target = null;
            for (WeeklyReport r : project.getWeeklyReports()) {
                if (r.getId().equals(reportId)) {
                    target = r;
                    break;
                }
            }
            if (target != null) {
                List<WeeklyReport> allReportsInDB = new ArrayList<>();
                try {
                    List<Project> allProjects = projectRepository.findAll();
                    if (allProjects != null) {
                        for (Project p : allProjects) {
                            if (p.getWeeklyReports() != null) {
                                allReportsInDB.addAll(p.getWeeklyReports());
                            }
                        }
                    }
                } catch (Exception e) {}
                
                aiService.analyzeReport(target, allReportsInDB);
                Project updated = saveProjectAndSync(project);
                return ResponseEntity.ok(updated);
            }
            return ResponseEntity.badRequest().<Project>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    private Project saveProjectAndSync(Project project) {
        Project saved = projectRepository.save(project);
        syncTasksAndMilestones(saved);
        return saved;
    }

    private void syncTasksAndMilestones(Project project) {
        try {
            if (project.getTasks() != null) {
                java.util.Set<String> projectTaskIds = project.getTasks().stream()
                        .map(Task::getId)
                        .filter(java.util.Objects::nonNull)
                        .collect(java.util.stream.Collectors.toSet());
                taskRepository.findAll().stream()
                        .filter(t -> project.getName().equals(t.getProjectName()) && !projectTaskIds.contains(t.getId()))
                        .forEach(t -> taskRepository.deleteById(t.getId()));

                for (Task t : project.getTasks()) {
                    if (t.getId() == null || t.getId().isEmpty()) {
                        t.setId(UUID.randomUUID().toString());
                    }
                    t.setProjectName(project.getName());
                    taskRepository.save(t);
                }
            }
            if (project.getMilestones() != null) {
                java.util.Set<String> projectMilestoneIds = project.getMilestones().stream()
                        .map(Milestone::getId)
                        .filter(java.util.Objects::nonNull)
                        .collect(java.util.stream.Collectors.toSet());
                milestoneRepository.findAll().stream()
                        .filter(m -> !projectMilestoneIds.contains(m.getId()))
                        .forEach(m -> milestoneRepository.deleteById(m.getId()));

                for (Milestone m : project.getMilestones()) {
                    if (m.getId() == null || m.getId().isEmpty()) {
                        m.setId(UUID.randomUUID().toString());
                    }
                    milestoneRepository.save(m);
                }
            }
        } catch (Exception e) {
            System.err.println("Error syncing tasks/milestones: " + e.getMessage());
        }
    }
}
