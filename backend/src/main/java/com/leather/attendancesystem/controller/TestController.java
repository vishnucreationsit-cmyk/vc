package com.leather.attendancesystem.controller;

import com.leather.attendancesystem.service.EmailService;
import com.leather.attendancesystem.service.SmsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin
public class TestController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private SmsService smsService;

    @PostMapping("/send-otp")
    public ResponseEntity<?> testSendOtp(@RequestBody Map<String, String> request) {
        String method = request.get("method");
        String destination = request.get("destination");
        
        Map<String, Object> response = new HashMap<>();
        response.put("method", method);
        response.put("destination", destination);
        
        try {
            if ("EMAIL".equalsIgnoreCase(method)) {
                emailService.sendEmail(destination, "Test OTP", "This is a test OTP from the Admin panel: 123456");
                response.put("status", "SUCCESS");
                response.put("message", "Test email sent successfully.");
            } else if ("MOBILE".equalsIgnoreCase(method)) {
                smsService.sendSms(destination, "Test OTP from Admin panel: 123456");
                response.put("status", "SUCCESS");
                response.put("message", "Test SMS sent successfully.");
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid method. Use EMAIL or MOBILE."));
            }
        } catch (Exception e) {
            response.put("status", "FAILED");
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }

        return ResponseEntity.ok(response);
    }
}
