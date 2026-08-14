package com.project.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "github")
public class MemberMetrics {

    @Id
    private String id;
    private String memberName;
    private String memberEmail;
    private String teamName;
    private Integer commitsCount = 0;
    private Integer prsCount = 0;

    public MemberMetrics() {}

    public MemberMetrics(String id, String memberName, String memberEmail, String teamName, Integer commitsCount, Integer prsCount) {
        this.id = id;
        this.memberName = memberName;
        this.memberEmail = memberEmail;
        this.teamName = teamName;
        this.commitsCount = commitsCount;
        this.prsCount = prsCount;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMemberName() { return memberName; }
    public void setMemberName(String memberName) { this.memberName = memberName; }

    public String getMemberEmail() { return memberEmail; }
    public void setMemberEmail(String memberEmail) { this.memberEmail = memberEmail; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public Integer getCommitsCount() { return commitsCount; }
    public void setCommitsCount(Integer commitsCount) { this.commitsCount = commitsCount; }

    public Integer getPrsCount() { return prsCount; }
    public void setPrsCount(Integer prsCount) { this.prsCount = prsCount; }
}
