package com.leather.attendancesystem.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

@Service
public class SmsService {

    @Value("${sms.api.url:}")
    private String apiUrl;

    @Value("${sms.api.key:}")
    private String apiKey;

    @PostConstruct
    public void init() {
        if (apiUrl == null || apiUrl.trim().isEmpty() || apiKey == null || apiKey.trim().isEmpty()) {
            System.err.println("=========================================================");
            System.err.println("WARNING: SMS service is not configured. OTP SMS cannot be sent.");
            System.err.println("Please configure sms.api properties in application.properties");
            System.err.println("=========================================================");
        }
    }
    public void sendSms(String to, String message) {
        if (apiUrl == null || apiUrl.trim().isEmpty() || apiKey == null || apiKey.trim().isEmpty()) {
            System.out.println("=========================================================");
            System.out.println("DEVELOPMENT MODE: Simulating SMS to " + to);
            System.out.println("Message: " + message);
            System.out.println("Status: SIMULATED SUCCESS");
            System.out.println("=========================================================");
            return; 
        }

        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("authorization", apiKey);
            headers.set("Content-Type", "application/json");

            java.util.Map<String, Object> body = new java.util.HashMap<>();
            body.put("route", "q");
            body.put("message", message);
            body.put("flash", 0);
            body.put("numbers", to);

            org.springframework.http.HttpEntity<java.util.Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(body, headers);

            org.springframework.http.ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && response.getBody().contains("\"return\":true")) {
                System.out.println("SMS successfully delivered by Fast2SMS to " + to);
            } else {
                throw new RuntimeException("SMS Provider rejected the delivery. Response: " + response.getBody());
            }
        } catch (Exception e) {
            System.err.println("Failed to send SMS to " + to);
            e.printStackTrace();
            throw new RuntimeException("Failed to send SMS: " + e.getMessage(), e);
        }
    }
}
