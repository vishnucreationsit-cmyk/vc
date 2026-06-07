package com.leather.attendancesystem.repository;

import com.leather.attendancesystem.model.LoginOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoginOtpRepository extends JpaRepository<LoginOtp, Integer> {
    java.util.List<LoginOtp> findByUser_IdAndIsUsedFalse(Integer userId);
    long countByUser_IdAndCreatedAtAfter(Integer userId, java.time.LocalDateTime date);
}
