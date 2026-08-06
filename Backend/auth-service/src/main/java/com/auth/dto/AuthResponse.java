package com.auth.dto;

public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private String userId;
    private String email;
    private String role;
    private String name;

    public AuthResponse(String token, String userId, String email, String role, String name) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.name = name;
    }

    public String getToken() { return token; }
    public String getTokenType() { return tokenType; }
    public String getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getName() { return name; }
}
