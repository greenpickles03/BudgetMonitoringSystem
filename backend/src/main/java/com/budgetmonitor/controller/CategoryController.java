package com.budgetmonitor.controller;

import com.budgetmonitor.dto.CategoryRequest;
import com.budgetmonitor.dto.CategoryResponse;
import com.budgetmonitor.entity.Category.CategoryType;
import com.budgetmonitor.entity.User;
import com.budgetmonitor.service.CategoryService;
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
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "APIs for managing expense/income categories")
@SecurityRequirement(name = "Bearer Authentication")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Get all categories for current user")
    public ResponseEntity<List<CategoryResponse>> getAllCategories(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) CategoryType type) {
        if (type != null) {
            return ResponseEntity.ok(categoryService.getCategoriesByType(user, type));
        }
        return ResponseEntity.ok(categoryService.getAllCategories(user));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID")
    public ResponseEntity<CategoryResponse> getCategoryById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(categoryService.getCategoryById(id, user));
    }

    @PostMapping
    @Operation(summary = "Create a new category")
    public ResponseEntity<CategoryResponse> createCategory(
            @Valid @RequestBody CategoryRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.createCategory(request, user));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a category")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(categoryService.updateCategory(id, request, user));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a category")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        categoryService.deleteCategory(id, user);
        return ResponseEntity.noContent().build();
    }
}
