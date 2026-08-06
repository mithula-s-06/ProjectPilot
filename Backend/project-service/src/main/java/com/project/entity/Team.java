package com.project.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "teams")
public class Team {

    @Id
    private String id;
    private String name;
    private String projectId;
    private String projectName;
    private String mentorName;
    private Integer health = 100;
    private String leaderName;
    private Integer membersCount = 0;
    private String status = "Good";
    private Integer rank;

    public Team() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public String getMentorName() { return mentorName; }
    public void setMentorName(String mentorName) { this.mentorName = mentorName; }

    public Integer getHealth() { return health; }
    public void setHealth(Integer health) { this.health = health; }

    public String getLeaderName() { return leaderName; }
    public void setLeaderName(String leaderName) { this.leaderName = leaderName; }

    public Integer getMembersCount() { return membersCount; }
    public void setMembersCount(Integer membersCount) { this.membersCount = membersCount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getRank() { return rank; }
    public void setRank(Integer rank) { this.rank = rank; }
}
