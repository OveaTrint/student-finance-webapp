// ==================== IMPORT API FUNCTIONS (if using modules, otherwise they are global) ====================
// Assuming userApi.js functions are available globally (e.g., if userApi.js is included before script.js)
// If you were to use ES6 modules (requires type="module" in <script> tag):
// import * as api from './api/userApi.js'; // Then call api.login(), api.addTransaction() etc.
// For simplicity now, we'll assume userApi.js functions (login, addTransaction, etc.) are globally accessible.

// ==================== UTILITY FUNCTIONS (Mostly unchanged) ====================

function getCurrentUserUsernameFromStorage() { // Renamed to avoid conflict with api.getCurrentUserUsername if it existed
    return localStorage.getItem('currentUser'); // Stores only username now
}

function updateUserDataInStorage(username) { // Stores only username
    if (username) {
        localStorage.setItem('currentUser', username);
    } else {
        localStorage.removeItem('currentUser');
    }
}

function showError(message, elementId = null) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    if (elementId) {
        const targetElement = document.getElementById(elementId);
        if (targetElement) {
            const existingError = targetElement.querySelector('.error-message');
            if (existingError) existingError.remove(); // Clear previous errors in that specific form
            targetElement.prepend(errorElement); // Prepend so it appears at the top of the form
        }
    } else {
        // Fallback if no elementId, perhaps a general notification area?
        // For now, let's assume form-specific errors are primary.
        alert(`Error: ${message}`); // Simple alert for general errors
    }
    
    if (elementId && errorElement.parentNode) { // Only set timeout if it was added to a form
      setTimeout(() => {
          if (errorElement.parentNode) {
            errorElement.remove();
          }
      }, 5000);
    }
}

// ==================== DOM ELEMENT INTERACTIONS (Mostly unchanged) ====================
// This can remain largely the same, it handles UI elements directly.
document.querySelectorAll('.type-option input[type="radio"]').forEach(radio => {
    // Toggle 'selected' class for styling the selected radio button's parent label
    const parentOption = radio.closest('.type-option');
    if(radio.checked) {
        parentOption.classList.add('selected');
        // Show/hide frequency field based on type (initial load for transaction.html)
        if (document.getElementById('frequencyField')) {
            document.getElementById('frequencyField').style.display = radio.value === 'income' ? 'block' : 'none';
        }
    }
    
    radio.addEventListener('change', () => {
        document.querySelectorAll('.type-option').forEach(option => {
            option.classList.remove('selected');
        });
        if(radio.checked) {
            parentOption.classList.add('selected');
             // Show/hide frequency field based on type (on change for transaction.html)
            if (document.getElementById('frequencyField')) {
                document.getElementById('frequencyField').style.display = radio.value === 'income' ? 'block' : 'none';
            }
        }
    });
});


document.querySelector('.switch input')?.addEventListener('change', function() {
    console.log('Lock Goal (Not Implemented in Backend MVP):', this.checked);
});


// ==================== AUTHENTICATION & FORM HANDLING (Major Changes) ====================

function getUrlParameter(name) {
    name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function initAuthForms() { // login.html
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (!loginTab || !signupTab || !loginForm || !signupForm) return;
    
    const formType = getUrlParameter('form');
    if (formType === 'signup') {
        signupTab.classList.add('active');
        signupForm.style.display = 'block';
        loginTab.classList.remove('active');
        loginForm.style.display = 'none';
    } else {
        loginTab.classList.add('active');
        loginForm.style.display = 'block';
        signupTab.classList.remove('active');
        signupForm.style.display = 'none';
    }
    
    loginTab.addEventListener('click', () => { /* ... (UI toggle logic, unchanged) ... */ });
    signupTab.addEventListener('click', () => { /* ... (UI toggle logic, unchanged) ... */ });
    
    // Login Form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Logging in...';
        submitButton.disabled = true;

        const username = loginForm.querySelector('input[type="email"]').value; // Assuming email field is used for username
        const password = loginForm.querySelector('input[type="password"]').value;
        
        try {
            // Uses login function from userApi.js (ensure userApi.js is loaded before this script)
            const loginResponse = await login(username, password); // Uses username as expected by backend
            updateUserDataInStorage(loginResponse.username); // Store username from response
            window.location.href = 'dashboard.html';
        } catch (error) {
            showError(error.message || 'Login failed. Please check your credentials.', 'loginForm');
        } finally {
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });
    
    // Signup Form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = signupForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Signing up...';
        submitButton.disabled = true;

        const fullName = signupForm.querySelector('input[type="text"]').value; // Full Name might map to username or a separate field
        // Backend expects 'username', not 'email' as the primary identifier during registration.
        // For simplicity, let's assume 'fullName' is used as 'username' for registration.
        // If 'email' is distinct, your backend DTO and service need to handle it.
        const emailValue = signupForm.querySelector('input[type="email"]').value; // Collect email if used
        const password = signupForm.querySelector('#signupPassword').value; // Ensure unique IDs for password fields
        const confirmPassword = signupForm.querySelector('#signupConfirmPassword').value;
        const frequency = signupForm.querySelector('select[name="allowanceCycleFrequency"]').value; // Ensure correct name for select

        const userData = {
            username: fullName, // Assuming fullName maps to username for backend
            // email: emailValue, // Send if backend expects 'email' explicitly in RegisterRequest
            password: password,
            confirmPassword: confirmPassword, // Client-side check in register() of userApi.js will happen
            allowanceCycleFrequency: frequency.toUpperCase() // Backend expects uppercase: MONTHLY/WEEKLY
        };
        
        try {
            // Uses register function from userApi.js
            await register(userData);
            // After successful registration, redirect to login or show a success message.
            // For now, let's redirect to login with a success query param.
            alert('Registration successful! Please login.'); // Simple alert
            window.location.href = 'login.html?form=login®istered=true';
        } catch (error) {
            showError(error.message || 'Registration failed. Please try again.', 'signupForm');
        } finally {
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });
}

// ==================== DASHBOARD FUNCTIONALITY (Major Changes) ====================

async function initDashboard() { // dashboard.html
    document.getElementById('addTransactionBtn')?.addEventListener('click', () => {
        window.location.href = 'transaction.html';
    });
        
    document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await logout(); // Call API logout
        } catch (error) {
            // Error already logged in API function, just proceed
        }
        updateUserDataInStorage(null); // Clear local storage
        window.location.href = 'index.html'; // Redirect to landing/login
    });
    
    await updateDashboardData(); // Make it async
}

async function updateDashboardData() { // dashboard.html - fetches data from backend
    const username = getCurrentUserUsernameFromStorage();
    if (!username) {
        // Should be caught by the checkAuth in DOMContentLoaded, but as a safeguard
        window.location.href = 'login.html';
        return;
    }
    
    const userGreetingEl = document.querySelector('.user-greeting h2');
    if(userGreetingEl) userGreetingEl.textContent = `Welcome back, ${username}!`; // Use stored username
    
    try {
        const balanceSummary = await getCurrentBalanceSummary(); // API call from userApi.js
        if (balanceSummary) {
            const overviewMsgEl = document.querySelector('.overview-message');
            if(overviewMsgEl) overviewMsgEl.textContent = `Here's your financial overview for ${balanceSummary.cyclePeriod || 'the current period'}`;

            const metrics = document.querySelectorAll('.metric-card .metric-value');
            if (metrics.length === 3) {
                metrics[0].textContent = `₦${parseFloat(balanceSummary.totalIncome || 0).toFixed(2)}`;
                metrics[1].textContent = `₦${parseFloat(balanceSummary.totalExpenses || 0).toFixed(2)}`;
                metrics[2].textContent = `₦${parseFloat(balanceSummary.currentBalance || 0).toFixed(2)}`;
            }

            // Update recent transactions list from balanceSummary.recentTransactions
            updateTransactionsList(balanceSummary.recentTransactions || []);
        } else {
             showError('Could not load dashboard data.');
        }
    } catch (error) {
        showError(error.message || 'Failed to load dashboard data.');
        // Potentially redirect to login if auth error (e.g., session expired)
        if (error.message.toLowerCase().includes('unauthorized') || error.message.toLowerCase().includes('failed to fetch')) {
             // The checkAuth() should handle this more gracefully.
        }
    }
    // Savings goals are not in MVP backend
    // updateSavingsGoals(); 
}

function updateTransactionsList(transactions) { // dashboard.html - uses data passed from updateDashboardData
    const container = document.querySelector('.transactions-list'); // Assumes this exists
    if (!container) return;

    container.innerHTML = `<h3>Recent Transactions</h3>`; // Clear previous list, keep header

    if (transactions && transactions.length > 0) {
        transactions.forEach(t => {
            const item = document.createElement('div');
            item.className = 'transaction-item';
            item.innerHTML = `
                <div>
                    <div class="transaction-category">${t.category || 'Uncategorized'}</div>
                    <div class="transaction-date">${new Date(t.date).toLocaleDateString()}</div>
                </div>
                <div class="transaction-amount ${t.type.toLowerCase() === 'income' ? 'positive' : 'negative'}">
                    ${t.type.toLowerCase() === 'income' ? '+' : '-'}₦${parseFloat(t.amount || 0).toFixed(2)}
                </div>
            `;
            container.appendChild(item);
        });
    } else {
        const noTransactionsP = document.createElement('p');
        noTransactionsP.textContent = 'No recent transactions in this cycle.';
        container.appendChild(noTransactionsP);
    }
}

// ==================== TRANSACTION FORM FUNCTIONALITY (Major Changes) ====================

async function initTransactionForm() { // transaction.html
    const form = document.querySelector('.transaction-form');
    if (!form) return;

    // Populate categories dropdown
    const categorySelect = form.querySelector('select[name="category"]'); // Add name="category" to select in HTML
    const transactionTypeRadios = form.querySelectorAll('input[name="type"]');
    let currentType = form.querySelector('input[name="type"]:checked').value;

    async function populateCategories(type) {
        try {
            const categories = await getTransactionCategories(type); // API call
            categorySelect.innerHTML = '<option value="">Select a category</option>'; // Clear existing
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.value; // e.g., "FOOD"
                option.textContent = cat.displayName; // e.g., "Food"
                categorySelect.appendChild(option);
            });
        } catch (error) {
            showError(error.message || 'Failed to load categories.', 'transactionForm');
        }
    }

    // Initial population
    populateCategories(currentType);
     // Show/hide frequency field based on initial type
    document.getElementById('frequencyField').style.display = currentType === 'income' ? 'block' : 'none';


    // Update categories when transaction type changes
    transactionTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            currentType = this.value;
            populateCategories(currentType);
            // Show/hide frequency field
            document.getElementById('frequencyField').style.display = currentType === 'income' ? 'block' : 'none';
        });
    });
    
    // Set default date
    const dateInput = form.querySelector('input[type="date"]');
    if (dateInput) dateInput.valueAsDate = new Date(); // Today
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;

        const transactionData = {
            type: currentType.toUpperCase(), // INCOME or EXPENSE
            amount: parseFloat(form.querySelector('input[type="number"]').value),
            category: categorySelect.value, // This will be the enum string, e.g., "FOOD"
            date: dateInput.value,
            description: form.querySelector('textarea').value // Map 'notes' to 'description' for backend
        };

        if (transactionData.type === 'INCOME') {
            const frequencySelect = form.querySelector('select[name="frequency"]');
            transactionData.incomeFrequency = frequencySelect.value.toUpperCase().replace('-', ''); // e.g. "ONETIME", "WEEKLY", "MONTHLY" - map to backend enum
             if (transactionData.incomeFrequency === "ONETIME") { // Adjust for backend ENUM
                transactionData.incomeFrequency = "ONCE";
            }
        }
        
        try {
            await addTransaction(transactionData); // API call from userApi.js
            alert('Transaction added successfully!');
            window.location.href = 'dashboard.html';
        } catch (error) {
            showError(error.message || 'Failed to add transaction. Please check your input.', 'transactionForm');
        } finally {
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });

    const cancelButton = form.querySelector('.cancel-button');
    if(cancelButton) {
        cancelButton.addEventListener('click', () => window.location.href = 'dashboard.html');
    }
}

// ==================== SAVINGS GOALS FUNCTIONALITY (To be fully implemented later) ====================
// The userApi.js functions are already commented out or return gracefully.
// UI initialization for forms might still happen but submission will use the placeholder API calls.

function initSavingsGoalForm() { // new_savings.html
    const form = document.querySelector('.goal-form');
    if (!form) return;
    
    // Default date logic can stay
    const dateInput = form.querySelector('input[type="date"]');
    if (dateInput) {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 3);
      dateInput.valueAsDate = futureDate;
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const goalData = { /* ... get form data ... */ };
        try {
            // This will call the placeholder createSavingsGoal from userApi.js
            await createSavingsGoal(goalData); 
            alert('Savings Goal functionality not fully implemented in backend MVP.');
            // window.location.href = 'saving_goal.html'; // Don't redirect yet
        } catch (error) {
            showError(error.message || 'Failed to create savings goal (Not implemented in backend).', 'goalForm');
        }
    });
}

function updateSavingsGoals() { // saving_goal.html
    // This will likely show an empty list or warning due to placeholder getSavingsGoals()
    console.warn("Savings Goals UI update called, but backend functionality is placeholder.");
    const container = document.querySelector('.goals-grid');
    if (container) {
        container.innerHTML = "<p>Savings Goals feature is under development.</p>";
    }
}

// The getGoalIcon can stay as a UI utility

// ==================== CYCLE MANAGEMENT (Client-side logic, might be simplified or removed if backend manages all cycle state) ====================
// Your backend now determines the current cycle via CycleService for balance.
// Client-side `checkCycleReset` based on localStorage is no longer the source of truth for balance.
// We can remove `checkCycleReset` and its callers for now, as dashboard will fetch current cycle from backend.
// function checkCycleReset() { ... }
// function getWeekNumber(date) { ... }

// ==================== INITIALIZATION (Major Changes) ====================

document.addEventListener('DOMContentLoaded', async function() { // Make DOMContentLoaded async
    const path = window.location.pathname;
    const isAuthPage = path.includes('login.html') || path === '/' || path.endsWith('/index.html');
    
    let currentUser = null;
    try {
        const authData = await checkAuth(); // API call to check auth status
        if (authData && authData.username) {
            currentUser = authData; // Contains { username: '...' }
            updateUserDataInStorage(currentUser.username); // Store username
        } else {
            updateUserDataInStorage(null); // Clear storage if not authenticated
        }
    } catch (e) {
        // checkAuth in userApi.js already logs errors, clear local storage
        updateUserDataInStorage(null);
    }
    
    if (!currentUser && !isAuthPage) {
        // Not logged in and not on a public page, redirect to login
        window.location.href = 'login.html';
        return; // Stop further execution for this page
    } else if (currentUser && isAuthPage && !path.includes('index.html')) {
        // Logged in and trying to access login/signup page (but not index.html which is public landing)
        // Redirect to dashboard
        // Allow index.html to be viewed by logged-in users without redirect
        window.location.href = 'dashboard.html';
        return;
    }

    // User menu display with avatar initial
    const userAvatarDiv = document.querySelector('.user-menu .user-avatar');
    if (userAvatarDiv && currentUser && currentUser.username) {
        userAvatarDiv.textContent = currentUser.username.charAt(0).toUpperCase();
    } else if (userAvatarDiv) {
        userAvatarDiv.textContent = ''; // Or a default guest icon
    }

    const userMenu = document.querySelector('.user-menu');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    if (userMenu && dropdownMenu) {
        if(currentUser){ // Show user menu only if logged in
            userMenu.style.display = 'flex'; // Or 'block' depending on your CSS
            userMenu.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent click from closing menu immediately
                dropdownMenu.classList.toggle('show');
            });

            // Close dropdown if clicked outside
            window.addEventListener('click', (event) => {
                if (!userMenu.contains(event.target)) {
                    dropdownMenu.classList.remove('show');
                }
            });
        } else {
            userMenu.style.display = 'none';
        }
    }


    // Initialize page-specific functionality
    if (path.includes('login.html')) {
        initAuthForms();
    } else if (path.includes('dashboard.html') && currentUser) {
        initDashboard(); // Will call updateDashboardData which fetches from backend
    } else if (path.includes('transaction.html') && currentUser) {
        initTransactionForm(); // Will fetch categories
    } else if (path.includes('new_savings.html') && currentUser) {
        initSavingsGoalForm(); // Will use placeholder API
    } else if (path.includes('saving_goal.html') && currentUser) {
        updateSavingsGoals(); // Will use placeholder API
    }
    
    // Cycle reset is now handled by backend logic for balance summary.
    // No explicit client-side checkCycleReset() needed for core functionality.
});
