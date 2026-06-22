package com.leather.attendancesystem.service;

import com.leather.attendancesystem.model.Attendance;
import com.leather.attendancesystem.model.Employee;
import com.leather.attendancesystem.model.Notification;
import com.leather.attendancesystem.repository.AttendanceRepository;
import com.leather.attendancesystem.repository.EmployeeRepository;
import com.leather.attendancesystem.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationRepository notificationRepository;
    private final GeofenceService geofenceService;

    @Transactional
    public Attendance checkIn(Integer employeeId, LocalDate date, LocalTime checkInTime, Double latitude, Double longitude) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (attendanceRepository.findByEmployeeIdAndAttendanceDate(employeeId, date).isPresent()) {
            throw new RuntimeException("Already checked in today");
        }

        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setAttendanceDate(date);
        attendance.setCheckInTime(checkInTime);

        if (latitude == null || longitude == null) {
            throw new RuntimeException("Location access is required for attendance");
        }

        double distance = geofenceService.calculateDistanceMeters(geofenceService.getCompanyLat(), geofenceService.getCompanyLng(), latitude, longitude);
        if (distance > geofenceService.getAllowedRadiusMeters()) {
            throw new RuntimeException("Check-In failed. You are outside the company premises.");
        }

        attendance.setLocationLat(BigDecimal.valueOf(latitude));
        attendance.setLocationLng(BigDecimal.valueOf(longitude));
        attendance.setDistanceFromOffice(distance);

        // Late logic calculation
        LocalTime shiftStart = employee.getShiftStartTime();
        
        if (checkInTime.isAfter(shiftStart)) {
            long minutesLate = Duration.between(shiftStart, checkInTime).toMinutes();
            attendance.setMinutesLate((int) minutesLate);
            
            if (minutesLate > 60) {
                attendance.setStatus(Attendance.AttendanceStatus.VERY_LATE);
                attendance.setIsLate(true);
            } else if (minutesLate > employee.getGracePeriodMinutes()) {
                attendance.setStatus(Attendance.AttendanceStatus.LATE);
                attendance.setIsLate(true);
            } else {
                attendance.setStatus(Attendance.AttendanceStatus.PRESENT);
            }
        } else {
            attendance.setStatus(Attendance.AttendanceStatus.PRESENT);
            attendance.setMinutesLate(0);
        }

        Attendance saved = attendanceRepository.save(attendance);
        
        Notification notification = new Notification();
        notification.setTitle("Employee Checked In");
        notification.setMessage(String.format("Name: %s\nID: %s\nTime: %s\nStatus: %s",
                employee.getName(), employee.getEmployeeId(), attendance.getCheckInTime(), attendance.getStatus()));
        notification.setType("ATTENDANCE");
        notificationRepository.save(notification);
        
        return saved;
    }

    @Transactional
    public Attendance checkOut(Integer employeeId, LocalDate date, LocalTime checkOutTime, Double latitude, Double longitude) {
        Attendance attendance = attendanceRepository.findByEmployeeIdAndAttendanceDate(employeeId, date)
                .orElseThrow(() -> new RuntimeException("Attendance record not found for today"));

        if (attendance.getCheckOutTime() != null) {
            throw new RuntimeException("Already checked out today");
        }

        if (latitude == null || longitude == null) {
            throw new RuntimeException("Location access is required for attendance");
        }

        double distance = geofenceService.calculateDistanceMeters(geofenceService.getCompanyLat(), geofenceService.getCompanyLng(), latitude, longitude);
        if (distance > geofenceService.getAllowedRadiusMeters()) {
            throw new RuntimeException("Check-Out failed. You must be inside the company premises.");
        }

        attendance.setCheckOutTime(checkOutTime);

        // Calculate total hours
        Duration duration = Duration.between(attendance.getCheckInTime(), checkOutTime);
        double hours = duration.toMinutes() / 60.0;
        attendance.setTotalHours(BigDecimal.valueOf(hours).setScale(2, RoundingMode.HALF_UP));

        // Calculate overtime (assuming > 9 hours is overtime)
        if (hours > 9.0) {
            attendance.setOvertimeHours(BigDecimal.valueOf(hours - 9.0).setScale(2, RoundingMode.HALF_UP));
        }

        Attendance saved = attendanceRepository.save(attendance);
        
        Notification notification = new Notification();
        notification.setTitle("Employee Checked Out");
        notification.setMessage(String.format("Name: %s\nID: %s\nTime: %s\nTotal Hours: %s",
                attendance.getEmployee().getName(), attendance.getEmployee().getEmployeeId(), attendance.getCheckOutTime(), attendance.getTotalHours()));
        notification.setType("ATTENDANCE");
        notificationRepository.save(notification);
        
        return saved;
    }

    public List<Attendance> getDailyAttendance(LocalDate date) {
        return attendanceRepository.findByAttendanceDate(date);
    }

    public List<Attendance> getMonthlyAttendance(Integer employeeId, int month, int year) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        return attendanceRepository.findByEmployeeIdAndAttendanceDateBetween(employeeId, startDate, endDate);
    }

    public List<Attendance> getEmployeeAttendanceHistory(Integer employeeId) {
        return attendanceRepository.findByEmployeeIdOrderByAttendanceDateDesc(employeeId);
    }

    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }
}
