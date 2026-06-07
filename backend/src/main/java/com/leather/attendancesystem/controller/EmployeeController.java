package com.leather.attendancesystem.controller;

import com.leather.attendancesystem.model.Employee;
import com.leather.attendancesystem.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import com.leather.attendancesystem.service.EmailService;
import com.leather.attendancesystem.repository.AppUserRepository;
import com.leather.attendancesystem.model.AppUser;
import java.util.Optional;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@CrossOrigin
public class EmployeeController {

    private final EmployeeService employeeService;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @GetMapping("/active-only")
    public ResponseEntity<List<Employee>> getActiveEmployees() {
        return ResponseEntity.ok(employeeService.getActiveEmployees());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Integer id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @PostMapping
    public ResponseEntity<Employee> createEmployee(@RequestBody Employee employee) {
        return ResponseEntity.ok(employeeService.createEmployee(employee));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(@PathVariable Integer id, @RequestBody Employee employee) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, employee));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Integer id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/send-credentials")
    public ResponseEntity<?> sendCredentials(@PathVariable Integer id) {
        Employee employee = employeeService.getEmployeeById(id);
        if (employee.getEmail() == null || employee.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Employee does not have an email address"));
        }

        Optional<AppUser> userOpt = appUserRepository.findByEmployeeId(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Employee does not have a login account created yet"));
        }

        AppUser appUser = userOpt.get();
        String tempPassword = UUID.randomUUID().toString().substring(0, 8);
        
        appUser.setPassword(passwordEncoder.encode(tempPassword));
        appUserRepository.save(appUser);

        String subject = "Your Vishnu Creations Portal Credentials";
        String htmlMessage = String.format("""
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #4a3f35;">Welcome to Vishnu Creations, %s!</h2>
                <p>Your onboarding is complete. Here are your portal access details and schedule:</p>
                
                <table style="border-collapse: collapse; width: 100%%; max-width: 500px; margin-bottom: 20px;">
                    <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 40%%;">Employee ID</td><td style="padding: 8px; border: 1px solid #ddd;">%s</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Department</td><td style="padding: 8px; border: 1px solid #ddd;">%s</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Shift Timings</td><td style="padding: 8px; border: 1px solid #ddd;">%s - %s</td></tr>
                </table>

                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #8b5e34; margin-bottom: 20px;">
                    <h3 style="margin-top: 0; color: #8b5e34;">Login Credentials</h3>
                    <p><strong>Portal URL:</strong> <a href="https://www.vishnucreations.shop/login">https://www.vishnucreations.shop/login</a></p>
                    <p><strong>Employee ID (Username):</strong> %s</p>
                    <p><strong>Temporary Password:</strong> %s</p>
                </div>

                <p style="color: #666; font-size: 14px;"><i>Note: Please log in and change your password immediately.</i></p>
            </div>
            """,
            employee.getName(),
            employee.getEmployeeId(),
            employee.getDepartment(),
            employee.getShiftStartTime(),
            employee.getShiftEndTime(),
            appUser.getUsername(),
            tempPassword
        );

        try {
            emailService.sendEmail(employee.getEmail(), subject, htmlMessage);
            return ResponseEntity.ok(Map.of("message", "Credentials sent successfully to " + employee.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to send email: " + e.getMessage()));
        }
    }
}
