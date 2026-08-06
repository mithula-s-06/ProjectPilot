package com.project.repository;

import com.project.entity.Team;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRepository extends MongoRepository<Team, String> {
    List<Team> findByMentorName(String mentorName);
    Page<Team> findAll(Pageable pageable);
}
