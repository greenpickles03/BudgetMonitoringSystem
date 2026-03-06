package com.budgetmonitor.service;

import com.budgetmonitor.dto.TransactionRequest;
import com.budgetmonitor.dto.TransactionResponse;
import com.budgetmonitor.entity.Budget;
import com.budgetmonitor.entity.Category;
import com.budgetmonitor.entity.Transaction;
import com.budgetmonitor.entity.Transaction.TransactionType;
import com.budgetmonitor.entity.User;
import com.budgetmonitor.exception.ResourceNotFoundException;
import com.budgetmonitor.repository.BudgetRepository;
import com.budgetmonitor.repository.CategoryRepository;
import com.budgetmonitor.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final BudgetRepository budgetRepository;

    public List<TransactionResponse> getAllTransactions(User user) {
        return transactionRepository.findByUserIdOrderByTransactionDateDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TransactionResponse> getTransactionsByType(User user, TransactionType type) {
        return transactionRepository.findByUserIdAndTypeOrderByTransactionDateDesc(user.getId(), type)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TransactionResponse> getTransactionsByDateRange(User user, LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                        user.getId(), startDate, endDate)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TransactionResponse getTransactionById(Long id, User user) {
        Transaction transaction = transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
        return mapToResponse(transaction);
    }

    public TransactionResponse createTransaction(TransactionRequest request, User user) {
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findByIdAndUserId(request.getCategoryId(), user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
        }

        Budget budget = null;
        if (request.getBudgetId() != null) {
            budget = budgetRepository.findByIdAndUserId(request.getBudgetId(), user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + request.getBudgetId()));
        }

        Transaction transaction = Transaction.builder()
                .description(request.getDescription())
                .amount(request.getAmount())
                .type(request.getType())
                .category(category)
                .budget(budget)
                .user(user)
                .transactionDate(request.getTransactionDate())
                .notes(request.getNotes())
                .build();

        Transaction saved = transactionRepository.save(transaction);

        // Update budget spent amount if linked
        if (budget != null && request.getType() == TransactionType.EXPENSE) {
            budget.setSpentAmount(budget.getSpentAmount().add(request.getAmount()));
            budgetRepository.save(budget);
        }

        return mapToResponse(saved);
    }

    public TransactionResponse updateTransaction(Long id, TransactionRequest request, User user) {
        Transaction transaction = transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        // Reverse previous budget spend
        if (transaction.getBudget() != null && transaction.getType() == TransactionType.EXPENSE) {
            Budget oldBudget = transaction.getBudget();
            oldBudget.setSpentAmount(oldBudget.getSpentAmount().subtract(transaction.getAmount()));
            budgetRepository.save(oldBudget);
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findByIdAndUserId(request.getCategoryId(), user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
        }

        Budget budget = null;
        if (request.getBudgetId() != null) {
            budget = budgetRepository.findByIdAndUserId(request.getBudgetId(), user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + request.getBudgetId()));
        }

        transaction.setDescription(request.getDescription());
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setCategory(category);
        transaction.setBudget(budget);
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setNotes(request.getNotes());

        Transaction updated = transactionRepository.save(transaction);

        // Update new budget spent amount
        if (budget != null && request.getType() == TransactionType.EXPENSE) {
            budget.setSpentAmount(budget.getSpentAmount().add(request.getAmount()));
            budgetRepository.save(budget);
        }

        return mapToResponse(updated);
    }

    public void deleteTransaction(Long id, User user) {
        Transaction transaction = transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        // Reverse budget spend if applicable
        if (transaction.getBudget() != null && transaction.getType() == TransactionType.EXPENSE) {
            Budget budget = transaction.getBudget();
            budget.setSpentAmount(budget.getSpentAmount().subtract(transaction.getAmount()));
            budgetRepository.save(budget);
        }

        transactionRepository.delete(transaction);
    }

    public TransactionResponse mapToResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .description(transaction.getDescription())
                .amount(transaction.getAmount())
                .type(transaction.getType())
                .categoryId(transaction.getCategory() != null ? transaction.getCategory().getId() : null)
                .categoryName(transaction.getCategory() != null ? transaction.getCategory().getName() : null)
                .budgetId(transaction.getBudget() != null ? transaction.getBudget().getId() : null)
                .budgetName(transaction.getBudget() != null ? transaction.getBudget().getName() : null)
                .userId(transaction.getUser().getId())
                .transactionDate(transaction.getTransactionDate())
                .notes(transaction.getNotes())
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())
                .build();
    }
}
