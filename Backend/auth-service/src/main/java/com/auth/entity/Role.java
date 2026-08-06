package com.auth.entity;

/**
 * The three roles this template ships with. employee-service's
 * SecurityConfig has matching hasRole(...)/hasAnyRole(...) checks that
 * reference these same names - keep them in sync if you add a role here.
 */
public enum Role {
    STUDENT,
    TEAM_LEADER,
    MENTOR,
    ADMIN
}
