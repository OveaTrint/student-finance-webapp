// ==================== CONFIGURATION ====================
// This API_BASE_URL is correct if your Spring Boot backend is running on localhost:8080
// AND you have server.servlet.context-path=/api in application.properties.
const API_BASE_URL = 'http://localhost:8080/api';

// ==================== AUTHENTICATION FUNCTIONS ====================

/**
 * Handles login form submission
 */
export async function login(username, password) { // Changed 'email' to 'username' to match backend User model
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, { // Correct endpoint
            method: 'POST',
            credentials: 'include', // Crucial for sending/receiving JSESSIONID
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username, // Backend expects 'username'
                password: password
            })
        });

        const responseData = await response.json(); // Always try to parse JSON

        if (!response.ok) {
            // Use message from backend response if available
            throw new Error(responseData.message || responseData.error || 'Invalid username or password');
        }

        // Assuming backend login response is like: {"message":"Login successful", "username":"testuser01"}
        // Storing username from response in localStorage for frontend use.
        // Note: /auth/user endpoint is better for fetching full user details after login.
        if (responseData.username) {
            localStorage.setItem('currentUser', responseData.username); // Store username or simple user object
        }
        return responseData; // Return the whole response data for flexibility
    } catch (error) {
        console.error('Login error:', error.message);
        throw error; // Re-throw for the UI to handle
    }
}

/**
 * Handles user registration
 */
export async function register(userData) { // userData should include { username, password, confirmPassword, allowanceCycleFrequency }
    try {
        // Validate passwords match (client-side validation is good UX)
        if (userData.password !== userData.confirmPassword) {
            throw new Error('Passwords do not match');
        }

        const response = await fetch(`${API_BASE_URL}/auth/register`, { // Correct endpoint
            method: 'POST',
            credentials: 'include', // Not strictly needed for register, but harmless
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: userData.username, // Backend expects 'username'
                // 'email' is not part of the backend User or RegisterRequest DTO by default. Remove or add to backend.
                // email: userData.email, 
                password: userData.password,
                allowanceCycleFrequency: userData.allowanceCycleFrequency // e.g., "MONTHLY", "WEEKLY"
            })
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || responseData.error || 'Registration failed');
        }

        // Similar to login, you might get a success message.
        // Automatic login after registration is a common pattern, but your backend doesn't do this by default.
        // User would need to login separately after registering.
        return responseData;
    } catch (error) {
        console.error('Registration error:', error.message);
        throw error;
    }
}

/**
 * Checks if user is authenticated by fetching user details
 * Stores basic user info (username) in localStorage if authenticated.
 */
export async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/user`, { // Correct endpoint
            credentials: 'include' // Essential: sends JSESSIONID
        });
        
        if (!response.ok) {
            if (response.status === 401) { // Unauthorized
                console.log('User not authenticated.');
            } else {
                console.error('Auth check failed with status:', response.status);
            }
            localStorage.removeItem('currentUser');
            return null; // Not authenticated or error
        }
        
        const userData = await response.json(); // Expects {"message":"User fetched", "username":"actual_username"}
        if (userData.username) {
            localStorage.setItem('currentUser', userData.username);
            return { username: userData.username }; // Return a simple user object
        } else {
            // Should not happen if response.ok is true and backend sends username
            localStorage.removeItem('currentUser');
            return null;
        }
    } catch (error) {
        console.error('Auth check network error or JSON parsing issue:', error);
        localStorage.removeItem('currentUser');
        return null;
    }
}

/**
 * Logs out the current user
 */
export async function logout() {
    try {
        // The actual POST to backend to invalidate session
        const response = await fetch(`${API_BASE_URL}/auth/logout`, { // Correct endpoint
            method: 'POST',
            credentials: 'include' // Sends JSESSIONID so server knows which session to invalidate
        });

        if (!response.ok) {
            // Log error but proceed to clear client-side state anyway
            console.error('Logout request failed on server, status:', response.status);
        } else {
            console.log('Successfully logged out from server.');
        }
    } catch (error) {
        // Network error, etc. Log but proceed to clear client-side state.
        console.error('Logout network error:', error);
    } finally {
        // Always clear client-side user information
        localStorage.removeItem('currentUser');
    }
}

// ==================== TRANSACTION FUNCTIONS ====================

/**
 * Adds a new transaction
 * transactionData should match backend TransactionDto:
 * { type: "INCOME" | "EXPENSE", amount: number, description: string, category: string, date: "YYYY-MM-DD", incomeFrequency?: "ONCE" | "WEEKLY" | "MONTHLY" }
 */
export async function addTransaction(transactionData) {
    try {
        const response = await fetch(`${API_BASE_URL}/transactions`, { // Correct endpoint
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                // No X-XSRF-TOKEN header needed as CSRF is disabled
            },
            body: JSON.stringify(transactionData)
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || responseData.error || 'Failed to add transaction');
        }

        return responseData; // The created transaction DTO
    } catch (error) {
        console.error('Add transaction error:', error.message);
        throw error;
    }
}

/**
 * Gets all transactions for the current user.
 * Backend endpoint /api/transactions currently returns ALL transactions.
 * Frontend might do its own cycle filtering if needed from this full list,
 * or rely on /api/balance/current for current cycle's transactions.
 * The 'cycleId' parameter here is illustrative if you were to implement backend filtering by cycle.
 */
export async function getTransactions(cycleId = null) { // Backend currently doesn't support cycleId query param here
    try {
        let url = `${API_BASE_URL}/transactions`; // Correct endpoint
        // if (cycleId) { // If backend supported this:
        //     url += `?cycle=${cycleId}`;
        // }

        const response = await fetch(url, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch transactions');
        }

        return await response.json(); // Array of TransactionDto
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return []; // Return empty array on error
    }
}

/**
 * Gets current balance summary (includes current cycle's income, expenses, balance, and recent transactions)
 */
export async function getCurrentBalanceSummary() { // Renamed to be more descriptive
    try {
        // Backend endpoint is /balance/current relative to API_BASE_URL
        const response = await fetch(`${API_BASE_URL}/balance/current`, { // Correct endpoint
            credentials: 'include'
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || responseData.error || 'Failed to fetch balance summary');
        }

        return responseData; // BalanceDto from backend
    } catch (error) {
        console.error('Error fetching balance summary:', error.message);
        return null; // Return null on error
    }
}

/**
 * Gets available transaction categories
 * Optional type: "income" or "expense"
 */
export async function getTransactionCategories(type = null) {
    try {
        let url = `${API_BASE_URL}/transactions/categories`;
        if (type) {
            url += `?type=${type}`;
        }
        const response = await fetch(url, {
            credentials: 'include' // Not strictly needed for categories if public, but good practice if endpoint becomes secured
        });
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        return await response.json(); // Array of {value: string, displayName: string}
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}


// ==================== SAVINGS GOALS FUNCTIONS (NOT IN MVP BACKEND) ====================
// These functions will fail or need a mock implementation until the backend supports them.
// Commenting them out for now to align with current backend capabilities.

/*
export async function createSavingsGoal(goalData) {
    console.warn("Backend MVP does not support createSavingsGoal yet.");
    // try {
    //     const response = await fetch(`${API_BASE_URL}/savings-goals`, { // Example endpoint
    //         method: 'POST',
    //         credentials: 'include',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(goalData)
    //     });
    //     // ... error handling ...
    //     return await response.json();
    // } catch (error) {
    //     console.error('Savings goal error:', error);
    //     throw error;
    // }
    return Promise.reject(new Error("Savings goals not implemented in backend MVP."));
}

export async function getSavingsGoals() {
    console.warn("Backend MVP does not support getSavingsGoals yet.");
    // try {
    //     const response = await fetch(`${API_BASE_URL}/savings-goals`, { // Example endpoint
    //         credentials: 'include'
    //     });
    //    // ... error handling ...
    //     return await response.json();
    // } catch (error) {
    //     console.error('Error fetching savings goals:', error);
    //     return [];
    // }
    return Promise.resolve([]); // Return empty array to prevent UI errors
}

export async function addToSavingsGoal(goalId, amount) {
    console.warn("Backend MVP does not support addToSavingsGoal yet.");
    // try {
    //     const response = await fetch(`${API_BASE_URL}/savings-goals/${goalId}/deposit`, { // Example endpoint
    //         method: 'POST',
    //         credentials: 'include',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ amount })
    //     });
    //     // ... error handling ...
    //     return await response.json();
    // } catch (error) {
    //     console.error('Add to goal error:', error);
    //     throw error;
    // }
    return Promise.reject(new Error("Adding to savings goals not implemented in backend MVP."));
}
*/

// ==================== UTILITY FUNCTIONS ====================

/**
 * Gets the current authenticated username from localStorage
 */
export function getCurrentUserUsername() { // More specific name
    return localStorage.getItem('currentUser');
}

/**
 * Your predefined categories for the frontend (can be kept for quicker UI rendering
 * but ideally fetched from backend with getTransactionCategories for consistency)
 */
// export const categories = { // Consider fetching this from backend instead
//     income: ["Salary", "Freelance", "Investment", "Gift", "Other"],
//     expense: ["Food", "Transport", "Data", "School Fees", "Misc"]
// };

// The getGoalIcon function is a UI helper, so it can stay as is,
// assuming your frontend has those goal categories conceptually even if backend doesn't store them yet.
export function getGoalIcon(category) { // This is fine if frontend UI uses these conceptual categories
    const icons = {
        'EMERGENCY': '🛡️',
        'VEHICLE': '🚗',
        'HOUSING': '🏠',
        'EDUCATION': '🎓',
        'TRAVEL': '✈️'
    };
    return icons[category.toUpperCase()] || '💰'; // Made category lookup case-insensitive
}
