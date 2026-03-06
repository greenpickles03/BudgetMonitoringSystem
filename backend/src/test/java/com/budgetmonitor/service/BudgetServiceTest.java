package com.budgetmonitor.service;

import com.budgetmonitor.dto.BudgetRequest;
import com.budgetmonitor.dto.BudgetResponse;
import com.budgetmonitor.entity.Budget;
import com.budgetmonitor.entity.Budget.BudgetPeriod;
import com.budgetmonitor.entity.User;
import com.budgetmonitor.exception.ResourceNotFoundException;
import com.budgetmonitor.repository.BudgetRepository;
import com.budgetmonitor.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private BudgetService budgetService;

    private User user;
    private Budget budget;
    private BudgetRequest budgetRequest;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .role(User.Role.USER)
                .build();

        budget = Budget.builder()
                .id(1L)
                .name("Monthly Groceries")
                .description("Grocery budget for the month")
                .amount(new BigDecimal("500.00"))
                .spentAmount(new BigDecimal("100.00"))
                .user(user)
                .startDate(LocalDate.now().withDayOfMonth(1))
                .endDate(LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth()))
                .period(BudgetPeriod.MONTHLY)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        budgetRequest = new BudgetRequest();
        budgetRequest.setName("Monthly Groceries");
        budgetRequest.setDescription("Grocery budget");
        budgetRequest.setAmount(new BigDecimal("500.00"));
        budgetRequest.setStartDate(LocalDate.now().withDayOfMonth(1));
        budgetRequest.setEndDate(LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth()));
        budgetRequest.setPeriod(BudgetPeriod.MONTHLY);
    }

    @Test
    void getAllBudgets_ReturnsBudgetList() {
        given(budgetRepository.findByUserId(1L)).willReturn(List.of(budget));

        List<BudgetResponse> result = budgetService.getAllBudgets(user);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Monthly Groceries");
        assertThat(result.get(0).getAmount()).isEqualTo(new BigDecimal("500.00"));
    }

    @Test
    void getBudgetById_ReturnsCorrectBudget() {
        given(budgetRepository.findByIdAndUserId(1L, 1L)).willReturn(Optional.of(budget));

        BudgetResponse result = budgetService.getBudgetById(1L, user);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Monthly Groceries");
    }

    @Test
    void getBudgetById_NotFound_ThrowsResourceNotFoundException() {
        given(budgetRepository.findByIdAndUserId(99L, 1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> budgetService.getBudgetById(99L, user))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Budget not found");
    }

    @Test
    void createBudget_Success() {
        given(budgetRepository.save(any(Budget.class))).willReturn(budget);

        BudgetResponse result = budgetService.createBudget(budgetRequest, user);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Monthly Groceries");
        verify(budgetRepository).save(any(Budget.class));
    }

    @Test
    void deleteBudget_Success() {
        given(budgetRepository.findByIdAndUserId(1L, 1L)).willReturn(Optional.of(budget));

        budgetService.deleteBudget(1L, user);

        verify(budgetRepository).delete(budget);
    }

    @Test
    void deleteBudget_NotFound_ThrowsResourceNotFoundException() {
        given(budgetRepository.findByIdAndUserId(99L, 1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> budgetService.deleteBudget(99L, user))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void mapToResponse_CalculatesRemainingAmountAndPercentage() {
        BudgetResponse response = budgetService.mapToResponse(budget);

        assertThat(response.getRemainingAmount()).isEqualTo(new BigDecimal("400.00"));
        assertThat(response.getPercentageUsed()).isEqualTo(20.0);
    }
}
