package com.project.controller;

import com.project.entity.User;
import com.project.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Was a browser-facing @Controller returning JSP view names
 * ("employee-list", "employee-form"). As a microservice, this now returns
 * JSON instead - the natural shape for something meant to be called by
 * other services, a Postman collection, or a separate frontend app.
 *
 * UserService and UserRepository underneath are UNCHANGED from the
 * original project - only this controller layer changed.
 */
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Boolean paginate) {
        if (paginate != null && paginate) {
            return userService.getAllUsers(org.springframework.data.domain.PageRequest.of(page, size)).getContent();
        }
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable String id) {
        User user = userService.getUserById(id);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            userService.addUser(user);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(exception.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody User user) {
        if (userService.getUserById(id) == null) {
            return ResponseEntity.notFound().build();
        }
        try {
            user.setId(id);
            userService.updateUser(user);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(exception.getMessage());
        }
    }

    // Delete is restricted with @PreAuthorize instead of a requestMatcher in
    // SecurityConfig - the second style of role check, enforced right next
    // to the method it protects. Only ADMIN can delete a user.
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        if (userService.getUserById(id) == null) {
            return ResponseEntity.notFound().build();
        }
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
