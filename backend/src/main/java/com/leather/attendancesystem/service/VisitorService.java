package com.leather.attendancesystem.service;

import com.leather.attendancesystem.model.Notification;
import com.leather.attendancesystem.model.Visitor;
import com.leather.attendancesystem.repository.NotificationRepository;
import com.leather.attendancesystem.repository.VisitorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VisitorService {

    private final VisitorRepository visitorRepository;
    private final NotificationRepository notificationRepository;

    public Visitor registerVisitor(Visitor visitor) {
        if (visitor.getName() == null || visitor.getMobileNumber() == null) {
            throw new RuntimeException("Name and Mobile Number are required");
        }

        Visitor saved = visitorRepository.save(visitor);

        // Create notification for admin
        Notification notification = new Notification();
        notification.setTitle("New Website Visitor");
        notification.setMessage(String.format("Name: %s\nMobile: %s\nVisited At: %s",
                saved.getName(), saved.getMobileNumber(), 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy hh:mm a"))));
        notification.setType("VISITOR"); // Use VISITOR type (we need to make sure frontend expects this)
        notificationRepository.save(notification);

        return saved;
    }

    public List<Visitor> getAllVisitors() {
        return visitorRepository.findAllByOrderByVisitTimeDesc();
    }
}
