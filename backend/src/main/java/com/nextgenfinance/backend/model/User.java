package com.nextgenfinance.backend.model;

import jakarta.persistence.*;
import lombok.Data; // from Lombok
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users") // 'user' can be a reserved keyword in some DBs
@Data
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password; // Will be hashed

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Frequency allowanceCycleFrequency = Frequency.MONTHLY; // Default

    // Optional: for more precise cycle start, e.g., day of month for MONTHLY
    // private Integer cycleStartDay; // e.g., 1 for first day of month

    // Relationships (if needed, like roles for Spring Security)
    // @ManyToMany(fetch = FetchType.EAGER)
    // private Set<Role> roles;
}
