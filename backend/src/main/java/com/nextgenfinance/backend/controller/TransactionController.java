package com.nextgenfinance.backend.controller;

import com.nextgenfinance.backend.dto.CategoryDto;
import com.nextgenfinance.backend.dto.TransactionDto;
import com.nextgenfinance.backend.model.Category;
import com.nextgenfinance.backend.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Comparator;


@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        return authentication.getName();
    }

    @PostMapping
    public ResponseEntity<TransactionDto> addTransaction(@RequestBody TransactionDto transactionDto) {
        String username = getCurrentUsername();
        TransactionDto savedTransaction = transactionService.addTransaction(transactionDto, username);
        return new ResponseEntity<>(savedTransaction, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TransactionDto>> getAllTransactions(
            @RequestParam(required = false) String cycle // "current" or YYYY-MM-DD for a specific date in a cycle
    ) {
        String username = getCurrentUsername();
        List<TransactionDto> transactions;
        if ("current".equalsIgnoreCase(cycle)) {
            // This implicitly uses the user's saved cycle frequency to determine current cycle
            // For simplicity, let's assume getCurrentBalance's logic for cycle transactions can be adapted
            // or a dedicated service method exists for current cycle transactions.
            // For now, let's assume balance DTO includes current cycle transactions or this method fetches them.
            // This example will simplify and get all transactions or specific.
            // To fully implement filter by cycle here, CycleService and TransactionService need more.
            // We'll delegate getting cycle specific transactions to a separate BalanceController endpoint
            // to simplify this one for now and make it for *all* transactions for the user.
            transactions = transactionService.getTransactionsForUser(username);
        } else if (cycle != null) {
            // If a date is provided, use it to determine the cycle. (More complex to implement here directly)
            // For now, let this also return all.
            // LocalDate dateInCycle = LocalDate.parse(cycle);
            // Get user's frequency, determine cycle from dateInCycle, then fetch.
            transactions = transactionService.getTransactionsForUser(username);
        }
        else {
            transactions = transactionService.getTransactionsForUser(username);
        }
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDto>> getCategories(@RequestParam(required = false) String type) {
        List<CategoryDto> categories = Arrays.stream(Category.values())
                .filter(cat -> {
                    if ("income".equalsIgnoreCase(type)) return cat.isIncome();
                    if ("expense".equalsIgnoreCase(type)) return cat.isExpense();
                    return true; // return all if no type specified
                })
                .map(cat -> new CategoryDto(cat.name(), cat.getDisplayName()))
                .sorted(Comparator.comparing(CategoryDto::getDisplayName))
                .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }
}
