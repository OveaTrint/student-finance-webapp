package com.nextgenfinance.backend.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String message; // e.g., "Login successful"
    private String username;
    // private String token; // If using JWT
    // private List<String> roles; // If using roles
}