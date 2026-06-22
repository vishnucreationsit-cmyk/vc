package com.leather.attendancesystem.service;

import com.leather.attendancesystem.model.Employee;
import com.leather.attendancesystem.model.LeaveRequest;
import com.leather.attendancesystem.model.Notification;
import com.leather.attendancesystem.repository.EmployeeRepository;
import com.leather.attendancesystem.repository.LeaveRequestRepository;
import com.leather.attendancesystem.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationRepository notificationRepository;

    public LeaveRequest applyForLeave(Integer employeeId, LeaveRequest leaveRequest) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        leaveRequest.setEmployee(employee);
        leaveRequest.setStatus(LeaveRequest.LeaveStatus.PENDING);
        LeaveRequest savedRequest = leaveRequestRepository.save(leaveRequest);
        
        Notification notification = new Notification();
        notification.setTitle("New Leave Request");
        notification.setMessage(String.format("Employee: %s\nEmployee ID: %s\nDepartment: %s\nLeave Type: %s\nDates: %s to %s",
                employee.getName(), employee.getEmployeeId(), employee.getDepartment(), 
                leaveRequest.getLeaveType(), leaveRequest.getFromDate(), leaveRequest.getToDate()));
        notification.setType("LEAVE");
        notificationRepository.save(notification);
        
        return savedRequest;
    }

    public List<LeaveRequest> getPendingLeaves() {
        return leaveRequestRepository.findByStatus(LeaveRequest.LeaveStatus.PENDING);
    }

    public List<LeaveRequest> getMyLeaveRequests(Integer employeeId) {
        return leaveRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId);
    }

    public List<LeaveRequest> getAllLeaves() {
        return leaveRequestRepository.findAll();
    }

    public LeaveRequest approveLeave(Integer id, Integer approvedById) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        
        if (approvedById != null) {
            Employee manager = employeeRepository.findById(approvedById).orElse(null);
            leaveRequest.setApprovedBy(manager);
        }

        leaveRequest.setStatus(LeaveRequest.LeaveStatus.APPROVED);
        leaveRequest.setApprovedAt(LocalDateTime.now());
        
        return leaveRequestRepository.save(leaveRequest);
    }

    public LeaveRequest rejectLeave(Integer id, Integer rejectedById) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        
        if (rejectedById != null) {
            Employee manager = employeeRepository.findById(rejectedById).orElse(null);
            leaveRequest.setApprovedBy(manager);
        }

        leaveRequest.setStatus(LeaveRequest.LeaveStatus.REJECTED);
        leaveRequest.setApprovedAt(LocalDateTime.now());
        
        return leaveRequestRepository.save(leaveRequest);
    }
}
