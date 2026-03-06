package com.budgetmonitor.dto;

import com.budgetmonitor.entity.Budget.BudgetPeriod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal amount;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private Double percentageUsed;
    private Long categoryId;
    private String categoryName;
    private Long userId;
    private LocalDate startDate;
    private LocalDate endDate;
    private BudgetPeriod period;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
