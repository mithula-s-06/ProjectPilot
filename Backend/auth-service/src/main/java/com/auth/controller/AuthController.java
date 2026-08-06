package com.auth.controller;

import com.auth.dto.AuthResponse;
import com.auth.dto.LoginRequest;
import com.auth.dto.RegisterRequest;
import com.auth.entity.AppUser;
import com.auth.entity.Role;
import com.auth.repository.AppUserRepository;
import com.auth.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthController(AppUserRepository appUserRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           JwtUtil jwtUtil) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Creates a new user. Password is hashed before it ever touches the
     * database. "role" is optional and defaults to EMPLOYEE - pass
     * "MANAGER" or "ADMIN" here when you need a test account with more
     * access for trying out employee-service's role checks.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (appUserRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        String requestedRole = request.getRole() == null || request.getRole().isBlank()
                ? Role.STUDENT.name()
                : request.getRole().trim().toUpperCase();

        boolean validRole = Arrays.stream(Role.values())
                .anyMatch(role -> role.name().equals(requestedRole));
        if (!validRole) {
            return ResponseEntity.badRequest().body(
                    "Invalid role. Must be one of: " + Arrays.toString(Role.values()));
        }

        if (requestedRole.equals(Role.ADMIN.name())) {
            return ResponseEntity.badRequest().body("Registration of ADMIN accounts is not permitted.");
        }

        AppUser user = new AppUser();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(requestedRole);
        appUserRepository.save(user);

        return ResponseEntity.ok("User registered successfully");
    }

    /**
     * Verifies email/password, and if correct, issues a JWT signed with the
     * shared secret. The client then sends that token to EITHER this service
     * OR employee-service (port 8082) - both accept it.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        AppUser user = appUserRepository.findByEmail(request.getEmail()).orElseThrow();

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole());
        return ResponseEntity.ok(new AuthResponse(token, user.getId(), user.getEmail(), user.getRole(), user.getName()));
    }
}
