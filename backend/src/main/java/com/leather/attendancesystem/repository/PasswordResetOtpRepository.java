package com.leather.attendancesystem.repository;

import com.leather.attendancesystem.model.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Integer> {
    Optional<PasswordResetOtp> findByUser_IdAndOtpCodeAndIsUsedFalse(Integer userId, String otpCode);
    Optional<PasswordResetOtp> findByResetTokenAndIsUsedFalse(String resetToken);
    java.util.List<PasswordResetOtp> findByUser_IdAndIsUsedFalse(Integer userId);
    long countByUser_IdAndCreatedAtAfter(Integer userId, java.time.LocalDateTime date);
}
