package com.project.config;

import com.project.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Role scheme used throughout this service: EMPLOYEE, MANAGER, ADMIN
 * (must match the roles issued by auth-service - see com.auth.entity.Role
 * there). Two ways to enforce roles are shown here on purpose, so students
 * see both styles:
 *   1. URL/method-based, below, via requestMatchers(...).hasAnyRole(...)
 *   2. Annotation-based, via @EnableMethodSecurity + @PreAuthorize on
 *      EmployeeController.deleteEmployee()
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                    // Without this, an unhandled exception (e.g. a DB error)
                    // gets forwarded internally to /error, which then hits
                    // this same rule set - and since it's not permitted, you
                    // see a misleading 403 instead of the real 500.
                    .requestMatchers("/error").permitAll()
                    .requestMatchers("/api/files/upload", "/api/files/download/**", "/api/users/extract-skills").permitAll()
                    // Read access: any logged-in user with any project role.
                    .requestMatchers(HttpMethod.GET, "/api/users/**", "/api/projects/**", "/api/teams/**", "/api/notifications/**", "/api/files/**")
                        .hasAnyRole("STUDENT", "TEAM_LEADER", "MENTOR", "ADMIN")
                    // Create/update: users with any project role.
                    .requestMatchers(HttpMethod.POST, "/api/users/**", "/api/projects/**", "/api/teams/**", "/api/notifications/**", "/api/files/**")
                        .hasAnyRole("STUDENT", "TEAM_LEADER", "MENTOR", "ADMIN")
                    .requestMatchers(HttpMethod.PUT, "/api/users/**", "/api/projects/**", "/api/teams/**", "/api/notifications/**")
                        .hasAnyRole("STUDENT", "TEAM_LEADER", "MENTOR", "ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/users/**", "/api/projects/**", "/api/teams/**", "/api/notifications/**")
                        .hasAnyRole("STUDENT", "TEAM_LEADER", "MENTOR", "ADMIN")
                    .anyRequest().authenticated())
            .exceptionHandling(handling -> handling
                    // No token / bad token -> 401 with a JSON body instead of
                    // Spring Security's default empty response.
                    .authenticationEntryPoint((request, response, ex) -> {
                        response.setStatus(HttpStatus.UNAUTHORIZED.value());
                        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                        response.getWriter().write("{\"error\":\"Missing or invalid token\"}");
                    })
                    // Valid token, wrong role -> 403 with a JSON body.
                    .accessDeniedHandler((request, response, ex) -> {
                        response.setStatus(HttpStatus.FORBIDDEN.value());
                        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                        response.getWriter().write("{\"error\":\"You do not have permission for this action\"}");
                    }))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        configuration.setAllowedOrigins(java.util.List.of("http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://127.0.0.1:5173"));
        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(java.util.List.of("Authorization", "Content-Type", "Cache-Control"));
        configuration.setAllowCredentials(true);
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
