package com.budgetmonitor.controller;

import com.budgetmonitor.dto.BudgetRequest;
import com.budgetmonitor.dto.BudgetResponse;
import com.budgetmonitor.entity.User;
import com.budgetmonitor.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@Tag(name = "Budgets", description = "APIs for managing budgets")
@SecurityRequirement(name = "Bearer Authentication")
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    @Operation(summary = "Get all budgets for current user")
    public ResponseEntity<List<BudgetResponse>> getAllBudgets(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Boolean active) {
        if (Boolean.TRUE.equals(active)) {
            return ResponseEntity.ok(budgetService.getActiveBudgets(user));
        }
        return ResponseEntity.ok(budgetService.getAllBudgets(user));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get budget by ID")
    public ResponseEntity<BudgetResponse> getBudgetById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(budgetService.getBudgetById(id, user));
    }

    @PostMapping
    @Operation(summary = "Create a new budget")
    public ResponseEntity<BudgetResponse> createBudget(
            @Valid @RequestBody BudgetRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(budgetService.createBudget(request, user));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a budget")
    public ResponseEntity<BudgetResponse> updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(budgetService.updateBudget(id, request, user));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a budget")
    public ResponseEntity<Void> deleteBudget(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        budgetService.deleteBudget(id, user);
        return ResponseEntity.noContent().build();
    }
}
