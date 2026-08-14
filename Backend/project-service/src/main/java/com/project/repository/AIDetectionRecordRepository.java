package com.project.repository;

import com.project.entity.AIDetectionRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIDetectionRecordRepository extends MongoRepository<AIDetectionRecord, String> {
    List<AIDetectionRecord> findByReportId(String reportId);
}
