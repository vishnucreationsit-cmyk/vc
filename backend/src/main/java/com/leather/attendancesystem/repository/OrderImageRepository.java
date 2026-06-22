package com.leather.attendancesystem.repository;

import com.leather.attendancesystem.model.OrderImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderImageRepository extends JpaRepository<OrderImage, Long> {
    List<OrderImage> findByOrderId(Long orderId);
}
