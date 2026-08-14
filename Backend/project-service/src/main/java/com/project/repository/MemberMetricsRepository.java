package com.project.repository;

import com.project.entity.MemberMetrics;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface MemberMetricsRepository extends MongoRepository<MemberMetrics, String> {
    List<MemberMetrics> findByTeamNameIgnoreCase(String teamName);
    Optional<MemberMetrics> findByMemberEmailIgnoreCase(String memberEmail);
}
