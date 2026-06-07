package com.leather.attendancesystem.controller;

import com.leather.attendancesystem.model.Payroll;
import com.leather.attendancesystem.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
@CrossOrigin
public class PayrollController {

    private final PayrollService payrollService;

    @PostMapping("/generate-monthly")
    public ResponseEntity<String> generateMonthlyPayroll(@RequestParam int month, @RequestParam int year) {
        payrollService.generateMonthlyPayroll(month, year);
        return ResponseEntity.ok("Payroll generation triggered successfully");
    }

    @GetMapping("/monthly")
    public ResponseEntity<List<Payroll>> getMonthlyPayroll(@RequestParam int month, @RequestParam int year) {
        return ResponseEntity.ok(payrollService.getMonthlyPayroll(month, year));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Payroll>> getEmployeePayrollHistory(@PathVariable Integer employeeId) {
        return ResponseEntity.ok(payrollService.getEmployeePayrollHistory(employeeId));
    }

    @PutMapping("/mark-paid/{id}")
    public ResponseEntity<Payroll> markAsPaid(@PathVariable Integer id) {
        return ResponseEntity.ok(payrollService.markAsPaid(id));
    }
}
