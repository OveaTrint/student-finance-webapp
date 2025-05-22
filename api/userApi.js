// ==================== CONFIGURATION ====================
const API_BASE_URL = 'http://localhost:8080/api'; // Ensure backend runs on 8080. it connects it to the backend

// ==================== AUTHENTICATION FUNCTIONS ====================

async function loginUser(emailOrUsername, password) {
    console.log("DEBUG userApi.js: loginUser called with username:", emailOrUsername);
    try {
        console.log("DEBUG userApi.js: Preparing to fetch for login...");
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            credentials: 'include', // Crucial for cookies
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: emailOrUsername,
                password: password
            })
        });
        console.log("DEBUG userApi.js: loginUser - Fetch call completed. Response status:", response.status);

        if (!response.ok) {
            let errorMsg = `Login failed: ${response.status} ${response.statusText}`;
            try {
                const errorBody = await response.text();
                try {
                    const errorData = JSON.parse(errorBody);
                    errorMsg = errorData.message || errorData.error || errorBody;
                } catch (jsonParseError) { errorMsg = errorBody || errorMsg; }
            } catch (readError) { /* Keep original errorMsg */ }
            throw new Error(errorMsg);
        }

        const authResponse = await response.json();
        console.log("DEBUG userApi.js: loginUser - AuthResponse from server:", authResponse);
        const minimalUser = { username: authResponse.username }; // Store only username for now
        localStorage.setItem('user', JSON.stringify(minimalUser));
        return minimalUser;

    } catch (error) {
        console.error('DEBUG userApi.js: Error in loginUser:', error);
        // The original console.error('Login error:', error); might be redundant if this one catches it.
        throw error; // Re-throw for script.js to handle
    }
}

async function registerUser(userData) {
    console.log("DEBUG userApi.js: registerUser called with data:", userData);
    try {
        if (userData.password !== userData.confirmPassword) {
            throw new Error('Passwords do not match'); // Fail early
        }

        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: userData.username, // Ensure script.js provides userData.username
                password: userData.password,
                allowanceCycleFrequency: userData.frequency.toUpperCase()
            })
        });
        console.log("DEBUG userApi.js: registerUser - Response status:", response.status);

        if (!response.ok) {
            let errorMsg = `Registration failed: ${response.status} ${response.statusText}`;
            try {
                const errorBody = await response.text();
                try {
                    const errorData = JSON.parse(errorBody);
                    errorMsg = errorData.message || errorData.error || errorBody;
                } catch (jsonParseError) { errorMsg = errorBody || errorMsg; }

                if (errorMsg.toLowerCase().includes("username is already taken")) {
                   errorMsg = "Username is already taken!";
                }
            } catch (readError) { /* Keep original errorMsg */ }
            throw new Error(errorMsg);
        }

        const authResponse = await response.json();
        console.log("DEBUG userApi.js: registerUser - AuthResponse from server:", authResponse);
        return authResponse;

    } catch (error) {
        console.error('DEBUG userApi.js: Error in registerUser:', error);
        throw error;
    }
}

async function fetchCurrentUserFromServer() {
    console.log("DEBUG userApi.js: fetchCurrentUserFromServer called");
    try {
        const response = await fetch(`${API_BASE_URL}/auth/user`, {
            credentials: 'include'
        });
        console.log("DEBUG userApi.js: fetchCurrentUserFromServer - Response status:", response.status);

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('user'); // Clear local user if unauthorized
            }
            // Potentially throw an error or return a specific value indicating failure
            return null;
        }

        const data = await response.json(); // Expects AuthResponse { message, username }
        // Or an enhanced UserDto if backend /api/auth/user is changed
        localStorage.setItem('user', JSON.stringify(data.username ? { username: data.username } : data));
        return data.username ? { username: data.username } : data;

    } catch (error) {
        console.error('DEBUG userApi.js: Error in fetchCurrentUserFromServer:', error);
        localStorage.removeItem('user');
        return null;
    }
}

async function logoutUser() {
    console.log("DEBUG userApi.js: logoutUser called");
    try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        console.log("DEBUG userApi.js: logoutUser - API call status:", response.status);
    } catch (error) {
        console.error('DEBUG userApi.js: Error in logoutUser API call:', error);
        // Still proceed to finally block to clear local storage
    } finally {
        localStorage.removeItem('user');
        console.log("DEBUG userApi.js: 'user' removed from localStorage during logout.");
    }
}

// ==================== TRANSACTION FUNCTIONS ====================

async function addApiTransaction(transactionData) {
    console.log("DEBUG userApi.js: addApiTransaction called with raw data:", transactionData);
    try {
        // transactionData.category will be the enum name string like "SALARY", "FOOD"
        // from the value attribute of the <select> in transaction.html
        const payload = {
            type: transactionData.type.toUpperCase(),
            amount: transactionData.amount,
            description: transactionData.notes || '', // Use notes for description; empty string if no notes
            category: transactionData.category,      // This is the enum name string, e.g., "FOOD"
            date: transactionData.date,
            incomeFrequency: (transactionData.type.toUpperCase() === 'INCOME' && transactionData.incomeFrequency)
                                ? transactionData.incomeFrequency.toUpperCase() // Should be "ONCE", "WEEKLY", "MONTHLY"
                                : null
        };
        console.log("DEBUG userApi.js: Payload for POST /api/transactions:", payload);

        const response = await fetch(`${API_BASE_URL}/transactions`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        console.log("DEBUG userApi.js: addApiTransaction - Response status:", response.status);

        if (!response.ok) {
            let errorMsg = `Failed to add transaction: ${response.status} ${response.statusText}`;
            try {
                const errorBody = await response.text();
                try {
                    const errorData = JSON.parse(errorBody);
                    errorMsg = errorData.message || errorData.error || errorBody;
                } catch (jsonParseError) { errorMsg = errorBody || errorMsg; }
            } catch (readError) { /* Keep original errorMsg */ }
            throw new Error(errorMsg);
        }
        return await response.json();
    } catch (error) {
        console.error('DEBUG userApi.js: Error in addApiTransaction:', error);
        throw error;
    }
}

async function fetchAllTransactionsForUser() {
    console.log("DEBUG userApi.js: fetchAllTransactionsForUser called");
    try {
        const response = await fetch(`${API_BASE_URL}/transactions`, {
            credentials: 'include'
        });
        console.log("DEBUG userApi.js: fetchAllTransactionsForUser - Response status:", response.status);

        if (!response.ok) {
            // Similar error handling as above
            throw new Error(`Failed to fetch transactions: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('DEBUG userApi.js: Error in fetchAllTransactionsForUser:', error);
        return []; // Return empty array on error so UI doesn't break
    }
}

async function fetchTransactionCategoriesApi(type = null) {
    console.log("DEBUG userApi.js: fetchTransactionCategoriesApi called with type:", type);
    try {
        let url = `${API_BASE_URL}/transactions/categories`;
        if (type) {
            url += `?type=${type.toLowerCase()}`;
        }
        const response = await fetch(url, { credentials: 'include' });
        console.log("DEBUG userApi.js: fetchTransactionCategoriesApi - Response status:", response.status);

        if (!response.ok) {
            throw new Error(`Failed to fetch transaction categories: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('DEBUG userApi.js: Error in fetchTransactionCategoriesApi:', error);
        return [];
    }
}

// ==================== BALANCE/CYCLE FUNCTIONS ====================

async function fetchCycleSummaryApi() {
    console.log("DEBUG userApi.js: fetchCycleSummaryApi called");
    try {
        const response = await fetch(`${API_BASE_URL}/balance/current`, {
            method: 'GET', // Explicit
            credentials: 'include' // Crucial for sending JSESSIONID
        });
        console.log("DEBUG userApi.js: fetchCycleSummaryApi - Response status:", response.status);

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                console.error("DEBUG userApi.js: fetchCycleSummaryApi - Unauthorized/Forbidden (status " + response.status + "). Session might have expired.");
                throw new Error('Session expired or unauthorized. Please log in again.');
            }
            let errorMsg = `Failed to fetch summary: ${response.status} ${response.statusText}`;
            try {
                const errorBody = await response.text();
                 try {
                    const errorData = JSON.parse(errorBody);
                    errorMsg = errorData.message || errorData.error || errorBody;
                } catch (jsonParseError) { errorMsg = errorBody || errorMsg; }
            } catch (readError) { /* Keep original errorMsg */ }
            throw new Error(errorMsg);
        }
        return await response.json();
    } catch (error) {
        console.error('DEBUG userApi.js: Error in fetchCycleSummaryApi:', error);
        throw error;
    }
}

// ==================== UTILITY FUNCTION (if not defined in script.js or if script.js uses this one) ====================
// It's good practice to have this defined in only one place.
// If script.js loads userApi.js first, script.js can use userApi.getLocalStoredUser().
// If script.js has its own, make sure they are consistent or remove one.
/*
function getLocalStoredUser() {
    console.log("DEBUG userApi.js: getLocalStoredUser called");
    const userString = localStorage.getItem('user');
    if (userString) {
        try {
            return JSON.parse(userString);
        } catch (e) {
            console.error("DEBUG userApi.js: Error parsing user from localStorage", e);
            localStorage.removeItem('user');
            return null;
        }
    }
    return null;
}
*/
