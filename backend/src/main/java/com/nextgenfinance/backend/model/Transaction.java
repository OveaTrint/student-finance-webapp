package com.nextgenfinance.backend.model;


import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type; // INCOME or EXPENSE

    @Column(nullable = false)
    private BigDecimal amount;

    // For Income: source; For Expense: can be more specific description
    @Column(nullable = false)
    private String description; // e.g., "Salary April", "Lunch at Cafe"

    @Enumerated(EnumType.STRING)
    private Category category; // Nullable if it's income and not a predefined "source"

    @Column(nullable = false)
    private LocalDate date;

    // This frequency is specific to the transaction itself, e.g. recurring income
    // For the general allowance cycle frequency, refer to User.allowanceCycleFrequency
    @Enumerated(EnumType.STRING)
    private Frequency incomeFrequency; // Only relevant for INCOMES that are recurring

    public enum TransactionType {
        INCOME,
        EXPENSE
    }
}
