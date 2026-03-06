package com.budgetmonitor.dto;

import com.budgetmonitor.entity.Category.CategoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    private String name;

    private String description;

    private String icon;

    private String color;

    @NotNull(message = "Category type is required")
    private CategoryType type;
}
