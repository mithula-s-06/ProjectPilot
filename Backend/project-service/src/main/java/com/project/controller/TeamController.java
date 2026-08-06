package com.project.controller;

import com.project.entity.Team;
import com.project.repository.TeamRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamRepository teamRepository;

    public TeamController(TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
    }

    @GetMapping
    public List<Team> listTeams(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Boolean paginate) {
        if (paginate != null && paginate) {
            return teamRepository.findAll(org.springframework.data.domain.PageRequest.of(page, size)).getContent();
        }
        return teamRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Team> getTeam(@PathVariable String id) {
        return teamRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Team createTeam(@RequestBody Team team) {
        if (team.getId() == null || team.getId().isEmpty()) {
            team.setId(UUID.randomUUID().toString());
        }
        return teamRepository.save(team);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Team> updateTeam(@PathVariable String id, @RequestBody Team teamDetails) {
        return teamRepository.findById(id).map(team -> {
            team.setName(teamDetails.getName());
            team.setProjectId(teamDetails.getProjectId());
            team.setProjectName(teamDetails.getProjectName());
            team.setMentorName(teamDetails.getMentorName());
            team.setHealth(teamDetails.getHealth());
            team.setLeaderName(teamDetails.getLeaderName());
            team.setMembersCount(teamDetails.getMembersCount());
            team.setStatus(teamDetails.getStatus());
            team.setRank(teamDetails.getRank());
            Team updated = teamRepository.save(team);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }
}
