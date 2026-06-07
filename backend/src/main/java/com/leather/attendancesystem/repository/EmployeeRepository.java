package com.leather.attendancesystem.repository;

import com.leather.attendancesystem.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    Optional<Employee> findByEmployeeId(String employeeId);
    List<Employee> findByStatus(Employee.EmployeeStatus status);
}
