package com.leather.attendancesystem.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "employee_id", unique = true, nullable = false, length = 20)
    private String employeeId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 15)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(length = 50)
    private String department; // Stitching/Cutting/Packaging/Designing/Quality Check

    @Column(name = "daily_rate", precision = 10, scale = 2)
    private BigDecimal dailyRate;

    @Enumerated(EnumType.STRING)
    @Column(name = "shift_timing")
    private ShiftTiming shiftTiming = ShiftTiming.MORNING;

    @Column(name = "shift_start_time")
    private LocalTime shiftStartTime = LocalTime.of(9, 0);

    @Column(name = "shift_end_time")
    private LocalTime shiftEndTime = LocalTime.of(18, 0);

    @Column(name = "grace_period_minutes")
    private Integer gracePeriodMinutes = 5;

    @Enumerated(EnumType.STRING)
    private EmployeeStatus status = EmployeeStatus.ACTIVE;

    @Column(columnDefinition = "TEXT")
    private String address;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Transient
    private String username;

    @Transient
    private Integer userId;

    @Transient
    private Boolean hasAccount = false;

    public enum ShiftTiming {
        MORNING, EVENING
    }

    public enum EmployeeStatus {
        ACTIVE, INACTIVE
    }
}
