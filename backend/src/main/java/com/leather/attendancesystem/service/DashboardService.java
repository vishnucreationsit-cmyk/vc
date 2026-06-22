package com.leather.attendancesystem.service;

import com.leather.attendancesystem.model.Attendance;
import com.leather.attendancesystem.model.Employee;
import com.leather.attendancesystem.model.Order;
import com.leather.attendancesystem.model.Payroll;
import com.leather.attendancesystem.repository.AttendanceRepository;
import com.leather.attendancesystem.repository.EmployeeRepository;
import com.leather.attendancesystem.repository.OrderRepository;
import com.leather.attendancesystem.repository.PayrollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final OrderRepository orderRepository;
    private final PayrollRepository payrollRepository;

    public Map<String, Object> getTodayStats() {
        LocalDate today = LocalDate.now();
        List<Employee> activeEmployees = employeeRepository.findByStatus(Employee.EmployeeStatus.ACTIVE);
        List<Attendance> todayAttendance = attendanceRepository.findByAttendanceDate(today);

        long presentCount = todayAttendance.stream()
                .filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT)
                .count();
        long lateCount = todayAttendance.stream()
                .filter(a -> a.getStatus() == Attendance.AttendanceStatus.LATE)
                .count();
        long veryLateCount = todayAttendance.stream()
                .filter(a -> a.getStatus() == Attendance.AttendanceStatus.VERY_LATE)
                .count();

        long absentCount = activeEmployees.size() - todayAttendance.size();
        
        double onTimePercentage = 0;
        if (todayAttendance.size() > 0) {
            onTimePercentage = ((double) presentCount / todayAttendance.size()) * 100;
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEmployees", activeEmployees.size());
        stats.put("presentToday", presentCount + lateCount + veryLateCount);
        stats.put("onTimeToday", presentCount);
        stats.put("lateToday", lateCount);
        stats.put("veryLateToday", veryLateCount);
        stats.put("absentToday", absentCount);
        stats.put("onTimePercentage", String.format("%.2f", onTimePercentage));

        return stats;
    }

    public Map<String, Object> getMonthlySummary(int month, int year) {
        List<Payroll> monthlyPayrolls = payrollRepository.findByMonthAndYear(month, year);
        
        long totalAttendanceDays = monthlyPayrolls.stream().mapToLong(Payroll::getPresentDays).sum();
        long totalLateDays = monthlyPayrolls.stream().mapToLong(Payroll::getLateDays).sum();
        long totalAbsentDays = monthlyPayrolls.stream().mapToLong(Payroll::getAbsentDays).sum();
        
        BigDecimal totalSalaryCost = monthlyPayrolls.stream()
                .map(p -> p.getFinalSalary() != null ? p.getFinalSalary() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        BigDecimal totalOvertimeCost = monthlyPayrolls.stream()
                .map(p -> p.getOvertimePay() != null ? p.getOvertimePay() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        BigDecimal totalLateDeductions = monthlyPayrolls.stream()
                .map(p -> p.getLateDeduction() != null ? p.getLateDeduction() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalAttendanceDays", totalAttendanceDays);
        summary.put("totalLateDays", totalLateDays);
        summary.put("totalAbsentDays", totalAbsentDays);
        summary.put("totalSalaryCost", totalSalaryCost);
        summary.put("totalOvertimeCost", totalOvertimeCost);
        summary.put("totalLateDeductions", totalLateDeductions);
        
        return summary;
    }

    public Map<String, Object> getOrderStats() {
        List<Order> allOrders = orderRepository.findAll();
        
        long pending = allOrders.stream().filter(o -> "Order Received".equals(o.getStatus())).count();
        long inProgress = allOrders.stream().filter(o -> o.getStatus() != null && !"Delivered".equals(o.getStatus()) && !"Order Received".equals(o.getStatus())).count();
        long completed = allOrders.stream().filter(o -> "Delivered".equals(o.getStatus())).count();
        long submitted = completed; // Use completed for submitted
        
        LocalDate today = LocalDate.now();
        long overdue = allOrders.stream()
                .filter(o -> o.getExpectedDeliveryDate() != null && o.getExpectedDeliveryDate().isBefore(today) && 
                            !"Delivered".equals(o.getStatus()))
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", allOrders.size());
        stats.put("pending", pending);
        stats.put("inProgress", inProgress);
        stats.put("completed", completed);
        stats.put("submitted", submitted);
        stats.put("overdue", overdue);
        
        return stats;
    }
}
