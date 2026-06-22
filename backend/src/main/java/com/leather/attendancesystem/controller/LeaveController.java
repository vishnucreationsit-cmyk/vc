package com.leather.attendancesystem.controller;

import com.leather.attendancesystem.model.LeaveRequest;
import com.leather.attendancesystem.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leave")
@RequiredArgsConstructor
@CrossOrigin
public class LeaveController {

    private final LeaveService leaveService;

    @PostMapping("/apply")
    public ResponseEntity<LeaveRequest> applyForLeave(@RequestBody Map<String, Object> request) {
        Integer employeeId = (Integer) request.get("employeeId");
        LeaveRequest leaveRequest = new LeaveRequest();
        
        leaveRequest.setLeaveType(LeaveRequest.LeaveType.valueOf((String) request.get("leaveType")));
        leaveRequest.setFromDate(java.time.LocalDate.parse((String) request.get("fromDate")));
        leaveRequest.setToDate(java.time.LocalDate.parse((String) request.get("toDate")));
        leaveRequest.setReason((String) request.get("reason"));
        
        return ResponseEntity.ok(leaveService.applyForLeave(employeeId, leaveRequest));
    }

    @GetMapping("/my-requests")
    public ResponseEntity<List<LeaveRequest>> getMyLeaveRequests(@RequestParam Integer employeeId) {
        return ResponseEntity.ok(leaveService.getMyLeaveRequests(employeeId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<LeaveRequest>> getPendingLeaves() {
        return ResponseEntity.ok(leaveService.getPendingLeaves());
    }

    @GetMapping("/all")
    public ResponseEntity<List<LeaveRequest>> getAllLeaves() {
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }

    @PutMapping("/approve/{id}")
    public ResponseEntity<LeaveRequest> approveLeave(@PathVariable Integer id, @RequestParam(required = false) Integer managerId) {
        return ResponseEntity.ok(leaveService.approveLeave(id, managerId));
    }

    @PutMapping("/reject/{id}")
    public ResponseEntity<LeaveRequest> rejectLeave(@PathVariable Integer id, @RequestParam(required = false) Integer managerId) {
        return ResponseEntity.ok(leaveService.rejectLeave(id, managerId));
    }
}
