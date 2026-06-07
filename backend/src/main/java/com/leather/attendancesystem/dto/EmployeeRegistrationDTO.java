package com.leather.attendancesystem.dto;

import com.leather.attendancesystem.model.Employee;
import lombok.Data;

@Data
public class EmployeeRegistrationDTO {
    private Employee employee;
    private String username;
    private String password;
    private String role;
}
