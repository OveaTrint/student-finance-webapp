package com.nextgenfinance.backend.service;

import com.nextgenfinance.backend.model.Frequency;
import org.springframework.stereotype.Service;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.time.YearMonth;

@Service
public class CycleService {

    public static class CyclePeriod {
        public LocalDate startDate;
        public LocalDate endDate;

        public CyclePeriod(LocalDate startDate, LocalDate endDate) {
            this.startDate = startDate;
            this.endDate = endDate;
        }
    }

    public CyclePeriod getCurrentCyclePeriod(Frequency cycleFrequency) {
        LocalDate today = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate;

        switch (cycleFrequency) {
            case WEEKLY:
                // Assuming week starts on Monday and ends on Sunday
                startDate = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                endDate = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
                break;
            case MONTHLY:
            default:
                YearMonth currentMonth = YearMonth.from(today);
                startDate = currentMonth.atDay(1);
                endDate = currentMonth.atEndOfMonth();
                break;
        }
        return new CyclePeriod(startDate, endDate);
    }

    public String getCyclePeriodName(Frequency cycleFrequency, LocalDate dateInCycle) {
        switch (cycleFrequency) {
            case WEEKLY:
                LocalDate startOfWeek = dateInCycle.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                return "Week of " + startOfWeek.toString(); // Or format as "Week X, YYYY"
            case MONTHLY:
            default:
                YearMonth month = YearMonth.from(dateInCycle);
                return month.getMonth().name() + " " + month.getYear(); // e.g., MAY 2025
        }
    }
}
