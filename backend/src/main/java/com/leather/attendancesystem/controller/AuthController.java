package com.leather.attendancesystem.controller;

import com.leather.attendancesystem.model.AppUser;
import com.leather.attendancesystem.model.Employee;
import com.leather.attendancesystem.repository.AppUserRepository;
import com.leather.attendancesystem.repository.EmployeeRepository;
import com.leather.attendancesystem.repository.PasswordResetOtpRepository;
import com.leather.attendancesystem.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.annotation.*;

import com.leather.attendancesystem.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final AppUserRepository appUserRepository;
    private final EmployeeRepository employeeRepository;
    
    @Autowired
    private PasswordResetOtpRepository passwordResetOtpRepository;

    @Autowired
    private com.leather.attendancesystem.repository.LoginOtpRepository loginOtpRepository;

    @Autowired
    private com.leather.attendancesystem.repository.PasswordResetHistoryRepository passwordResetHistoryRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private com.leather.attendancesystem.service.SmsService smsService;

    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        String loginType = request.get("loginType"); // "ADMIN" or "EMPLOYEE"

        java.util.Optional<AppUser> userOpt = appUserRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "User Not Found"));
        }

        AppUser appUser = userOpt.get();

        // Check Role
        if ("ADMIN".equals(loginType) && !(appUser.getRole() == AppUser.Role.ADMIN || appUser.getRole() == AppUser.Role.MANAGER)) {
            return ResponseEntity.status(403).body(Map.of("error", "Invalid Role. Please use Employee Login."));
        }
        if ("EMPLOYEE".equals(loginType) && appUser.getRole() != AppUser.Role.EMPLOYEE) {
            return ResponseEntity.status(403).body(Map.of("error", "Invalid Role. Please use Admin Login."));
        }

        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid Password"));
        } catch (DisabledException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Account Disabled"));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid Credentials"));
        }

        final org.springframework.security.core.userdetails.UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        final String jwt = jwtUtil.generateToken(userDetails);

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("role", appUser.getRole());
        response.put("username", appUser.getUsername());

        if (appUser.getEmployee() != null) {
            response.put("employeeId", appUser.getEmployee().getId());
            response.put("employeeName", appUser.getEmployee().getName());
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin-login/send-otp")
    public ResponseEntity<?> sendAdminLoginOtp(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username is required"));
        }

        java.util.Optional<AppUser> userOpt = appUserRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Admin not found"));
        }

        AppUser user = userOpt.get();
        if (user.getRole() != AppUser.Role.ADMIN && user.getRole() != AppUser.Role.MANAGER) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied. Not an admin."));
        }

        String email = user.getEmail();
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "No email registered for this admin account"));
        }

        // Invalidate old OTPs
        java.util.List<com.leather.attendancesystem.model.LoginOtp> oldOtps = loginOtpRepository.findByUser_IdAndIsUsedFalse(user.getId());
        for (com.leather.attendancesystem.model.LoginOtp oldOtp : oldOtps) {
            oldOtp.setIsUsed(true);
            loginOtpRepository.save(oldOtp);
        }

        // Generate OTP
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        com.leather.attendancesystem.model.LoginOtp loginOtp = new com.leather.attendancesystem.model.LoginOtp();
        loginOtp.setUser(user);
        loginOtp.setOtpCode(otp);
        loginOtp.setExpirationTime(java.time.LocalDateTime.now().plusMinutes(5));
        loginOtpRepository.save(loginOtp);

        try {
            emailService.sendEmail(email, "Your Admin Login OTP", "Your login OTP is: " + otp + ". Valid for 5 minutes.");
            String maskedEmail = email.substring(0, 2) + "***@" + email.split("@")[1];
            return ResponseEntity.ok(Map.of("message", "OTP sent successfully to " + maskedEmail, "userId", user.getId()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to send OTP email: " + e.getMessage()));
        }
    }

    @PostMapping("/admin-login/verify-otp")
    public ResponseEntity<?> verifyAdminLoginOtp(@RequestBody Map<String, Object> request) {
        Integer userId = (Integer) request.get("userId");
        String otpCode = (String) request.get("otpCode");

        if (userId == null || otpCode == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "userId and otpCode are required"));
        }

        java.util.List<com.leather.attendancesystem.model.LoginOtp> activeOtps = loginOtpRepository.findByUser_IdAndIsUsedFalse(userId);
        if (activeOtps.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "No active OTP found. Please request a new one."));
        }

        com.leather.attendancesystem.model.LoginOtp loginOtp = activeOtps.get(0);

        if (loginOtp.getAttemptsCount() >= 3) {
            loginOtp.setIsUsed(true);
            loginOtpRepository.save(loginOtp);
            return ResponseEntity.status(400).body(Map.of("error", "Maximum attempts reached. Please request a new OTP."));
        }

        if (loginOtp.getExpirationTime().isBefore(java.time.LocalDateTime.now())) {
            loginOtp.setIsUsed(true);
            loginOtpRepository.save(loginOtp);
            return ResponseEntity.status(400).body(Map.of("error", "OTP expired. Please request a new one."));
        }

        if (!loginOtp.getOtpCode().equals(otpCode)) {
            loginOtp.setAttemptsCount(loginOtp.getAttemptsCount() + 1);
            loginOtpRepository.save(loginOtp);
            return ResponseEntity.status(400).body(Map.of("error", "Invalid OTP. " + (3 - loginOtp.getAttemptsCount()) + " attempts remaining."));
        }

        // OTP Valid
        loginOtp.setIsUsed(true);
        loginOtpRepository.save(loginOtp);

        AppUser appUser = loginOtp.getUser();
        final org.springframework.security.core.userdetails.UserDetails userDetails = userDetailsService.loadUserByUsername(appUser.getUsername());
        final String jwt = jwtUtil.generateToken(userDetails);

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("role", appUser.getRole());
        response.put("username", appUser.getUsername());

        if (appUser.getEmployee() != null) {
            response.put("employeeId", appUser.getEmployee().getId());
            response.put("employeeName", appUser.getEmployee().getName());
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody Map<String, Object> request) {
        String username = (String) request.get("username");
        if (appUserRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        AppUser user = new AppUser();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode((String) request.get("password")));
        user.setRole(AppUser.Role.valueOf((String) request.get("role")));
        
        Integer employeeId = (Integer) request.get("employeeId");
        if (employeeId != null) {
            Employee employee = employeeRepository.findById(employeeId).orElse(null);
            user.setEmployee(employee);
        }

        appUserRepository.save(user);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, Object> request) {
        String searchTerm = (String) request.get("searchTerm");
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Search term is required"));
        }

        java.util.List<AppUser> users = appUserRepository.findBySearchTerm(searchTerm);
        if (users.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        AppUser user = users.get(0);
        String mobile = user.getEmployee() != null ? user.getEmployee().getPhone() : null;

        if (mobile == null || mobile.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "Mobile number not registered for this account"));
        }

        // Check maximum 3 resends (4 total OTPs allowed per day)
        long otpsToday = passwordResetOtpRepository.countByUser_IdAndCreatedAtAfter(
            user.getId(), java.time.LocalDateTime.now().truncatedTo(java.time.temporal.ChronoUnit.DAYS));
        if (otpsToday >= 4) {
            return ResponseEntity.status(429).body(Map.of("error", "Maximum resend limit reached for today."));
        }

        // Invalidate previous active OTPs
        java.util.List<com.leather.attendancesystem.model.PasswordResetOtp> oldOtps = passwordResetOtpRepository.findByUser_IdAndIsUsedFalse(user.getId());
        for (com.leather.attendancesystem.model.PasswordResetOtp oldOtp : oldOtps) {
            oldOtp.setIsUsed(true);
            passwordResetOtpRepository.save(oldOtp);
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));

        com.leather.attendancesystem.model.PasswordResetOtp resetOtp = new com.leather.attendancesystem.model.PasswordResetOtp();
        resetOtp.setUser(user);
        resetOtp.setOtpCode(otp);
        resetOtp.setExpirationTime(java.time.LocalDateTime.now().plusMinutes(5));
        resetOtp.setIsUsed(false);
        resetOtp.setAttemptsCount(0);
        passwordResetOtpRepository.save(resetOtp);

        String maskedMobile = mobile.substring(0, Math.min(2, mobile.length())) + "******" + 
                              (mobile.length() > 2 ? mobile.substring(mobile.length() - 2) : "");

        try {
            smsService.sendSms(mobile, "Your LeatherWorks Pro password reset OTP is: " + otp + ". Valid for 5 minutes.");
            System.out.println("OTP Delivery Status: SUCCESS");
            return ResponseEntity.ok(Map.of("message", "OTP sent successfully to your registered mobile number.", "maskedMobile", maskedMobile, "userId", user.getId()));
        } catch (Exception e) {
            System.out.println("OTP Delivery Status: FAILED - " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Failed to send OTP SMS. " + e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, Object> request) {
        Integer userId = (Integer) request.get("userId");
        String otpCode = (String) request.get("otpCode");
        
        java.util.List<com.leather.attendancesystem.model.PasswordResetOtp> activeOtps = passwordResetOtpRepository.findByUser_IdAndIsUsedFalse(userId);
        if (activeOtps.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "No active OTP found. Please request a new one."));
        }
        
        com.leather.attendancesystem.model.PasswordResetOtp resetOtp = activeOtps.get(0);
        
        if (resetOtp.getAttemptsCount() >= 3) {
            resetOtp.setIsUsed(true);
            passwordResetOtpRepository.save(resetOtp);
            return ResponseEntity.status(400).body(Map.of("error", "Maximum attempts reached. Please request a new OTP."));
        }
        
        if (resetOtp.getExpirationTime().isBefore(java.time.LocalDateTime.now())) {
            resetOtp.setIsUsed(true);
            passwordResetOtpRepository.save(resetOtp);
            return ResponseEntity.status(400).body(Map.of("error", "OTP expired. Please request a new one."));
        }
        
        if (!resetOtp.getOtpCode().equals(otpCode)) {
            resetOtp.setAttemptsCount(resetOtp.getAttemptsCount() + 1);
            passwordResetOtpRepository.save(resetOtp);
            return ResponseEntity.status(400).body(Map.of("error", "Invalid OTP. " + (3 - resetOtp.getAttemptsCount()) + " attempts remaining."));
        }
        
        String resetToken = java.util.UUID.randomUUID().toString();
        resetOtp.setIsUsed(true);
        resetOtp.setResetToken(resetToken);
        passwordResetOtpRepository.save(resetOtp);
        
        return ResponseEntity.ok(Map.of("message", "OTP Verified Successfully", "resetToken", resetToken));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, Object> request) {
        String resetToken = (String) request.get("resetToken");
        String newPassword = (String) request.get("newPassword");
        String method = (String) request.get("method"); // Pass the method from frontend for audit log
        
        java.util.Optional<com.leather.attendancesystem.model.PasswordResetOtp> otpOpt = 
            passwordResetOtpRepository.findByResetTokenAndIsUsedFalse(resetToken);
            
        if (otpOpt.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "Invalid or expired reset token"));
        }

        com.leather.attendancesystem.model.PasswordResetOtp resetOtp = otpOpt.get();
        AppUser user = resetOtp.getUser();
        
        user.setPassword(passwordEncoder.encode(newPassword));
        appUserRepository.save(user);

        // Mark token as used to prevent reuse
        resetOtp.setIsUsed(true);
        passwordResetOtpRepository.save(resetOtp);
        
        // Audit log
        com.leather.attendancesystem.model.PasswordResetHistory history = new com.leather.attendancesystem.model.PasswordResetHistory();
        history.setUserId(user.getId());
        history.setUsername(user.getUsername());
        history.setResetMethod(method != null ? method : "UNKNOWN");
        // Getting remote IP would require HttpServletRequest, we'll use a placeholder or omit for simplicity
        history.setIpAddress("127.0.0.1"); 
        passwordResetHistoryRepository.save(history);

        System.out.println("================= PASSWORD RESET DEBUG =======================");
        System.out.println("User ID: " + user.getId());
        System.out.println("Password Update Status: SUCCESS");
        System.out.println("=========================================================");
        
        return ResponseEntity.ok(Map.of("message", "Password updated successfully. Please login using your new password."));
    }
}
