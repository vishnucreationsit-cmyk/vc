package com.leather.attendancesystem.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String text) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);

            // Use html format to support rich text OTPs
            if (text != null && (text.contains("<html") || text.contains("<body") || text.contains("<p>"))) {
                helper.setText(text, true); // true indicates HTML
            } else {
                helper.setText(text, false);
            }

            javaMailSender.send(message);
            System.out.println("Email successfully sent via JavaMailSender to " + to);

        } catch (Exception e) {
            System.err.println("Failed to send email via JavaMailSender to " + to);
            e.printStackTrace();
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }
}
