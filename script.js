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
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (!loginTab || !signupTab || !loginForm || !signupForm) return;
    
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
        e.preventDefault();
        const formData = {
            username: loginForm.querySelector('input[type="text"]').value,
            password: loginForm.querySelector('input[type="password"]').value
        };
        
        try {
            const user = await loginUser(username, password); // API call
            if (user && user.username) {
                window.location.href = 'dashboard.html';
            } else {
                 showError("Login successful, but user data couldn't be fully retrieved. Try refreshing.", loginForm);
            }
        } catch (error) {
            showError(error.message, loginForm);
        }
    });
    
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const passwords = signupForm.querySelectorAll('input[type="password"]');
        const userData = {
            fullName: signupForm.querySelector('input[type="text"]').value, 
            usename: signupForm.querySelector('input[type="text"]').value,
            password: passwords[0].value,
            confirmPassword: passwords[1].value,
            frequency: signupForm.querySelector('select[name="frequency"]').value 
        };
        
        try {
            const result = await registerUser(userData); // API call
            if (result && result.message.includes("successfully")) {
                showError(result.message + " Please login.", signupForm.parentElement, true); // Global success
                loginTab.click(); // Switch to login tab
                loginForm.querySelector('input[type="email"]').value = userData.fullName; // Pre-fill username
            }
        } catch (error) {
            showError(error.message, signupForm);
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
