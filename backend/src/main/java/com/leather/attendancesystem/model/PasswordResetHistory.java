package com.leather.attendancesystem.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(nullable = false, length = 50)
    private String username;

    @Column(name = "reset_method", length = 20)
    private String resetMethod; // EMAIL or MOBILE

    @CreationTimestamp
    @Column(name = "reset_time", updatable = false)
    private LocalDateTime resetTime;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;
}
