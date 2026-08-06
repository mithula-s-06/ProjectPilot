package com.project.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.entity.User;
import com.project.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public void addUser(User user) {
        validateUser(user);
        userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public org.springframework.data.domain.Page<User> getAllUsers(org.springframework.data.domain.Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    public User getUserById(String id) {
        return userRepository.findById(id).orElse(null);
    }

    public void updateUser(User user) {
        validateUser(user);
        userRepository.save(user);
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }

    private void validateUser(User user) {
        if (user.getName() == null || user.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("User name is required");
        }

        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }

        if (user.getDepartment() == null || user.getDepartment().trim().isEmpty()) {
            throw new IllegalArgumentException("Department is required");
        }

        if (user.getSalary() == null || user.getSalary().doubleValue() <= 0) {
            throw new IllegalArgumentException("Salary must be greater than zero");
        }

        if (user.getJoinDate() == null) {
            throw new IllegalArgumentException("Join date is required");
        }
    }
}
