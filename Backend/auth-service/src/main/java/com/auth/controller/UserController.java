package com.auth.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class UserController {

    /**
     * Try calling this WITHOUT a token -> 401/403.
     * Then call it again WITH "Authorization: Bearer <token>" -> 200 OK.
     * Same pattern secures every endpoint in employee-service too.
     */
    @GetMapping("/api/users/me")
    public String me(@AuthenticationPrincipal UserDetails currentUser) {
        return "Logged in as: " + currentUser.getUsername();
    }
}
