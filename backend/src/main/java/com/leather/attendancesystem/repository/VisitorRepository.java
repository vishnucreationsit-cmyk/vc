package com.leather.attendancesystem.repository;

import com.leather.attendancesystem.model.Visitor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VisitorRepository extends JpaRepository<Visitor, Integer> {
    List<Visitor> findAllByOrderByVisitTimeDesc();
    List<Visitor> findByVisitTimeBetween(LocalDateTime start, LocalDateTime end);
    long countByVisitTimeBetween(LocalDateTime start, LocalDateTime end);
}
