package com.project.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.project.entity.User;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Page<User> findAll(Pageable pageable);
}
