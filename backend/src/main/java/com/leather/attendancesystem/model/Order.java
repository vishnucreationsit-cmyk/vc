package com.leather.attendancesystem.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "manufacturing_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", unique = true, nullable = false)
    private String orderNumber; // Auto-generated e.g. ORD-1001

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "client_contact_person")
    private String clientContactPerson;

    @Column(name = "mobile_number")
    private String mobileNumber;

    @Column(name = "email")
    private String email;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "product_category")
    private String productCategory; // Bag, Wallet, Belt, Leather Accessories, Custom Product

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_value", precision = 12, scale = 2)
    private BigDecimal totalValue;

    @Column(name = "order_date")
    private LocalDate orderDate;

    @Column(name = "production_start_date")
    private LocalDate productionStartDate;

    @Column(name = "expected_delivery_date")
    private LocalDate expectedDeliveryDate;

    @Column(name = "actual_delivery_date")
    private LocalDate actualDeliveryDate;

    @Column(name = "priority")
    private String priority; // Low, Medium, High, Urgent

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "status")
    private String status; // Order Received, Design Approval, Raw Material Procurement, Cutting, Stitching, Finishing, Quality Check, Packaging, Ready for Dispatch, Delivered

    @Column(name = "progress_percentage")
    private Integer progressPercentage = 0;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<OrderImage> images = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
