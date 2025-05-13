package com.nextgenfinance.backend.controller; // Or your appropriate controller package

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController // Makes this class a REST controller, eligible for request mapping
public class TestController {

    @GetMapping("api/test-csrf") // Maps GET requests for /api/test-csrf to this method
    public ResponseEntity<String> testCsrfEndpoint() { // Renamed method for clarity
        return ResponseEntity.ok("CSRF Test Endpoint Reached!");
    }
}