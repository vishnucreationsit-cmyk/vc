package com.leather.attendancesystem.controller;

import com.leather.attendancesystem.service.GeofenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/geofence")
@RequiredArgsConstructor
@CrossOrigin
public class GeofenceController {

    private final GeofenceService geofenceService;

    @GetMapping("/config")
    public ResponseEntity<Map<String, Double>> getConfig() {
        Map<String, Double> config = new HashMap<>();
        config.put("companyLat", geofenceService.getCompanyLat());
        config.put("companyLng", geofenceService.getCompanyLng());
        config.put("allowedRadiusMeters", geofenceService.getAllowedRadiusMeters());
        return ResponseEntity.ok(config);
    }

    @PostMapping("/config")
    public ResponseEntity<Map<String, String>> updateConfig(@RequestBody Map<String, Double> request) {
        geofenceService.updateGeofenceSettings(
                request.get("companyLat"),
                request.get("companyLng"),
                request.get("allowedRadiusMeters")
        );
        Map<String, String> response = new HashMap<>();
        response.put("message", "Geofence configuration updated successfully");
        return ResponseEntity.ok(response);
    }
}
