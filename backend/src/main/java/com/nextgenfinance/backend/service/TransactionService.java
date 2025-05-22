package com.nextgenfinance.backend.service;

import com.nextgenfinance.backend.dto.TransactionDto;
import com.nextgenfinance.backend.dto.BalanceDto;
// import com.nextgenfinance.backend.model.Category; // Not directly needed here if using category from transaction
import com.nextgenfinance.backend.model.Transaction;
import com.nextgenfinance.backend.model.User;
import com.nextgenfinance.backend.repository.TransactionRepository;
import com.nextgenfinance.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap; // <<< ADD THIS IMPORT
import java.util.List;
import java.util.Map;    // <<< ADD THIS IMPORT
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

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
        transaction.setDescription(transactionDto.getDescription());
        transaction.setDate(transactionDto.getDate() != null ? transactionDto.getDate() : LocalDate.now());

        if (transactionDto.getType() == Transaction.TransactionType.INCOME) {
            transaction.setCategory(transactionDto.getCategory());
            transaction.setIncomeFrequency(transactionDto.getIncomeFrequency());
        } else { // EXPENSE
            transaction.setCategory(transactionDto.getCategory());
            transaction.setIncomeFrequency(null);
        }

        Transaction savedTransaction = transactionRepository.save(transaction);
        // return mapToDto(savedTransaction); // We will use the modified mapToDto later
        // For now, ensure your TransactionDto in mapToDto has categoryDisplayName if you added it earlier
        // Or ensure your frontend can handle category enum name and map it to display name
        TransactionDto mappedDto = mapToDto(savedTransaction);

        // If you decided to add categoryDisplayName to TransactionDto, ensure it's set in mapToDto:
        // if (savedTransaction.getCategory() != null) {
        //    mappedDto.setCategoryDisplayName(savedTransaction.getCategory().getDisplayName());
        // }
        return mappedDto;
    }

    public List<TransactionDto> getTransactionsForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return transactionRepository.findByUserOrderByDateDesc(user).stream()
                .map(this::mapToDto) // Ensure mapToDto is consistent with what frontend expects
                .collect(Collectors.toList());
    }

    public List<TransactionDto> getTransactionsForUserInCycle(String username, LocalDate cycleStartDate, LocalDate cycleEndDate) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return transactionRepository.findByUserAndDateBetweenOrderByDateDesc(user, cycleStartDate, cycleEndDate)
                .stream()
                .map(this::mapToDto) // Ensure mapToDto is consistent
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
        Map<String, BigDecimal> spendingByCategory = new HashMap<>(); // <<< INITIALIZE MAP

        for (Transaction t : transactionsInCycle) {
            if (t.getType() == Transaction.TransactionType.INCOME) {
                totalIncome = totalIncome.add(t.getAmount());
            } else if (t.getType() == Transaction.TransactionType.EXPENSE) { // <<< Ensure it's an EXPENSE
                totalExpenses = totalExpenses.add(t.getAmount());
                // Aggregate spending by category for expenses
                if (t.getCategory() != null) {
                    String categoryName = t.getCategory().getDisplayName(); // Use display name for chart labels
                    spendingByCategory.put(categoryName,
                        spendingByCategory.getOrDefault(categoryName, BigDecimal.ZERO).add(t.getAmount()));
                } else {
                    // Optional: Handle uncategorized expenses
                    String uncategorized = "Uncategorized";
                    spendingByCategory.put(uncategorized,
                        spendingByCategory.getOrDefault(uncategorized, BigDecimal.ZERO).add(t.getAmount()));
                }
            }
        }

        List<TransactionDto> recentTransactions = transactionsInCycle.stream()
                .limit(5)
                .map(this::mapToDto) // Ensure mapToDto is consistent
                .collect(Collectors.toList());
        if (recentTransactions.isEmpty() && !transactionsInCycle.isEmpty()) { // If limit was 0 but there were txns
             recentTransactions = transactionRepository.findByUserOrderByDateDesc(user).stream()
                    .limit(5)
                    .map(this::mapToDto) // Ensure mapToDto is consistent
                    .collect(Collectors.toList());
        } else if (recentTransactions.isEmpty() && transactionsInCycle.isEmpty()) {
            // If no transactions in cycle, also check overall for recent ones for display
            recentTransactions = transactionRepository.findByUserOrderByDateDesc(user).stream()
                    .limit(5)
                    .map(this::mapToDto) // Ensure mapToDto is consistent
                    .collect(Collectors.toList());
        }


        return new BalanceDto(
                totalIncome,
                totalExpenses,
                totalIncome.subtract(totalExpenses),
                currentCycle.startDate,
                currentCycle.endDate,
                cycleService.getCyclePeriodName(user.getAllowanceCycleFrequency(), currentCycle.startDate),
                recentTransactions,
                spendingByCategory // <<< PASS THE MAP TO THE DTO
        );
    }

    // Ensure this mapToDto provides what the frontend needs, especially regarding category display
    private TransactionDto mapToDto(Transaction transaction) {
        TransactionDto dto = new TransactionDto();
        dto.setId(transaction.getId());
        dto.setType(transaction.getType());
        dto.setAmount(transaction.getAmount());
        dto.setDescription(transaction.getDescription());
        dto.setCategory(transaction.getCategory()); // This is the Category Enum object
        dto.setDate(transaction.getDate());
        dto.setIncomeFrequency(transaction.getIncomeFrequency());

        // If your TransactionDto has a 'categoryDisplayName' field, set it here:
        // This was suggested earlier for the transaction list display.
        // if (transaction.getCategory() != null) {
        //     dto.setCategoryDisplayName(transaction.getCategory().getDisplayName());
        // } else if (transaction.getType() == Transaction.TransactionType.INCOME && transaction.getDescription() != null) {
        //     // For income, if no category, description might be the source
        //     dto.setCategoryDisplayName(transaction.getDescription());
        // }

        return dto;
    }
}
