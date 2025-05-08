package com.nextgenfinance.backend.service;

import com.nextgenfinance.backend.dto.TransactionDto;
import com.nextgenfinance.backend.dto.BalanceDto;
import com.nextgenfinance.backend.model.Category;
import com.nextgenfinance.backend.model.Transaction;
import com.nextgenfinance.backend.model.User;
import com.nextgenfinance.backend.repository.TransactionRepository;
import com.nextgenfinance.backend.repository.UserRepository; // If you need to fetch User again
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository; // To fetch User objects

    @Autowired
    private CycleService cycleService;

    @Transactional
    public TransactionDto addTransaction(TransactionDto transactionDto, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setType(transactionDto.getType());
        transaction.setAmount(transactionDto.getAmount());
        transaction.setDescription(transactionDto.getDescription()); // 'description' from DTO for both income source and expense details
        transaction.setDate(transactionDto.getDate() != null ? transactionDto.getDate() : LocalDate.now());

        // Handle category specifically for income and expense
        if (transactionDto.getType() == Transaction.TransactionType.INCOME) {
            // For income, 'category' field in DTO maps to income source/category
            transaction.setCategory(transactionDto.getCategory());
            transaction.setIncomeFrequency(transactionDto.getIncomeFrequency());
        } else { // EXPENSE
            transaction.setCategory(transactionDto.getCategory());
            // incomeFrequency is not relevant for expenses unless you define it differently
            transaction.setIncomeFrequency(null);
        }


        Transaction savedTransaction = transactionRepository.save(transaction);
        return mapToDto(savedTransaction);
    }

    public List<TransactionDto> getTransactionsForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return transactionRepository.findByUserOrderByDateDesc(user).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<TransactionDto> getTransactionsForUserInCycle(String username, LocalDate cycleStartDate, LocalDate cycleEndDate) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return transactionRepository.findByUserAndDateBetweenOrderByDateDesc(user, cycleStartDate, cycleEndDate)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }


    public BalanceDto getCurrentBalance(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        CycleService.CyclePeriod currentCycle = cycleService.getCurrentCyclePeriod(user.getAllowanceCycleFrequency());
        List<Transaction> transactionsInCycle = transactionRepository.findByUserAndDateBetweenOrderByDateDesc(
                user, currentCycle.startDate, currentCycle.endDate);

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;

        for (Transaction t : transactionsInCycle) {
            if (t.getType() == Transaction.TransactionType.INCOME) {
                totalIncome = totalIncome.add(t.getAmount());
            } else {
                totalExpenses = totalExpenses.add(t.getAmount());
            }
        }

        // For recent transactions on dashboard, take top N from this cycle or overall
        List<TransactionDto> recentTransactions = transactionsInCycle.stream()
                .limit(5) // Show up to 5 recent transactions for the dashboard from current cycle
                .map(this::mapToDto)
                .collect(Collectors.toList());
        if (recentTransactions.isEmpty()) { // if no transactions in cycle, get overall recent
            recentTransactions = transactionRepository.findByUserOrderByDateDesc(user).stream()
                    .limit(5)
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        }


        return new BalanceDto(
                totalIncome,
                totalExpenses,
                totalIncome.subtract(totalExpenses),
                currentCycle.startDate,
                currentCycle.endDate,
                cycleService.getCyclePeriodName(user.getAllowanceCycleFrequency(), currentCycle.startDate),
                recentTransactions
        );
    }

    private TransactionDto mapToDto(Transaction transaction) {
        TransactionDto dto = new TransactionDto();
        dto.setId(transaction.getId());
        dto.setType(transaction.getType());
        dto.setAmount(transaction.getAmount());
        dto.setDescription(transaction.getDescription());
        dto.setCategory(transaction.getCategory());
        dto.setDate(transaction.getDate());
        dto.setIncomeFrequency(transaction.getIncomeFrequency());
        return dto;
    }
}