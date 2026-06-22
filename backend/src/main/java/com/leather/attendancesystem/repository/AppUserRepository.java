package com.leather.attendancesystem.repository;

import com.leather.attendancesystem.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Integer> {
    Optional<AppUser> findByUsername(String username);
    Optional<AppUser> findByEmail(String email);
    Optional<AppUser> findByEmployeeId(Integer employeeId);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM AppUser u LEFT JOIN u.employee e WHERE " +
           "u.username = :searchTerm OR " +
           "u.email = :searchTerm OR " +
           "e.email = :searchTerm OR " +
           "e.employeeId = :searchTerm OR " +
           "e.phone = :searchTerm")
    java.util.List<AppUser> findBySearchTerm(@org.springframework.data.repository.query.Param("searchTerm") String searchTerm);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM AppUser u LEFT JOIN u.employee e WHERE " +
           "LOWER(TRIM(u.email)) = LOWER(TRIM(:email)) OR " +
           "LOWER(TRIM(e.email)) = LOWER(TRIM(:email))")
    java.util.List<AppUser> findByEmailForPasswordReset(@org.springframework.data.repository.query.Param("email") String email);
}
