package com.project.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Document(collection = "projects")
public class Project {

    @Id
    private String id;
    private String name;
    private String domain;
    private Integer health = 100;
    private String phase;
    private String mentorName;
    private Integer progress = 0;
    private String status = "Healthy"; // Healthy, Warning, Review
    private String description;
    private Integer commits = 0;
    private Integer prs = 0;
    private Integer issuesClosed = 0;
    private Integer contributionPercentage = 0;
    private String repoUrl;
    private String teamName;

    private List<Task> tasks = new ArrayList<>();
    private List<Milestone> milestones = new ArrayList<>();
    private List<WeeklyReport> weeklyReports = new ArrayList<>();
    private Map<String, Object> mentorFeedback = new HashMap<>();

    public Project() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public Integer getHealth() { return health; }
    public void setHealth(Integer health) { this.health = health; }

    public String getPhase() { return phase; }
    public void setPhase(String phase) { this.phase = phase; }

    public String getMentorName() { return mentorName; }
    public void setMentorName(String mentorName) { this.mentorName = mentorName; }

    public Integer getProgress() { return progress; }
    public void setProgress(Integer progress) { this.progress = progress; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getCommits() { return commits; }
    public void setCommits(Integer commits) { this.commits = commits; }

    public Integer getPrs() { return prs; }
    public void setPrs(Integer prs) { this.prs = prs; }

    public Integer getIssuesClosed() { return issuesClosed; }
    public void setIssuesClosed(Integer issuesClosed) { this.issuesClosed = issuesClosed; }

    public Integer getContributionPercentage() { return contributionPercentage; }
    public void setContributionPercentage(Integer contributionPercentage) { this.contributionPercentage = contributionPercentage; }

    public String getRepoUrl() { return repoUrl; }
    public void setRepoUrl(String repoUrl) { this.repoUrl = repoUrl; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public List<Task> getTasks() { return tasks; }
    public void setTasks(List<Task> tasks) { this.tasks = tasks; }

    public List<Milestone> getMilestones() { return milestones; }
    public void setMilestones(List<Milestone> milestones) { this.milestones = milestones; }

    public List<WeeklyReport> getWeeklyReports() { return weeklyReports; }
    public void setWeeklyReports(List<WeeklyReport> weeklyReports) { this.weeklyReports = weeklyReports; }

    public Map<String, Object> getMentorFeedback() { return mentorFeedback; }
    public void setMentorFeedback(Map<String, Object> mentorFeedback) { this.mentorFeedback = mentorFeedback; }
}
