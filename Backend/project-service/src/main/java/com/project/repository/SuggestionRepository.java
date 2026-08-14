package com.project.repository;

import com.project.entity.Suggestion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SuggestionRepository extends MongoRepository<Suggestion, String> {
    List<Suggestion> findByProjectId(String projectId);
    List<Suggestion> findByRecipientEmail(String recipientEmail);
    List<Suggestion> findByTeamName(String teamName);
}
