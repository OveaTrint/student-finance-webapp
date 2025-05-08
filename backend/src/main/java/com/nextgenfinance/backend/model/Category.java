package com.nextgenfinance.backend.model;

public enum Category {
    // Income categories (Sources)
    ALLOWANCE("Allowance"),
    SALARY("Salary"),
    GIFTS("Gifts"),
    OTHER_INCOME("Other Income"),

    // Expense categories
    FOOD("Food"),
    TRANSPORT("Transport"),
    DATA("Data"),
    SCHOOL_FEES("School Fees"),
    ENTERTAINMENT("Entertainment"), // from transaction.html
    RENT("Rent"),                 // from transaction.html
    UTILITIES("Utilities"),       // from transaction.html
    SHOPPING("Shopping"),         // from dashboard.html
    MISC("Misc");

    private final String displayName;

    Category(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    // Helper to check if category is an expense type
    public boolean isExpense() {
        return this != ALLOWANCE && this != SALARY && this != GIFTS && this != OTHER_INCOME;
    }
    // Helper to check if category is an income type
    public boolean isIncome() {
        return !isExpense();
    }
}
