package com.leather.attendancesystem.controller;

import com.leather.attendancesystem.model.Enquiry;
import com.leather.attendancesystem.service.EnquiryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enquiries")
@RequiredArgsConstructor
@CrossOrigin
public class EnquiryController {

    private final EnquiryService enquiryService;

    @PostMapping
    public ResponseEntity<?> submitEnquiry(@RequestBody Enquiry enquiry) {
        if (enquiry.getName() == null || enquiry.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Name is required");
        }
        if (enquiry.getEmail() == null || !enquiry.getEmail().contains("@")) {
            return ResponseEntity.badRequest().body("Valid email is required");
        }
        if (enquiry.getPhone() == null || enquiry.getPhone().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Phone number is required");
        }
        if (enquiry.getMessage() == null || enquiry.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Message is required");
        }
        
        try {
            return ResponseEntity.ok(enquiryService.submitEnquiry(enquiry));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Throwable t) {
            return ResponseEntity.internalServerError().body(t.toString() + " : " + t.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Enquiry>> getAllEnquiries() {
        return ResponseEntity.ok(enquiryService.getAllEnquiries());
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<Enquiry> resolveEnquiry(@PathVariable Integer id) {
        return ResponseEntity.ok(enquiryService.resolveEnquiry(id));
    }
}
