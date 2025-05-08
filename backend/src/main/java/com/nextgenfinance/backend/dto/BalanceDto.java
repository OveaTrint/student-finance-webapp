package com.nextgenfinance.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BalanceDto {
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal currentBalance;
    private LocalDate cycleStartDate;
    private LocalDate cycleEndDate;
    private String cyclePeriod; // e.g., "May 2025" or "Week 20, 2025"
    private List<TransactionDto> recentTransactions; // Optional: include a few recent ones
}
