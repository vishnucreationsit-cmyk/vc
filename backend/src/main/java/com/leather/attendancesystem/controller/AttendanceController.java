package com.leather.attendancesystem.controller;

import com.leather.attendancesystem.model.Attendance;
import com.leather.attendancesystem.service.AttendanceService;
import com.leather.attendancesystem.service.TokenService;
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
    private final TokenService tokenService;

    @PostMapping("/request-token")
    public ResponseEntity<?> requestToken(@RequestBody Map<String, Object> request) {
        Integer employeeId = (Integer) request.get("employeeId");
        tokenService.createAndSendToken(employeeId);
        return ResponseEntity.ok(Map.of("success", true, "message", "A 6-digit OTP has been sent to your email."));
    }

    @PostMapping("/check-in")
    public ResponseEntity<Attendance> checkIn(@RequestBody Map<String, Object> request) {
        Integer employeeId = (Integer) request.get("employeeId");
        String token = (String) request.get("token");
        
        if (token == null || token.isEmpty()) {
            throw new RuntimeException("Security token is required.");
        }
        
        // Verify token first
        tokenService.verifyToken(employeeId, token);

        LocalDate date = LocalDate.parse((String) request.get("date"));
        LocalTime time = LocalTime.parse((String) request.get("time"));
        
        Double lat = request.get("latitude") != null ? Double.parseDouble(request.get("latitude").toString()) : null;
        Double lng = request.get("longitude") != null ? Double.parseDouble(request.get("longitude").toString()) : null;

        return ResponseEntity.ok(attendanceService.checkIn(employeeId, date, time, lat, lng));
    }

    @PostMapping("/check-out")
    public ResponseEntity<Attendance> checkOut(@RequestBody Map<String, Object> request) {
        Integer employeeId = (Integer) request.get("employeeId");
        String token = (String) request.get("token");

        if (token == null || token.isEmpty()) {
            throw new RuntimeException("Security token is required.");
        }
        
        // Verify token first
        tokenService.verifyToken(employeeId, token);

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
