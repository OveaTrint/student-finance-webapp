package com.nextgenfinance.backend.dto;

import lombok.Data;
import com.nextgenfinance.backend.model.Frequency; // Ensure correct import

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private Frequency allowanceCycleFrequency = Frequency.MONTHLY; // default, can be set during registration
}
