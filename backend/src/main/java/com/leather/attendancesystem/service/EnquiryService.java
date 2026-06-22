package com.leather.attendancesystem.service;

import com.leather.attendancesystem.model.Enquiry;
import com.leather.attendancesystem.model.Notification;
import com.leather.attendancesystem.repository.EnquiryRepository;
import com.leather.attendancesystem.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnquiryService {

    private final EnquiryRepository enquiryRepository;
    private final NotificationRepository notificationRepository;

    public Enquiry submitEnquiry(Enquiry enquiry) {
        // Prevent duplicate spam by checking if there's an enquiry with this email in the last 5 minutes
        List<Enquiry> recentEnquiries = enquiryRepository.findByCreatedAtAfter(LocalDateTime.now().minusMinutes(5));
        for (Enquiry e : recentEnquiries) {
            if (e.getEmail().equalsIgnoreCase(enquiry.getEmail())) {
                throw new RuntimeException("You have already submitted an enquiry recently. Please wait before submitting again.");
            }
        }

        Enquiry saved = enquiryRepository.save(enquiry);

        // Create Notification
        Notification notification = new Notification();
        notification.setTitle("New Enquiry Received");
        notification.setMessage(String.format("Name: %s\nPhone: %s\nEmail: %s\nSubject: %s",
                saved.getName(), saved.getPhone(), saved.getEmail(), saved.getSubject() != null ? saved.getSubject() : "N/A"));
        notification.setType("ENQUIRY");
        notificationRepository.save(notification);

        return saved;
    }

    public List<Enquiry> getAllEnquiries() {
        return enquiryRepository.findAllByOrderByCreatedAtDesc();
    }

    public Enquiry resolveEnquiry(Integer id) {
        Enquiry enquiry = enquiryRepository.findById(id).orElseThrow(() -> new RuntimeException("Enquiry not found"));
        enquiry.setStatus(Enquiry.EnquiryStatus.RESOLVED);
        return enquiryRepository.save(enquiry);
    }
}
