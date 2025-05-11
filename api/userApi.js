// ==================== CONFIGURATION ====================
const API_BASE_URL = 'http://localhost:8080/api';

// ==================== AUTHENTICATION FUNCTIONS ====================

/**
 * Handles login form submission
 */
export async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: email,
                password: password
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Invalid email or password');
        }

        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        return data.user;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

/**
 * Handles user registration
 */
export async function register(userData) {
    try {
        // Validate passwords match
        if (userData.password !== userData.confirmPassword) {
            throw new Error('Passwords do not match');
        }

        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: userData.username,
                email: userData.email,
                password: userData.password,
                allowanceCycleFrequency: userData.frequency
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Registration failed');
        }

        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        return data.user;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

/**
 * Checks if user is authenticated
 */
export async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/user`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            localStorage.removeItem('user');
            return null;
        }
        
        const userData = await response.json();
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
    } catch (error) {
        console.error('Auth check failed:', error);
        return null;
    }
}

/**
 * Logs out the current user
 */
export async function logout() {
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

/**
 * Adds a new transaction
 */
export async function addTransaction(transactionData) {
    try {
        const response = await fetch(`${API_BASE_URL}/transactions`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add transaction');
        }

        return await response.json();
    } catch (error) {
        console.error('Transaction error:', error);
        throw error;
    }
}

/**
 * Gets transactions for current or specified cycle
 */
export async function getTransactions(cycleId = null) {
    try {
        let url = `${API_BASE_URL}/transactions`;
        if (cycleId) {
            url += `?cycle=${cycleId}`;
        }

        const response = await fetch(url, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch transactions');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
}

/**
 * Gets current cycle summary
 */
export async function getCycleSummary() {
    try {
        const response = await fetch(`${API_BASE_URL}/cycles/current`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch cycle data');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching cycle summary:', error);
        return null;
    }
}

// ==================== SAVINGS GOALS FUNCTIONS ====================

/**
 * Creates a new savings goal
 */
export async function createSavingsGoal(goalData) {
    try {
        const response = await fetch(`${API_BASE_URL}/savings-goals`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(goalData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create goal');
        }

        return await response.json();
    } catch (error) {
        console.error('Savings goal error:', error);
        throw error;
    }
}

/**
 * Gets all savings goals for current user
 */
export async function getSavingsGoals() {
    try {
        const response = await fetch(`${API_BASE_URL}/savings-goals`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch savings goals');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching savings goals:', error);
        return [];
    }
}

/**
 * Adds funds to a savings goal
 */
export async function addToSavingsGoal(goalId, amount) {
    try {
        const response = await fetch(`${API_BASE_URL}/savings-goals/${goalId}/deposit`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add to goal');
        }

        return await response.json();
    } catch (error) {
        console.error('Add to goal error:', error);
        throw error;
    }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Gets the current authenticated user
 */
export function getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
}

/**
 * Predefined categories for transactions
 */
export const categories = {
    income: ["Salary", "Freelance", "Investment", "Gift", "Other"],
    expense: ["Food", "Transport", "Data", "School Fees", "Misc"]
};

/**
 * Helper function to get appropriate icon for goal category
 */
export function getGoalIcon(category) {
    const icons = {
        'EMERGENCY': '🛡️',
        'VEHICLE': '🚗',
        'HOUSING': '🏠',
        'EDUCATION': '🎓',
        'TRAVEL': '✈️'
    };
    return icons[category] || '💰';
}