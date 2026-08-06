package com.project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * The original version extended SpringBootServletInitializer to also
 * support WAR deployment for JSP. Now that this service only serves JSON
 * on an embedded server, that's no longer needed - runs as a plain jar.
 */
@SpringBootApplication
public class ProjectPilotApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProjectPilotApplication.class, args);
    }
}
