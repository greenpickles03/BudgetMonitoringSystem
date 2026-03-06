package com.budgetmonitor.dto;

import com.budgetmonitor.entity.Category.CategoryType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private String icon;
    private String color;
    private CategoryType type;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
