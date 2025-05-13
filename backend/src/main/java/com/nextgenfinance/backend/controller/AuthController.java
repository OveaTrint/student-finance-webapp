package com.nextgenfinance.backend.controller;

import com.nextgenfinance.backend.dto.AuthResponse;
import com.nextgenfinance.backend.dto.LoginRequest;
import com.nextgenfinance.backend.dto.RegisterRequest;
import com.nextgenfinance.backend.model.User;
import com.nextgenfinance.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        try {
            User registeredUser = userService.registerNewUser(registerRequest);
            return ResponseEntity.ok(new AuthResponse("User registered successfully!", registeredUser.getUsername()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {

        System.out.println("DEBUG: AuthController - authenticateUser called. Username from LoginRequest: '" + loginRequest.getUsername() + "'");
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        // Create session
        HttpSession session = request.getSession(true);
        session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

        org.springframework.security.core.userdetails.User userDetails =
                (org.springframework.security.core.userdetails.User) authentication.getPrincipal();

        return ResponseEntity.ok(new AuthResponse("Login successful", userDetails.getUsername()));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(new AuthResponse("Logout successful", null));
    }

    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No authenticated user.");
        }
        String username = authentication.getName();
        // You might want to return more user details if needed
        User user = userService.findByUsername(username);
        // Create a UserDto if you don't want to expose the User entity directly
        return ResponseEntity.ok(new AuthResponse("User fetched", user.getUsername()));
    }

    @GetMapping("/csrf-token")
    public ResponseEntity<?> getCsrfToken() {
        // This endpoint doesn't need to do much.
        // The CsrfFilter running for this authenticated GET request
        // should cause CookieCsrfTokenRepository to ensure the cookie is set.
        // You could return the token value in the body if the client prefers that
        // but for CookieCsrfTokenRepository, the primary mechanism is the cookie itself.
        // Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        // if (csrfToken != null) {
        //    return ResponseEntity.ok().header(csrfToken.getHeaderName(), csrfToken.getToken()).body("CSRF token obtained");
        // }
        return ResponseEntity.ok().body("CSRF token cookie should be set if not already.");
    }
}