package com.leather.attendancesystem.repository;

import com.leather.attendancesystem.model.PasswordResetHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PasswordResetHistoryRepository extends JpaRepository<PasswordResetHistory, Integer> {
}
