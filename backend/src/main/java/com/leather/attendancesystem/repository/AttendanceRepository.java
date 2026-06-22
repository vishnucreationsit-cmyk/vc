package com.leather.attendancesystem.repository;

import com.leather.attendancesystem.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {
    Optional<Attendance> findByEmployeeIdAndAttendanceDate(Integer employeeId, LocalDate date);
    List<Attendance> findByEmployeeIdAndAttendanceDateBetween(Integer employeeId, LocalDate from, LocalDate to);
    List<Attendance> findByAttendanceDate(LocalDate date);
    List<Attendance> findByEmployeeIdOrderByAttendanceDateDesc(Integer employeeId);
    List<Attendance> findByAttendanceDateBetween(LocalDate from, LocalDate to);
}
