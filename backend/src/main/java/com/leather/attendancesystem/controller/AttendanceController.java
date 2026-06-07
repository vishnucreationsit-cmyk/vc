package com.leather.attendancesystem.controller;

import com.leather.attendancesystem.model.Attendance;
import com.leather.attendancesystem.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@CrossOrigin
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/check-in")
    public ResponseEntity<Attendance> checkIn(@RequestBody Map<String, Object> request) {
        Integer employeeId = (Integer) request.get("employeeId");
        LocalDate date = LocalDate.parse((String) request.get("date"));
        LocalTime time = LocalTime.parse((String) request.get("time"));
        
        Double lat = request.get("latitude") != null ? Double.parseDouble(request.get("latitude").toString()) : null;
        Double lng = request.get("longitude") != null ? Double.parseDouble(request.get("longitude").toString()) : null;

        return ResponseEntity.ok(attendanceService.checkIn(employeeId, date, time, lat, lng));
    }

    @PostMapping("/check-out")
    public ResponseEntity<Attendance> checkOut(@RequestBody Map<String, Object> request) {
        Integer employeeId = (Integer) request.get("employeeId");
        LocalDate date = LocalDate.parse((String) request.get("date"));
        LocalTime time = LocalTime.parse((String) request.get("time"));
        
        Double lat = request.get("latitude") != null ? Double.parseDouble(request.get("latitude").toString()) : null;
        Double lng = request.get("longitude") != null ? Double.parseDouble(request.get("longitude").toString()) : null;

        return ResponseEntity.ok(attendanceService.checkOut(employeeId, date, time, lat, lng));
    }

    @GetMapping("/daily")
    public ResponseEntity<List<Attendance>> getDailyAttendance(@RequestParam String date) {
        return ResponseEntity.ok(attendanceService.getDailyAttendance(LocalDate.parse(date)));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Attendance>> getMonthlyAttendance(
            @PathVariable Integer employeeId,
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(attendanceService.getMonthlyAttendance(employeeId, month, year));
    }

    @GetMapping("/my-attendance")
    public ResponseEntity<List<Attendance>> getMyAttendance(@RequestParam Integer employeeId) {
        return ResponseEntity.ok(attendanceService.getEmployeeAttendanceHistory(employeeId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Attendance>> getAllAttendance() {
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }
}
