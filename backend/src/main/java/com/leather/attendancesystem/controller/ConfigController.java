package com.leather.attendancesystem.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/config")
@CrossOrigin
public class ConfigController {

    @Value("${company.contact.phone}")
    private String phone;

    @Value("${company.contact.email}")
    private String email;

    @Value("${company.contact.whatsapp}")
    private String whatsapp;

    @GetMapping("/contact")
    public Map<String, String> getContactConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("phone", phone);
        config.put("email", email);
        config.put("whatsapp", whatsapp);
        return config;
    }
}
