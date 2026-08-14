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

    @Autowired
    private com.project.repository.TeamRepository teamRepository;

    private void populateDynamicTeams(User user) {
        if (user == null || teamRepository == null) return;
        
        java.util.List<com.project.entity.Team> teams = teamRepository.findAll();
        java.util.List<String> userTeams = new java.util.ArrayList<>();
        
        String userName = user.getName();
        String userRole = user.getRole();
        
        if (userName != null) {
            String normalizedName = userName.trim();
            if ("TEAM_LEADER".equals(userRole) || "Team Leader".equals(userRole)) {
                for (com.project.entity.Team t : teams) {
                    if (t.getLeaderName() != null && t.getLeaderName().trim().equalsIgnoreCase(normalizedName)) {
                        userTeams.add(t.getName());
                    }
                }
            }
        }
        
        if (!userTeams.isEmpty()) {
            user.setTeam(String.join(",", userTeams));
        } else if (user.getTeam() == null || user.getTeam().trim().isEmpty() || "Not Assigned".equalsIgnoreCase(user.getTeam())) {
            user.setTeam("Not Assigned");
        }
    }

    public void addUser(User user) {
        validateUser(user);
        userRepository.save(user);
    }

    public List<User> getAllUsers() {
        List<User> users = userRepository.findAll();
        for (User u : users) {
            populateDynamicTeams(u);
        }
        return users;
    }

    public org.springframework.data.domain.Page<User> getAllUsers(org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.domain.Page<User> page = userRepository.findAll(pageable);
        for (User u : page.getContent()) {
            populateDynamicTeams(u);
        }
        return page;
    }

    public User getUserById(String id) {
        User user = userRepository.findById(id).orElse(null);
        if (user != null) {
            populateDynamicTeams(user);
        }
        return user;
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
    }
}
