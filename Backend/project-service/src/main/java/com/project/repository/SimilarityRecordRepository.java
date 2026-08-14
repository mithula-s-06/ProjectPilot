package com.project.repository;

import com.project.entity.SimilarityRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SimilarityRecordRepository extends MongoRepository<SimilarityRecord, String> {
    List<SimilarityRecord> findByReportId(String reportId);
}
