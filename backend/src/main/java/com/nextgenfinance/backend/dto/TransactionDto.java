package com.nextgenfinance.backend.dto;

import com.nextgenfinance.backend.model.Category;
import com.nextgenfinance.backend.model.Frequency;
import com.nextgenfinance.backend.model.Transaction; // For TransactionType
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionDto {
    private Long id;
    private Transaction.TransactionType type;
    private BigDecimal amount;
    private String description; // Will map to 'source' for income in frontend
    private Category category;
    private LocalDate date;
    private Frequency incomeFrequency; // For "Add Income"
}
