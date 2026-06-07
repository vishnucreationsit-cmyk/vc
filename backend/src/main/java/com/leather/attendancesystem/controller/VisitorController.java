package com.leather.attendancesystem.controller;

import com.leather.attendancesystem.model.Visitor;
import com.leather.attendancesystem.service.VisitorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

@RestController
@RequestMapping("/api/visitors")
@RequiredArgsConstructor
@CrossOrigin
public class VisitorController {

    private final VisitorService visitorService;

    @PostMapping
    public ResponseEntity<?> registerVisitor(@RequestBody Visitor visitor, HttpServletRequest request) {
        try {
            // capture IP
            String ip = request.getHeader("X-Forwarded-For");
            if (ip == null || ip.isEmpty()) {
                ip = request.getRemoteAddr();
            }
            visitor.setIpAddress(ip);
            
            return ResponseEntity.ok(visitorService.registerVisitor(visitor));
        } catch (Throwable t) {
            return ResponseEntity.internalServerError().body(t.toString() + " : " + t.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Visitor>> getAllVisitors() {
        return ResponseEntity.ok(visitorService.getAllVisitors());
    }
}
