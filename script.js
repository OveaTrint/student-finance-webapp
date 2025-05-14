// ==================== UTILITY FUNCTIONS ====================

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('user')) || null;
}

function updateUserData(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

function showError(message, elementId = null) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    if (elementId) {
        const targetElement = document.getElementById(elementId);
        if (targetElement) {
            const existingError = targetElement.querySelector('.error-message');
            if (existingError) existingError.remove();
            targetElement.prepend(errorElement);
        }
    } else {
        document.body.prepend(errorElement);
    }
    
    setTimeout(() => errorElement.remove(), 5000);
}

// ==================== DOM ELEMENT INTERACTIONS ====================

// Radio Button Interactions
document.querySelectorAll('.type-option input[type="radio"]').forEach(radio => {
    if(radio.checked) {
        radio.closest('.type-option').classList.add('selected');
    }
    
    radio.addEventListener('change', () => {
        document.querySelectorAll('.type-option').forEach(option => {
            option.classList.remove('selected');
        });
        if(radio.checked) {
            radio.closest('.type-option').classList.add('selected');
        }
    });
});

// Toggle Switch Interaction
document.querySelector('.switch input')?.addEventListener('change', function() {
    console.log('Lock Goal:', this.checked);
});

// ==================== AUTHENTICATION & FORM HANDLING ====================

function getUrlParameter(name) {
    name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function initAuthForms() {
    console.log("DEBUG: initAuthForms called");

    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (!loginTab || !signupTab || !loginForm || !signupForm) {
        console.error("DEBUG: Auth form elements (tabs or forms) NOT FOUND!"); 
        return;
    }
     console.log("DEBUG: loginForm element found:", loginForm);
     console.log("DEBUG: signupForm element found:", signupForm);

    
    // Initialize form state
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
    
    // Tab click handlers
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        loginForm.style.display = 'block';
        signupTab.classList.remove('active');
        signupForm.style.display = 'none';
    });
    
    signupTab.addEventListener('click', () => {
        signupTab.classList.add('active');
        signupForm.style.display = 'block';
        loginTab.classList.remove('active');
        loginForm.style.display = 'none';
    });
    
    // Form submissions
   loginForm.addEventListener('submit', async (e) => {
    console.log("DEBUG: Login form submitted!"); // Log 4
    e.preventDefault();

    const usernameInputEl = loginForm.querySelector('input[type="text"]');
    const passwordInputEl = loginForm.querySelector('input[type="password"]');

    if (!usernameInputEl || !passwordInputEl) {
        console.error("DEBUG: Username or password input field not found in login form!"); // Log 5
        showError("Internal error: Form fields missing.", loginForm.id || loginForm);
        return;
    }

    const usernameValue = usernameInputEl.value;
    const passwordValue = passwordInputEl.value;
    console.log("DEBUG: Username to send:", usernameValue, "Password to send:", passwordValue); // Log 6

    try {
        console.log("DEBUG: Attempting to call loginUser API function (from userApi.js)..."); // Log 7

        // --- CORRECTED LINE ---
        const user = await loginUser(usernameValue, passwordValue); // Pass the actual values
        // --- OR if you prefer to use the formData object directly (though less explicit than above):
        // const formData = { username: usernameValue, password: passwordValue };
        // const user = await loginUser(formData.username, formData.password);

        console.log("DEBUG: API call loginUser completed. Response from API:", user); // Log 8

        if (user && user.username) {
            console.log("DEBUG: Login successful based on API response, redirecting to dashboard.html");
            window.location.href = 'dashboard.html';
        } else {
            console.error("DEBUG: Login API call seemed successful, but user data issue. User object from API:", user);
            showError("Login successful, but user data couldn't be fully retrieved. Try refreshing.", loginForm.id || loginForm);
        }
    } catch (error) {
        console.error("DEBUG: Error caught during loginUser API call or in its processing:", error); // Log 9
        showError(error.message, loginForm.id || loginForm); // The error.message here would have been "username is not defined"
    }
});
    
    // Inside initAuthForms() in script.js

signupForm.addEventListener('submit', async (e) => {
    console.log("DEBUG: Signup form submitted!"); // Keep this log
    e.preventDefault();
    const passwords = signupForm.querySelectorAll('input[type="password"]'); // This is fine for passwords

    // Get values using their new IDs
    const fullNameValue = document.getElementById('signupFullNameInput').value;
    const usernameValue = document.getElementById('signupUsernameInput').value;
    const passwordValue = passwords[0].value;
    const confirmPasswordValue = passwords[1].value;
    const frequencyValue = signupForm.querySelector('select[name="frequency"]').value;

    const userData = {
    fullName: document.getElementById('signupFullNameInput').value,
    username: document.getElementById('signupUsernameInput').value,
    password: passwords[0].value,
    confirmPassword: passwords[1].value,
    frequency: signupForm.querySelector('select[name="frequency"]').value
};
    console.log("DEBUG: Signup form data collected:", userData); // Keep this log

    if (passwordValue !== confirmPasswordValue) {
        showError("Passwords do not match!", signupForm); // Show error and stop
        return;
    }

    try {
        console.log("DEBUG: Attempting to call registerUser API function (from userApi.js)..."); // Keep this log
        // The registerUser function in userApi.js needs to know which field to use for the backend 'username'.
        // Make sure userApi.js's registerUser is expecting 'username' from this userData object.
        // Example: body: JSON.stringify({ username: userData.username, password: userData.password, ... })
        const result = await registerUser(userData); // API call
        console.log("DEBUG: API call registerUser completed. Response from API:", result); // Keep this log

        if (result && result.message && result.message.includes("successfully")) {
            showError(result.message + " Please login.", signupForm.parentElement, true); // Global success
            loginTab.click(); // Switch to login tab

            // Pre-fill login form's username field
            const loginUsernameField = document.getElementById('loginUsernameInput');
            if (loginUsernameField) {
                loginUsernameField.value = userData.username; // Pre-fill with the entered username
            } else {
                console.warn("DEBUG: Could not find #loginUsernameInput to prefill after signup.");
            }

        } else {
            // Handle cases where result or result.message is not as expected
            let errorMessage = "Signup failed. Please try again.";
            if (result && result.message) { // If backend sends a JSON object with a message
                errorMessage = result.message;
            } else if (result && typeof result === 'string') { // If backend sends a plain string error
                errorMessage = result;
            } else if (result && result.error) { // Another common error pattern
                 errorMessage = result.error;
            }
            // If the 'error' object from the catch block has more info (e.g., from fetch failing)
            // that would be handled by the catch block itself.
            // This 'else' handles backend responses that are 200 OK but logically a failure.
            showError(errorMessage, signupForm);
        }
    } catch (error) {
        console.error("DEBUG: Error caught during registerUser API call or in its processing:", error); // Keep this log
        // If error.message is already set (e.g. "Passwords do not match" from userApi.js, or network error)
        // that will be used. Otherwise, provide a generic one.
        showError(error.message || "An unexpected error occurred during signup.", signupForm);
    }
});
}


// ==================== DASHBOARD FUNCTIONALITY ====================

function initDashboard() {
    // Navigation buttons
    document.getElementById('addTransactionBtn')?.addEventListener('click', () => {
        window.location.href = 'transaction.html';
    });
    
    document.getElementById('setSavingsGoalBtn')?.addEventListener('click', () => {
        window.location.href = 'new_savings.html';
    });
    
    // Logout button
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
    
    // Update dashboard data
    updateDashboard();
}

function updateDashboard() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Update user info
    document.querySelector('.user-greeting h2').textContent = `Welcome back, ${user.username || 'User'}!`;
    
    // Update metrics
    if (user.currentCycle) {
        document.querySelectorAll('.metric-card')[0].querySelector('.metric-value').textContent = 
            `₦${user.currentCycle.income?.toFixed(2) || '0.00'}`;
        document.querySelectorAll('.metric-card')[1].querySelector('.metric-value').textContent = 
            `₦${user.currentCycle.expenses?.toFixed(2) || '0.00'}`;
        document.querySelectorAll('.metric-card')[2].querySelector('.metric-value').textContent = 
            `₦${user.currentCycle.balance?.toFixed(2) || '0.00'}`;
    }
    
    // Update transactions
    updateTransactionsList();
    
    // Update savings goals
    updateSavingsGoals();
}

function updateTransactionsList() {
    const user = getCurrentUser();
    const container = document.querySelector('.transactions-list');
    if (!user || !container || !user.transactions) return;
    
    const transactions = user.transactions.slice(0, 5);
    container.innerHTML = `
        <h3>Recent Transactions</h3>
        ${transactions.length ? transactions.map(t => `
            <div class="transaction-item">
                <div>
                    <div class="transaction-category">${t.category || 'Uncategorized'}</div>
                    <div class="transaction-date">${new Date(t.date).toLocaleDateString() || ''}</div>
                </div>
                <div class="transaction-amount ${t.type === 'income' ? 'positive' : 'negative'}">
                    ${t.type === 'income' ? '+' : '-'}₦${t.amount?.toFixed(2) || '0.00'}
                </div>
            </div>
        `).join('') : '<p>No transactions yet</p>'}
    `;
}

// ==================== TRANSACTION FUNCTIONALITY ====================

function initTransactionForm() {
    const form = document.querySelector('.transaction-form');
    if (!form) return;
    
    // Set default date
    form.querySelector('input[type="date"]').valueAsDate = new Date();
    
    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            type: form.querySelector('input[name="type"]:checked').value,
            amount: parseFloat(form.querySelector('input[type="number"]').value),
            category: form.querySelector('select').value,
            date: form.querySelector('input[type="date"]').value,
            notes: form.querySelector('textarea').value
        };
        
        try {
            if (addTransaction(formData)) {
                window.location.href = 'dashboard.html';
            } else {
                throw new Error('Failed to add transaction');
            }
        } catch (error) {
            showError(error.message, 'transactionForm');
        }
    });
}

function addTransaction(transaction) {
    const user = getCurrentUser();
    if (!user) return false;
    
    // Initialize arrays if they don't exist
    if (!user.transactions) user.transactions = [];
    if (!user.currentCycle) {
        user.currentCycle = {
            startDate: new Date(),
            balance: 0,
            income: 0,
            expenses: 0
        };
    }
    
    // Add transaction
    transaction.id = Date.now();
    user.transactions.push(transaction);
    
    // Update cycle totals
    if (transaction.type === 'income') {
        user.currentCycle.income += transaction.amount;
        user.currentCycle.balance += transaction.amount;
    } else {
        user.currentCycle.expenses += transaction.amount;
        user.currentCycle.balance -= transaction.amount;
    }
    
    updateUserData(user);
    return true;
}

// ==================== SAVINGS GOALS FUNCTIONALITY ====================

function initSavingsGoalForm() {
    const form = document.querySelector('.goal-form');
    if (!form) return;
    
    // Set default date (3 months from now)
    const dateInput = form.querySelector('input[type="date"]');
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    dateInput.valueAsDate = futureDate;
    
    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            name: form.querySelector('input[type="text"]').value,
            targetAmount: parseFloat(form.querySelector('input[type="number"]').value),
            category: form.querySelector('select').value,
            targetDate: form.querySelector('input[type="date"]').value,
            isLocked: form.querySelector('input[type="checkbox"]').checked
        };
        
        try {
            if (addSavingsGoal(formData)) {
                window.location.href = 'saving_goal.html';
            } else {
                throw new Error('Failed to create savings goal');
            }
        } catch (error) {
            showError(error.message, 'goalForm');
        }
    });
}

function addSavingsGoal(goal) {
    const user = getCurrentUser();
    if (!user) return false;
    
    if (!user.savingsGoals) user.savingsGoals = [];
    
    goal.id = Date.now();
    goal.currentAmount = 0;
    goal.createdAt = new Date().toISOString();
    user.savingsGoals.push(goal);
    
    updateUserData(user);
    return true;
}

function updateSavingsGoals() {
    const user = getCurrentUser();
    const container = document.querySelector('.goals-grid');
    if (!user || !container || !user.savingsGoals) return;
    
    container.innerHTML = user.savingsGoals.map(goal => `
        <div class="goal-card">
            <div class="goal-icon">${getGoalIcon(goal.category)}</div>
            <h3 class="goal-title">${goal.name}</h3>
            <p class="goal-target">Target: ₦${goal.targetAmount?.toFixed(2) || '0.00'}</p>
            
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(goal.currentAmount / goal.targetAmount * 100) || 0}%"></div>
            </div>

            <div class="goal-progress">
                <span class="current-amount">₦${goal.currentAmount?.toFixed(2) || '0.00'}</span>
                <span class="percentage">${Math.round((goal.currentAmount / goal.targetAmount * 100) || 0)}%</span>
            </div>

            <button class="add-to-goal" data-id="${goal.id}">Add to Goal</button>
        </div>
    `).join('');
    
    // Add event listeners to buttons
    document.querySelectorAll('.add-to-goal').forEach(button => {
        button.addEventListener('click', function() {
            const amount = parseFloat(prompt("Enter amount to add:"));
            if (!isNaN(amount) && amount > 0) {
                addToSavingsGoal(this.dataset.id, amount);
                updateSavingsGoals();
            }
        });
    });
}

function addToSavingsGoal(goalId, amount) {
    const user = getCurrentUser();
    if (!user || !user.savingsGoals) return false;
    
    const goal = user.savingsGoals.find(g => g.id.toString() === goalId.toString());
    if (!goal) return false;
    
    goal.currentAmount += amount;
    updateUserData(user);
    return true;
}

function getGoalIcon(category) {
    const icons = {
        'emergency': '🛡️',
        'vehicle': '🚗',
        'housing': '🏠',
        'education': '🎓',
        'travel': '✈️'
    };
    return icons[category.toLowerCase()] || '💰';
}

// ==================== CYCLE MANAGEMENT ====================

function checkCycleReset() {
    const user = getCurrentUser();
    if (!user || !user.frequency || !user.currentCycle) return;
    
    const now = new Date();
    const lastReset = new Date(user.currentCycle.startDate);
    let needsReset = false;
    
    if (user.frequency === "WEEKLY") {
        needsReset = getWeekNumber(now) !== getWeekNumber(lastReset);
    } else if (user.frequency === "BIWEEKLY") {
        const diffDays = Math.floor((now - lastReset) / (1000 * 60 * 60 * 24));
        needsReset = diffDays >= 14;
    } else { // MONTHLY
        needsReset = now.getMonth() !== lastReset.getMonth();
    }
    
    if (needsReset) {
        user.currentCycle = {
            startDate: now,
            balance: 0,
            income: 0,
            expenses: 0
        };
        updateUserData(user);
    }
}

function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in for protected pages
    const user = getCurrentUser();
    const isAuthPage = window.location.pathname.includes('login.html') || 
                      window.location.pathname.includes('index.html');
    
    if (!user && !isAuthPage) {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize page-specific functionality
    if (window.location.pathname.includes('login.html')) {
        initAuthForms();
    } else if (window.location.pathname.includes('dashboard.html')) {
        initDashboard();
    } else if (window.location.pathname.includes('transaction.html')) {
        initTransactionForm();
    } else if (window.location.pathname.includes('new_savings.html')) {
        initSavingsGoalForm();
    } else if (window.location.pathname.includes('saving_goal.html')) {
        updateSavingsGoals();
    }
    
    // Check for cycle reset on all pages
    checkCycleReset();
});
