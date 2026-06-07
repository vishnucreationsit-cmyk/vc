package com.leather.attendancesystem.service;

import com.leather.attendancesystem.model.Attendance;
import com.leather.attendancesystem.model.Employee;
import com.leather.attendancesystem.model.Payroll;
import com.leather.attendancesystem.repository.AttendanceRepository;
import com.leather.attendancesystem.repository.EmployeeRepository;
import com.leather.attendancesystem.repository.PayrollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;

    @Transactional
    public void generateMonthlyPayroll(int month, int year) {
        List<Employee> activeEmployees = employeeRepository.findByStatus(Employee.EmployeeStatus.ACTIVE);

        for (Employee employee : activeEmployees) {
            calculateEmployeePayroll(employee, month, year);
        }
    }

    @Transactional
    public Payroll calculateEmployeePayroll(Employee employee, int month, int year) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        List<Attendance> monthlyAttendance = attendanceRepository.findByEmployeeIdAndAttendanceDateBetween(
                employee.getId(), startDate, endDate);

        int totalDays = startDate.lengthOfMonth();
        int presentDays = 0;
        int lateDays = 0;
        BigDecimal totalOvertimeHours = BigDecimal.ZERO;

        for (Attendance att : monthlyAttendance) {
            if (att.getStatus() == Attendance.AttendanceStatus.PRESENT) {
                presentDays++;
            } else if (att.getStatus() == Attendance.AttendanceStatus.LATE || 
                       att.getStatus() == Attendance.AttendanceStatus.VERY_LATE) {
                presentDays++; // Still present, just late
                lateDays++;
            }
            totalOvertimeHours = totalOvertimeHours.add(att.getOvertimeHours());
        }

        // Late deduction logic: every 3 lates = 1 day deduction
        int lateDeductionDays = lateDays / 3;
        BigDecimal dailyRate = employee.getDailyRate() != null ? employee.getDailyRate() : BigDecimal.ZERO;
        
        BigDecimal basicSalary = dailyRate.multiply(BigDecimal.valueOf(presentDays));
        BigDecimal lateDeductionAmount = dailyRate.multiply(BigDecimal.valueOf(lateDeductionDays));
        
        // Overtime calculation: (dailyRate/8) * 1.5 * overtimeHours
        BigDecimal hourlyRate = dailyRate.divide(BigDecimal.valueOf(8), 2, RoundingMode.HALF_UP);
        BigDecimal overtimeRate = hourlyRate.multiply(BigDecimal.valueOf(1.5));
        BigDecimal overtimePay = overtimeRate.multiply(totalOvertimeHours).setScale(2, RoundingMode.HALF_UP);

        BigDecimal finalSalary = basicSalary.add(overtimePay).subtract(lateDeductionAmount);

        Payroll payroll = payrollRepository.findByEmployeeIdAndMonthAndYear(employee.getId(), month, year)
                .orElse(new Payroll());
                
        payroll.setEmployee(employee);
        payroll.setMonth(month);
        payroll.setYear(year);
        payroll.setTotalDays(totalDays);
        payroll.setPresentDays(presentDays);
        payroll.setLateDays(lateDays);
        payroll.setLateDeductionDays(lateDeductionDays);
        payroll.setOvertimeHours(totalOvertimeHours);
        payroll.setBasicSalary(basicSalary);
        payroll.setOvertimePay(overtimePay);
        payroll.setLateDeduction(lateDeductionAmount);
        payroll.setTotalDeductions(lateDeductionAmount); // Adding other deductions later if needed
        payroll.setFinalSalary(finalSalary);

        return payrollRepository.save(payroll);
    }

    public List<Payroll> getMonthlyPayroll(int month, int year) {
        return payrollRepository.findByMonthAndYear(month, year);
    }

    public List<Payroll> getEmployeePayrollHistory(Integer employeeId) {
        return payrollRepository.findByEmployeeIdOrderByYearDescMonthDesc(employeeId);
    }
    
    @Transactional
    public Payroll markAsPaid(Integer id) {
        Payroll payroll = payrollRepository.findById(id).orElseThrow(() -> new RuntimeException("Payroll not found"));
        payroll.setPaymentStatus(Payroll.PaymentStatus.PAID);
        return payrollRepository.save(payroll);
    }
}
