// ==================== CONFIGURATION ====================
const API_BASE_URL = 'http://localhost:8080/api'; // Ensure backend runs on 8080

// ==================== AUTHENTICATION FUNCTIONS ====================

async function loginUser(emailOrUsername, password) { // Parameter renamed for clarity
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: emailOrUsername, // Backend expects 'username'
                password: password
            })
        });

        if (!response.ok) {
            // Try to parse error, default to status text if parsing fails
            let errorMsg = `Login failed: ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorData.error || errorMsg;
            } catch (e) { /* Ignore parsing error, use statusText */ }
            throw new Error(errorMsg);
        }

        const authResponse = await response.json(); // Expects AuthResponse { message, username }

        // After successful login, fetch full user details IF backend /api/auth/user is enhanced.
        // For now, we'll just use the username from AuthResponse and store minimal info.
        // If backend /api/auth/user is enhanced to return UserDto with more details:
        // const userDetails = await fetchCurrentUserFromServer();
        // localStorage.setItem('user', JSON.stringify(userDetails));
        // return userDetails;

        // Current limited approach:
        const minimalUser = { username: authResponse.username };
        localStorage.setItem('user', JSON.stringify(minimalUser));
        return minimalUser;

    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

async function registerUser(userData) {
    try {
        if (userData.password !== userData.confirmPassword) {
            throw new Error('Passwords do not match');
        }

        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: userData.fullName, // Frontend "Full Name" maps to backend "username"
                password: userData.password,
                allowanceCycleFrequency: userData.frequency.toUpperCase() // e.g., "MONTHLY"
            })
        });

        if (!response.ok) {
            let errorMsg = `Registration failed: ${response.statusText}`;
            try {
                // Backend register can return plain text error on bad request
                const errorText = await response.text();
                errorMsg = errorText || errorMsg;
                if (errorText.includes("Username is already taken")) {
                   errorMsg = "Username is already taken!";
                }
            } catch (e) { /* Ignore parsing error */ }
            throw new Error(errorMsg);
        }

        const authResponse = await response.json(); // Expects AuthResponse { message, username }
        // No user data (like full User object) is returned directly, just a success message and username.
        // User will need to login separately.
        return authResponse; // Contains { message, username }

    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

async function fetchCurrentUserFromServer() { // Renamed to be more specific
    try {
        const response = await fetch(`${API_BASE_URL}/auth/user`, {
            credentials: 'include'
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('user');
            }
            return null;
        }

        const data = await response.json();
        // CURRENT BACKEND returns AuthResponse { message, username }
        // IDEAL BACKEND would return UserDto { id, username, allowanceCycleFrequency, ... }
        // Storing whatever is returned. If it's just AuthResponse, that's what localStorage gets.
        // This means `getLocalStoredUser()` will primarily have just the username.
        localStorage.setItem('user', JSON.stringify(data.username ? { username: data.username } : data));
        return data.username ? { username: data.username } : data;

    } catch (error) {
        console.error('Fetch current user error:', error);
        localStorage.removeItem('user');
        return null;
    }
}

async function logoutUser() {
    try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('user');
    }
}

// ==================== TRANSACTION FUNCTIONS ====================

async function addApiTransaction(transactionData) {
    try {
        const payload = {
            type: transactionData.type.toUpperCase(), // "INCOME" or "EXPENSE"
            amount: transactionData.amount,
            // 'description' field in DTO maps to frontend 'notes'
            description: transactionData.notes || transactionData.category, // Default to category if notes empty
            category: transactionData.category.toUpperCase().replace(/ /G, "_"), // e.g., "SCHOOL_FEES" from "School Fees"
            date: transactionData.date, // Expects YYYY-MM-DD
            incomeFrequency: null // Default to null
        };

        if (payload.type === 'INCOME' && transactionData.incomeFrequency) {
            // Map frontend 'one-time' etc. to backend 'ONCE'
            let backendFrequency = transactionData.incomeFrequency.toUpperCase();
            if (backendFrequency === "ONE-TIME") backendFrequency = "ONCE";
            payload.incomeFrequency = backendFrequency;
        }


        const response = await fetch(`${API_BASE_URL}/transactions`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Failed to add transaction (status ${response.status})` }));
            throw new Error(errorData.message || 'Failed to add transaction');
        }

        return await response.json(); // Backend returns the created TransactionDto
    } catch (error) {
        console.error('Add transaction error:', error);
        throw error;
    }
}

async function fetchAllTransactionsForUser() { // Renamed for clarity
    try {
        const response = await fetch(`${API_BASE_URL}/transactions`, { // Gets all transactions for the user
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch transactions');
        }
        return await response.json(); // Returns List<TransactionDto>
    } catch (error) {
        console.error('Error fetching all transactions:', error);
        return [];
    }
}

async function fetchTransactionCategoriesApi(type = null) { // Renamed for clarity
    try {
        let url = `${API_BASE_URL}/transactions/categories`;
        if (type) {
            url += `?type=${type.toLowerCase()}`; // "income" or "expense"
        }
        const response = await fetch(url, { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Failed to fetch transaction categories');
        }
        return await response.json(); // Expects List<CategoryDto> { value, displayName }
    } catch (error) {
        console.error('Error fetching transaction categories:', error);
        return [];
    }
}

// ==================== BALANCE/CYCLE FUNCTIONS ====================

async function fetchCycleSummaryApi() { // Renamed for clarity
    try {
        const response = await fetch(`${API_BASE_URL}/balance/current`, {
            credentials: 'include'
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                await logoutUser(); // Attempt to clean up session
                window.location.href = 'login.html';
                throw new Error('Session expired or unauthorized. Please log in again.');
            }
            const errorData = await response.json().catch(() => ({ message: `Failed to fetch summary (status ${response.status})` }));
            throw new Error(errorData.message || 'Failed to fetch financial summary');
        }
        return await response.json(); // Expects BalanceDto
    } catch (error) {
        console.error('Error fetching cycle summary:', error);
        throw error;
    }
}

// ==================== UTILITY FUNCTION ====================
function getLocalStoredUser() {
    const userString = localStorage.getItem('user');
    if (userString) {
        try {
            return JSON.parse(userString);
            // This will currently return { username: "actual_username" }
            // Or, if /api/auth/user is enhanced, it will return the full UserDto
        } catch (e) {
            console.error("Error parsing user from localStorage", e);
            localStorage.removeItem('user'); // Clear corrupted data
            return null;
        }
    }
    return null;
}
