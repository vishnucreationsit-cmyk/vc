package com.leather.attendancesystem.repository;

import com.leather.attendancesystem.model.AttendanceToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceTokenRepository extends JpaRepository<AttendanceToken, Long> {
    Optional<AttendanceToken> findFirstByUserIdAndIsUsedFalseOrderByCreatedAtDesc(Integer userId);
    List<AttendanceToken> findByUserIdAndIsUsedFalse(Integer userId);
}
