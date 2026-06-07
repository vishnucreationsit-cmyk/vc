package com.leather.attendancesystem.dto;

import com.leather.attendancesystem.model.Employee;
import lombok.Data;

@Data
public class EmployeeRegistrationDTO {
    private Employee employee;
    private String username;
    private String password;
    private String role;

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
