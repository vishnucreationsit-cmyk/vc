package com.leather.attendancesystem.controller;

import com.leather.attendancesystem.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/today-stats")
    public ResponseEntity<Map<String, Object>> getTodayStats() {
        return ResponseEntity.ok(dashboardService.getTodayStats());
    }

    @GetMapping("/monthly-summary")
    public ResponseEntity<Map<String, Object>> getMonthlySummary(
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(dashboardService.getMonthlySummary(month, year));
    }

    @GetMapping("/order-stats")
    public ResponseEntity<Map<String, Object>> getOrderStats() {
        return ResponseEntity.ok(dashboardService.getOrderStats());
    }
}
