package com.budgetmonitor.service;

import com.budgetmonitor.dto.BudgetResponse;
import com.budgetmonitor.dto.DashboardSummary;
import com.budgetmonitor.dto.TransactionResponse;
import com.budgetmonitor.entity.Transaction.TransactionType;
import com.budgetmonitor.entity.User;
import com.budgetmonitor.repository.BudgetRepository;
import com.budgetmonitor.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final TransactionService transactionService;
    private final BudgetService budgetService;

    public DashboardSummary getSummary(User user) {
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());

        BigDecimal totalIncome = transactionRepository.sumAmountByUserIdAndTypeAndDateRange(
                user.getId(), TransactionType.INCOME, startOfMonth, endOfMonth);
        BigDecimal totalExpense = transactionRepository.sumAmountByUserIdAndTypeAndDateRange(
                user.getId(), TransactionType.EXPENSE, startOfMonth, endOfMonth);
        BigDecimal netBalance = totalIncome.subtract(totalExpense);

        List<BudgetResponse> allBudgets = budgetService.getAllBudgets(user);
        List<BudgetResponse> activeBudgets = budgetService.getActiveBudgets(user);
        List<TransactionResponse> allTransactions = transactionService.getAllTransactions(user);

        List<BudgetResponse> recentBudgets = allBudgets.stream().limit(5).toList();
        List<TransactionResponse> recentTransactions = allTransactions.stream().limit(10).toList();

        Map<String, BigDecimal> expenseByCategory = getCategoryBreakdown(user, TransactionType.EXPENSE, startOfMonth, endOfMonth);
        Map<String, BigDecimal> incomeByCategory = getCategoryBreakdown(user, TransactionType.INCOME, startOfMonth, endOfMonth);

        return DashboardSummary.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netBalance(netBalance)
                .totalBudgets(allBudgets.size())
                .activeBudgets(activeBudgets.size())
                .totalTransactions(allTransactions.size())
                .recentBudgets(recentBudgets)
                .recentTransactions(recentTransactions)
                .expenseByCategory(expenseByCategory)
                .incomeByCategory(incomeByCategory)
                .build();
    }

    private Map<String, BigDecimal> getCategoryBreakdown(User user, TransactionType type, LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = transactionRepository.sumAmountByCategoryAndUserIdAndTypeAndDateRange(
                user.getId(), type, startDate, endDate);
        Map<String, BigDecimal> breakdown = new LinkedHashMap<>();
        for (Object[] row : results) {
            String categoryName = row[0] != null ? row[0].toString() : "Uncategorized";
            BigDecimal amount = (BigDecimal) row[1];
            breakdown.put(categoryName, amount);
        }
        return breakdown;
    }
}
