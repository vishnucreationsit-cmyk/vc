package com.leather.attendancesystem.service;

import com.leather.attendancesystem.model.AppUser;
import com.leather.attendancesystem.model.Employee;
import com.leather.attendancesystem.model.Notification;
import com.leather.attendancesystem.repository.AppUserRepository;
import com.leather.attendancesystem.repository.EmployeeRepository;
import com.leather.attendancesystem.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import com.leather.attendancesystem.dto.EmployeeRegistrationDTO;
import jakarta.transaction.Transactional;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final NotificationRepository notificationRepository;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Employee> getAllEmployees() {
        List<Employee> employees = employeeRepository.findAll();
        for (Employee e : employees) {
            appUserRepository.findByEmployeeId(e.getId()).ifPresent(appUser -> {
                e.setUsername(appUser.getUsername());
                e.setUserId(appUser.getId());
                e.setHasAccount(true);
            });
        }
        return employees;
    }

    public List<Employee> getActiveEmployees() {
        List<Employee> employees = employeeRepository.findByStatus(Employee.EmployeeStatus.ACTIVE);
        for (Employee e : employees) {
            appUserRepository.findByEmployeeId(e.getId()).ifPresent(appUser -> {
                e.setUsername(appUser.getUsername());
                e.setUserId(appUser.getId());
                e.setHasAccount(true);
            });
        }
        return employees;
    }

    public Employee getEmployeeById(Integer id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
    }

    @Transactional
    public Employee createEmployeeWithAccount(EmployeeRegistrationDTO dto) {
        Employee employee = dto.getEmployee();
        
        // Validations
        if (employee.getEmail() != null && !employee.getEmail().trim().isEmpty()) {
            if (employeeRepository.findByEmail(employee.getEmail()).isPresent()) {
                throw new RuntimeException("Email already exists");
            }
        }
        
        if (employeeRepository.findByEmployeeId(employee.getEmployeeId()).isPresent()) {
            throw new RuntimeException("Employee ID already exists");
        }
        
        if (dto.getUsername() != null && !dto.getUsername().trim().isEmpty()) {
            if (appUserRepository.findByUsername(dto.getUsername()).isPresent()) {
                throw new RuntimeException("Username already exists");
            }
        }

        Employee saved = employeeRepository.save(employee);
        
        if (dto.getUsername() != null && !dto.getUsername().trim().isEmpty() && dto.getPassword() != null) {
            AppUser user = new AppUser();
            user.setUsername(dto.getUsername());
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
            user.setRole(AppUser.Role.valueOf(dto.getRole()));
            user.setEmployee(saved);
            user.setEmail(saved.getEmail()); // Ensure AppUser email matches
            appUserRepository.save(user);
        }
        
        Notification notification = new Notification();
        notification.setTitle("New Employee Created");
        notification.setMessage(String.format("Name: %s\nID: %s\nDepartment: %s",
                saved.getName(), saved.getEmployeeId(), saved.getDepartment()));
        notification.setType("EMPLOYEE");
        notificationRepository.save(notification);
        
        return saved;
    }

    public Employee createEmployee(Employee employee) {
        if (employeeRepository.findByEmployeeId(employee.getEmployeeId()).isPresent()) {
            throw new RuntimeException("Employee ID already exists");
        }
        Employee saved = employeeRepository.save(employee);
        
        Notification notification = new Notification();
        notification.setTitle("New Employee Created");
        notification.setMessage(String.format("Name: %s\nID: %s\nDepartment: %s",
                saved.getName(), saved.getEmployeeId(), saved.getDepartment()));
        notification.setType("EMPLOYEE");
        notificationRepository.save(notification);
        
        return saved;
    }
    
    public Employee updateEmployee(Integer id, Employee employeeDetails) {
        Employee employee = getEmployeeById(id);
        
        employee.setName(employeeDetails.getName());
        employee.setPhone(employeeDetails.getPhone());
        employee.setEmail(employeeDetails.getEmail());
        employee.setDepartment(employeeDetails.getDepartment());
        employee.setDailyRate(employeeDetails.getDailyRate());
        employee.setShiftTiming(employeeDetails.getShiftTiming());
        employee.setShiftStartTime(employeeDetails.getShiftStartTime());
        employee.setShiftEndTime(employeeDetails.getShiftEndTime());
        employee.setGracePeriodMinutes(employeeDetails.getGracePeriodMinutes());
        employee.setAddress(employeeDetails.getAddress());
        employee.setStatus(employeeDetails.getStatus());
        
        return employeeRepository.save(employee);
    }

    public void deleteEmployee(Integer id) {
        Employee employee = getEmployeeById(id);
        // Soft delete
        employee.setStatus(Employee.EmployeeStatus.INACTIVE);
        employeeRepository.save(employee);
    }
}
