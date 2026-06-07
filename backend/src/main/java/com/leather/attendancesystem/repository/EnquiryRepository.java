package com.leather.attendancesystem.repository;

import com.leather.attendancesystem.model.Enquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EnquiryRepository extends JpaRepository<Enquiry, Integer> {
    List<Enquiry> findAllByOrderByCreatedAtDesc();
    List<Enquiry> findByCreatedAtAfter(LocalDateTime date);
}
