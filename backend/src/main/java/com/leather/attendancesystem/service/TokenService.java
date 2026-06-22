package com.leather.attendancesystem.service;

import com.leather.attendancesystem.model.AppUser;
import com.leather.attendancesystem.model.AttendanceToken;
import com.leather.attendancesystem.repository.AppUserRepository;
import com.leather.attendancesystem.repository.AttendanceTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.leather.attendancesystem.service.EmailService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final AttendanceTokenRepository tokenRepository;
    private final AppUserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    private static final int EXPIRY_MINUTES = 10;
    private static final int MAX_ATTEMPTS = 3;

    @Transactional
    public void createAndSendToken(Integer employeeId) {
        AppUser user = userRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new RuntimeException("User account not found for this employee"));
        
        Integer userId = user.getId();

        // Invalidate previous tokens
        List<AttendanceToken> oldTokens = tokenRepository.findByUserIdAndIsUsedFalse(userId);
        for (AttendanceToken t : oldTokens) {
            t.setIsUsed(true);
        }
        tokenRepository.saveAll(oldTokens);

        // Generate 6-digit OTP
        String rawToken = String.format("%06d", new Random().nextInt(999999));
        
        AttendanceToken token = new AttendanceToken();
        token.setUser(user);
        token.setTokenHash(passwordEncoder.encode(rawToken));
        token.setExpiresAt(LocalDateTime.now().plusMinutes(EXPIRY_MINUTES));
        token.setFailedAttempts(0);
        token.setIsUsed(false);
        tokenRepository.save(token);

        System.out.println("====== SECURITY OTP (FOR TESTING) ======");
        System.out.println("OTP: " + rawToken);
        System.out.println("========================================");

        try {
            String htmlMessage = String.format("""
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #4a3f35;">Attendance Check-In Token</h2>
                    <p>Your security token for attendance verification is:</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 20px 0;">
                        %s
                    </div>
                    <p style="color: #666; font-size: 14px;">This token expires in 10 minutes. If you did not request this, please ignore this email.</p>
                </div>
                """, rawToken);
                
            emailService.sendEmail(user.getEmail(), "Your Attendance Security Token", htmlMessage);
        } catch (Exception e) {
            System.err.println("Failed to send email. Check SMTP configuration. Error: " + e.getMessage());
        }
    }

    @Transactional
    public void verifyToken(Integer employeeId, String rawToken) {
        AppUser user = userRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new RuntimeException("User account not found for this employee"));
                
        AttendanceToken token = tokenRepository.findFirstByUserIdAndIsUsedFalseOrderByCreatedAtDesc(user.getId())
                .orElseThrow(() -> new RuntimeException("No active token found. Please request a new one."));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            token.setIsUsed(true);
            tokenRepository.save(token);
            throw new RuntimeException("Token has expired. Please request a new one.");
        }

        if (token.getFailedAttempts() >= MAX_ATTEMPTS) {
            token.setIsUsed(true);
            tokenRepository.save(token);
            throw new RuntimeException("Too many failed attempts. Token invalidated.");
        }

        if (!passwordEncoder.matches(rawToken, token.getTokenHash())) {
            token.setFailedAttempts(token.getFailedAttempts() + 1);
            tokenRepository.save(token);
            throw new RuntimeException("Invalid token. Attempts left: " + (MAX_ATTEMPTS - token.getFailedAttempts()));
        }

        // Success
        token.setIsUsed(true);
        tokenRepository.save(token);
    }
}
