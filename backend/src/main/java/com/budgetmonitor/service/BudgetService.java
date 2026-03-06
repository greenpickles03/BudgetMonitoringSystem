package com.budgetmonitor.service;

import com.budgetmonitor.dto.BudgetRequest;
import com.budgetmonitor.dto.BudgetResponse;
import com.budgetmonitor.entity.Budget;
import com.budgetmonitor.entity.Category;
import com.budgetmonitor.entity.User;
import com.budgetmonitor.exception.ResourceNotFoundException;
import com.budgetmonitor.repository.BudgetRepository;
import com.budgetmonitor.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;

    public List<BudgetResponse> getAllBudgets(User user) {
        return budgetRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BudgetResponse> getActiveBudgets(User user) {
        return budgetRepository.findActiveBudgetsByUserId(user.getId(), LocalDate.now())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BudgetResponse getBudgetById(Long id, User user) {
        Budget budget = budgetRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + id));
        return mapToResponse(budget);
    }

    public BudgetResponse createBudget(BudgetRequest request, User user) {
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findByIdAndUserId(request.getCategoryId(), user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
        }

        Budget budget = Budget.builder()
                .name(request.getName())
                .description(request.getDescription())
                .amount(request.getAmount())
                .spentAmount(BigDecimal.ZERO)
                .category(category)
                .user(user)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .period(request.getPeriod())
                .build();

        return mapToResponse(budgetRepository.save(budget));
    }

    public BudgetResponse updateBudget(Long id, BudgetRequest request, User user) {
        Budget budget = budgetRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + id));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findByIdAndUserId(request.getCategoryId(), user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
        }

        budget.setName(request.getName());
        budget.setDescription(request.getDescription());
        budget.setAmount(request.getAmount());
        budget.setCategory(category);
        budget.setStartDate(request.getStartDate());
        budget.setEndDate(request.getEndDate());
        budget.setPeriod(request.getPeriod());

        return mapToResponse(budgetRepository.save(budget));
    }

    public void deleteBudget(Long id, User user) {
        Budget budget = budgetRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + id));
        budgetRepository.delete(budget);
    }

    public BudgetResponse mapToResponse(Budget budget) {
        BigDecimal spent = budget.getSpentAmount() != null ? budget.getSpentAmount() : BigDecimal.ZERO;
        BigDecimal remaining = budget.getAmount().subtract(spent);
        double percentageUsed = budget.getAmount().compareTo(BigDecimal.ZERO) > 0
                ? spent.divide(budget.getAmount(), 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;

        return BudgetResponse.builder()
                .id(budget.getId())
                .name(budget.getName())
                .description(budget.getDescription())
                .amount(budget.getAmount())
                .spentAmount(spent)
                .remainingAmount(remaining)
                .percentageUsed(percentageUsed)
                .categoryId(budget.getCategory() != null ? budget.getCategory().getId() : null)
                .categoryName(budget.getCategory() != null ? budget.getCategory().getName() : null)
                .userId(budget.getUser().getId())
                .startDate(budget.getStartDate())
                .endDate(budget.getEndDate())
                .period(budget.getPeriod())
                .createdAt(budget.getCreatedAt())
                .updatedAt(budget.getUpdatedAt())
                .build();
    }
}
