package com.project.controller;

import com.project.entity.MemberMetrics;
import com.project.repository.MemberMetricsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/member-metrics")
public class MemberMetricsController {

    private final MemberMetricsRepository memberMetricsRepository;

    public MemberMetricsController(MemberMetricsRepository memberMetricsRepository) {
        this.memberMetricsRepository = memberMetricsRepository;
    }

    @GetMapping
    public List<MemberMetrics> listAllMetrics() {
        return memberMetricsRepository.findAll();
    }

    @GetMapping("/team/{teamName}")
    public List<MemberMetrics> getMetricsByTeam(@PathVariable String teamName) {
        return memberMetricsRepository.findByTeamNameIgnoreCase(teamName);
    }

    @GetMapping("/member/{memberEmail}")
    public ResponseEntity<MemberMetrics> getMetricsByMember(@PathVariable String memberEmail) {
        return memberMetricsRepository.findByMemberEmailIgnoreCase(memberEmail)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public MemberMetrics saveOrUpdateMetric(@RequestBody MemberMetrics metric) {
        return memberMetricsRepository.findByMemberEmailIgnoreCase(metric.getMemberEmail())
                .map(existing -> {
                    existing.setCommitsCount(metric.getCommitsCount());
                    existing.setPrsCount(metric.getPrsCount());
                    existing.setMemberName(metric.getMemberName());
                    existing.setTeamName(metric.getTeamName());
                    return memberMetricsRepository.save(existing);
                })
                .orElseGet(() -> {
                    if (metric.getId() == null || metric.getId().isEmpty()) {
                        metric.setId(UUID.randomUUID().toString());
                    }
                    return memberMetricsRepository.save(metric);
                });
    }
}
