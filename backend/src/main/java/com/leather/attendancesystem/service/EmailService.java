package com.leather.attendancesystem.service;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import jakarta.annotation.PostConstruct;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@Service
public class EmailService {

    private String resendApiKey;
    private String resendFromEmail;
    private RestTemplate restTemplate;

    @PostConstruct
    public void init() {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        resendApiKey = dotenv.get("RESEND_API_KEY", System.getenv("RESEND_API_KEY"));
        resendFromEmail = dotenv.get("RESEND_FROM_EMAIL", System.getenv("RESEND_FROM_EMAIL"));
        
        if (resendFromEmail == null || resendFromEmail.trim().isEmpty()) {
            resendFromEmail = "onboarding@resend.dev";
        }
        
        restTemplate = new RestTemplate();

        if (resendApiKey == null || resendApiKey.trim().isEmpty() || resendApiKey.equals("your_resend_api_key")) {
            System.err.println("=========================================================");
            System.err.println("WARNING: Resend API Key is not configured. OTP emails cannot be sent.");
            System.err.println("Please set RESEND_API_KEY in the .env file");
            System.err.println("=========================================================");
        }
    }

    public void sendEmail(String to, String subject, String text) {
        if (resendApiKey == null || resendApiKey.trim().isEmpty() || resendApiKey.equals("your_resend_api_key")) {
            System.err.println("Cannot send email to " + to + ". Resend API key is not configured.");
            throw new RuntimeException("Resend API key is not configured.");
        }

        try {
            String url = "https://api.resend.com/emails";

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + resendApiKey);
            headers.set("Content-Type", "application/json");

            Map<String, Object> body = new HashMap<>();
            body.put("from", resendFromEmail);
            body.put("to", List.of(to));
            body.put("subject", subject);
            
            // Use html format to support rich text OTPs
            if (text != null && (text.contains("<html") || text.contains("<body") || text.contains("<p>"))) {
                body.put("html", text);
            } else {
                body.put("text", text);
            }

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("Email successfully sent via Resend to " + to);
            } else {
                System.err.println("Failed to send email via Resend to " + to + ". Status: " + response.getStatusCode());
            }
        } catch (Exception e) {
            System.err.println("Failed to send email via Resend to " + to);
            e.printStackTrace();
            throw new RuntimeException("Failed to send email via Resend: " + e.getMessage(), e);
        }
    }
}
