package com.leather.attendancesystem.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll", uniqueConstraints = {
        @UniqueConstraint(name = "unique_employee_month", columnNames = {"employee_id", "month", "year"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "total_days")
    private Integer totalDays;

    @Column(name = "present_days")
    private Integer presentDays;

    @Column(name = "absent_days")
    private Integer absentDays;

    @Column(name = "leave_days")
    private Integer leaveDays;

    @Column(name = "late_days")
    private Integer lateDays;

    @Column(name = "late_deduction_days")
    private Integer lateDeductionDays;

    @Column(name = "overtime_hours", precision = 6, scale = 2)
    private BigDecimal overtimeHours = BigDecimal.ZERO;

    @Column(name = "basic_salary", precision = 10, scale = 2)
    private BigDecimal basicSalary;

    @Column(name = "overtime_pay", precision = 10, scale = 2)
    private BigDecimal overtimePay;

    @Column(name = "late_deduction", precision = 10, scale = 2)
    private BigDecimal lateDeduction = BigDecimal.ZERO;

    @Column(name = "other_deductions", precision = 10, scale = 2)
    private BigDecimal otherDeductions = BigDecimal.ZERO;

    @Column(name = "total_deductions", precision = 10, scale = 2)
    private BigDecimal totalDeductions;

    @Column(name = "final_salary", precision = 10, scale = 2)
    private BigDecimal finalSalary;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum PaymentStatus {
        PENDING, PAID
    }
}
