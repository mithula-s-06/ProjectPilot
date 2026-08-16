package com.auth.config;

import com.auth.entity.AppUser;
import com.auth.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeder to create a single default Admin user if none exists in the database on startup.
 */
@Component
public class AdminSeeder implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AdminSeeder(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (appUserRepository.findByEmail("admin@pp.edu") == null) {
            AppUser admin = new AppUser();
            admin.setName("System Administrator");
            admin.setEmail("admin@pp.edu");
            admin.setPassword(passwordEncoder.encode("ADMIN"));
            admin.setRole("ADMIN");
            appUserRepository.save(admin);
            System.out.println("[AdminSeeder] Default administrator (admin@pp.edu) successfully pre-seeded.");
        }
    }
}
