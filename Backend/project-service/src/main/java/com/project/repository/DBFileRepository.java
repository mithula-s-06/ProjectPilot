package com.project.repository;

import com.project.entity.DBFile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DBFileRepository extends MongoRepository<DBFile, String> {
}
