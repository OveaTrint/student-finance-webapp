package com.nextgenfinance.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {
    private String value; // e.g., "FOOD"
    private String displayName; // e.g., "Food"
}