package com.nextgenfinance.backend.service;

import com.nextgenfinance.backend.dto.RegisterRequest;
import com.nextgenfinance.backend.model.User;
import com.nextgenfinance.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy; // Import Lazy
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private final PasswordEncoder passwordEncoder;

    // Constructor injection with @Lazy for PasswordEncoder
    @Autowired
    public UserService(UserRepository userRepository, @Lazy PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(), user.getPassword(), new ArrayList<>());
    }

    public User registerNewUser(RegisterRequest registerRequest) throws Exception {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new Exception("Username is already taken!");
        }
        User newUser = new User();
        newUser.setUsername(registerRequest.getUsername());
        // Use the injected passwordEncoder here
        newUser.setPassword(this.passwordEncoder.encode(registerRequest.getPassword()));
        newUser.setAllowanceCycleFrequency(registerRequest.getAllowanceCycleFrequency());
        return userRepository.save(newUser);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
}