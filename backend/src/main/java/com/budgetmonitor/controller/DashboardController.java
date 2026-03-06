package com.budgetmonitor.controller;

import com.budgetmonitor.dto.DashboardSummary;
import com.budgetmonitor.entity.User;
import com.budgetmonitor.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "APIs for dashboard summary and analytics")
@SecurityRequirement(name = "Bearer Authentication")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @Operation(summary = "Get dashboard summary for current month")
    public ResponseEntity<DashboardSummary> getSummary(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(dashboardService.getSummary(user));
    }
}
