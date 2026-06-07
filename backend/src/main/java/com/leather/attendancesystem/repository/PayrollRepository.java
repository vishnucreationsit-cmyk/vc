package com.leather.attendancesystem.repository;

import com.leather.attendancesystem.model.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Integer> {
    Optional<Payroll> findByEmployeeIdAndMonthAndYear(Integer employeeId, Integer month, Integer year);
    List<Payroll> findByMonthAndYear(Integer month, Integer year);
    List<Payroll> findByEmployeeIdOrderByYearDescMonthDesc(Integer employeeId);
}
