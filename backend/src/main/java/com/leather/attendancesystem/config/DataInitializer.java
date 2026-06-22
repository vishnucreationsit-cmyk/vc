package com.leather.attendancesystem.config;

import com.leather.attendancesystem.model.AppUser;
import com.leather.attendancesystem.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        Optional<AppUser> adminOpt = appUserRepository.findByUsername("admin");

        AppUser admin;
        if (adminOpt.isEmpty()) {
            admin = new AppUser();
            admin.setUsername("admin");
        } else {
            admin = adminOpt.get();
        }

        // =========================================================================
        // CHANGE ADMIN PASSWORD HERE
        // =========================================================================
        // Update "admin123" below to your desired admin password.
        // The system will automatically encrypt it and update the database on startup.
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(AppUser.Role.ADMIN);
        admin.setEmail("vishnucreationsit@gmail.com");

        appUserRepository.save(admin);
        System.out.println("Admin password successfully synced with DataInitializer");

        // Clean up visitor table
        try {
            jdbcTemplate.execute("DROP TABLE IF EXISTS visitor");
            System.out.println("Successfully dropped visitor table");
        } catch (Exception e) {
            System.out.println("Could not drop visitor table: " + e.getMessage());
        }
    }
}
