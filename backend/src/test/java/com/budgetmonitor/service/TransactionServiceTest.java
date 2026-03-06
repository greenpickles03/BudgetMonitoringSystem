package com.budgetmonitor.service;

import com.budgetmonitor.dto.TransactionRequest;
import com.budgetmonitor.dto.TransactionResponse;
import com.budgetmonitor.entity.Transaction;
import com.budgetmonitor.entity.Transaction.TransactionType;
import com.budgetmonitor.entity.User;
import com.budgetmonitor.exception.ResourceNotFoundException;
import com.budgetmonitor.repository.BudgetRepository;
import com.budgetmonitor.repository.CategoryRepository;
import com.budgetmonitor.repository.TransactionRepository;
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
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private BudgetRepository budgetRepository;

    @InjectMocks
    private TransactionService transactionService;

    private User user;
    private Transaction transaction;
    private TransactionRequest transactionRequest;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .role(User.Role.USER)
                .build();

        transaction = Transaction.builder()
                .id(1L)
                .description("Grocery shopping")
                .amount(new BigDecimal("75.50"))
                .type(TransactionType.EXPENSE)
                .user(user)
                .transactionDate(LocalDate.now())
                .notes("Weekly groceries")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        transactionRequest = new TransactionRequest();
        transactionRequest.setDescription("Grocery shopping");
        transactionRequest.setAmount(new BigDecimal("75.50"));
        transactionRequest.setType(TransactionType.EXPENSE);
        transactionRequest.setTransactionDate(LocalDate.now());
        transactionRequest.setNotes("Weekly groceries");
    }

    @Test
    void getAllTransactions_ReturnsTransactionList() {
        given(transactionRepository.findByUserIdOrderByTransactionDateDesc(1L)).willReturn(List.of(transaction));

        List<TransactionResponse> result = transactionService.getAllTransactions(user);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDescription()).isEqualTo("Grocery shopping");
        assertThat(result.get(0).getAmount()).isEqualTo(new BigDecimal("75.50"));
    }

    @Test
    void getTransactionById_ReturnsCorrectTransaction() {
        given(transactionRepository.findByIdAndUserId(1L, 1L)).willReturn(Optional.of(transaction));

        TransactionResponse result = transactionService.getTransactionById(1L, user);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getDescription()).isEqualTo("Grocery shopping");
    }

    @Test
    void getTransactionById_NotFound_ThrowsResourceNotFoundException() {
        given(transactionRepository.findByIdAndUserId(99L, 1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.getTransactionById(99L, user))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Transaction not found");
    }

    @Test
    void createTransaction_Success() {
        given(transactionRepository.save(any(Transaction.class))).willReturn(transaction);

        TransactionResponse result = transactionService.createTransaction(transactionRequest, user);

        assertThat(result).isNotNull();
        assertThat(result.getDescription()).isEqualTo("Grocery shopping");
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    void deleteTransaction_Success() {
        given(transactionRepository.findByIdAndUserId(1L, 1L)).willReturn(Optional.of(transaction));

        transactionService.deleteTransaction(1L, user);

        verify(transactionRepository).delete(transaction);
    }

    @Test
    void deleteTransaction_NotFound_ThrowsResourceNotFoundException() {
        given(transactionRepository.findByIdAndUserId(99L, 1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.deleteTransaction(99L, user))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
