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

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final NotificationRepository notificationRepository;
    private final AppUserRepository appUserRepository;

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
