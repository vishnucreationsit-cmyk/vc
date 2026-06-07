package com.leather.attendancesystem.repository;

import com.leather.attendancesystem.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    
    @org.springframework.data.jpa.repository.Query("SELECT MAX(o.orderNumber) FROM Order o")
    String findMaxOrderNumber();
}
