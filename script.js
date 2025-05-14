// ==================== UTILITY FUNCTIONS ====================

function getLocalStoredUser() {
    const userString = localStorage.getItem('user');
    if (userString) {
        try {
            return JSON.parse(userString);
        } catch (e) {
            console.error("Error parsing user from localStorage in script.js", e);
            localStorage.removeItem('user');
            return null;
        }
    }
    return null;
}

function updateUserData(user) { // For localStorage based savings goals
    localStorage.setItem('user', JSON.stringify(user));
}

function showError(message, elementOrId = null) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;

    let targetElement = null;
    if (typeof elementOrId === 'string') {
        targetElement = document.getElementById(elementOrId);
    } else if (elementOrId instanceof HTMLElement) {
        targetElement = elementOrId;
    }

    if (targetElement) {
        const form = targetElement.closest('form') || targetElement;
        if (form) {
            const existingError = form.querySelector('.error-message');
            if (existingError) existingError.remove();
            form.prepend(errorElement);
        } else {
            const existingGlobalError = document.body.querySelector('.error-message:not(form .error-message)');
            if(existingGlobalError) existingGlobalError.remove();
            document.body.prepend(errorElement);
        }
    } else {
        const existingGlobalError = document.body.querySelector('.error-message:not(form .error-message)');
        if(existingGlobalError) existingGlobalError.remove();
        document.body.prepend(errorElement);
    }

    setTimeout(() => errorElement.remove(), 5000);
}

// ==================== AUTHENTICATION & FORM HANDLING ====================

function getUrlParameter(name) {
    name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function initAuthForms() {
    console.log("DEBUG script.js: initAuthForms called");

    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (!loginTab || !signupTab || !loginForm || !signupForm) {
        console.error("DEBUG script.js: Auth form elements (tabs or forms) NOT FOUND!");
        return;
    }
    console.log("DEBUG script.js: loginForm element found:", loginForm);
    console.log("DEBUG script.js: signupForm element found:", signupForm);

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

    loginForm.addEventListener('submit', async (e) => {
        console.log("DEBUG script.js: Login form submitted!");
        e.preventDefault();

        const usernameInputEl = document.getElementById('loginUsernameInput') || loginForm.querySelector('input[type="text"]');
        const passwordInputEl = document.getElementById('loginPasswordInput') || loginForm.querySelector('input[type="password"]');

        if (!usernameInputEl || !passwordInputEl) {
            console.error("DEBUG script.js: Username or password input field not found in login form!");
            showError("Internal error: Form fields missing.", loginForm);
            return;
        }

        const usernameValue = usernameInputEl.value;
        const passwordValue = passwordInputEl.value;
        console.log("DEBUG script.js: Username to send:", usernameValue, "Password to send:", passwordValue);

        try {
            console.log("DEBUG script.js: Attempting to call loginUser API function (from userApi.js)...");
            const user = await loginUser(usernameValue, passwordValue); // from userApi.js
            console.log("DEBUG script.js: API call loginUser completed. Response from API:", user);

            if (user && user.username) {
                console.log("DEBUG script.js: Login successful based on API response, redirecting to dashboard.html");
                window.location.href = 'dashboard.html';
            } else {
                console.error("DEBUG script.js: Login API call seemed successful, but user data issue. User object from API:", user);
                showError("Login successful, but user data couldn't be fully retrieved. Try refreshing.", loginForm);
            }
        } catch (error) {
            console.error("DEBUG script.js: Error caught during loginUser API call or in its processing:", error);
            showError(error.message || "Login failed. Please check your credentials.", loginForm);
        }
    });

    signupForm.addEventListener('submit', async (e) => {
        console.log("DEBUG script.js: Signup form submitted!");
        e.preventDefault();
        const passwords = signupForm.querySelectorAll('input[type="password"]');

        const fullNameValue = document.getElementById('signupFullNameInput')?.value || '';
        const usernameValue = document.getElementById('signupUsernameInput')?.value || '';
        const passwordValue = passwords[0]?.value || '';
        const confirmPasswordValue = passwords[1]?.value || '';
        const frequencyValue = signupForm.querySelector('select[name="frequency"]')?.value || 'MONTHLY';

        const userData = {
            fullName: fullNameValue,
            username: usernameValue,
            password: passwordValue,
            confirmPassword: confirmPasswordValue,
            frequency: frequencyValue
        };
        console.log("DEBUG script.js: Signup form data collected:", userData);

        if (!usernameValue || !passwordValue) {
            showError("Username and password are required.", signupForm);
            return;
        }
        if (passwordValue !== confirmPasswordValue) {
            showError("Passwords do not match!", signupForm);
            return;
        }

        try {
            console.log("DEBUG script.js: Attempting to call registerUser API function (from userApi.js)...");
            const result = await registerUser(userData); // from userApi.js
            console.log("DEBUG script.js: API call registerUser completed. Response from API:", result);

            if (result && result.message && result.message.toLowerCase().includes("successfully")) {
                showError(result.message + " Please login.", signupForm.parentElement, true);
                loginTab.click();
                const loginUsernameField = document.getElementById('loginUsernameInput');
                if (loginUsernameField) {
                    loginUsernameField.value = userData.username;
                } else {
                    console.warn("DEBUG script.js: Could not find #loginUsernameInput to prefill after signup.");
                }
            } else {
                let errorMessage = "Signup failed. Please try again.";
                if (result && result.message) errorMessage = result.message;
                else if (result && typeof result === 'string') errorMessage = result;
                else if (result && result.error) errorMessage = result.error;
                showError(errorMessage, signupForm);
            }
        } catch (error) {
            console.error("DEBUG script.js: Error caught during registerUser API call or in its processing:", error);
            showError(error.message || "An unexpected error occurred during signup.", signupForm);
        }
    });
}

// ==================== NEW DASHBOARD FUNCTIONALITY (API DRIVEN) ====================

async function populateDashboardData() {
    console.log("DEBUG script.js: populateDashboardData called");

    const localUser = getLocalStoredUser();
    if (!localUser || !localUser.username) {
        console.log("DEBUG script.js: No local user found, redirecting to login from populateDashboardData.");
        window.location.href = 'login.html';
        return;
    }

    // User greeting is updated here as well, ensuring it's based on the latest from localStorage
    const userGreetingElement = document.querySelector('.user-greeting h2');
    if (userGreetingElement) {
        userGreetingElement.textContent = `Welcome back, ${localUser.username}!`;
    } else {
        console.warn("DEBUG script.js: .user-greeting h2 element not found for dashboard.");
    }

    try {
        console.log("DEBUG script.js: Attempting to fetch cycle summary from API...");
        const cycleSummary = await fetchCycleSummaryApi(); // from userApi.js
        console.log("DEBUG script.js: fetchCycleSummaryApi response:", cycleSummary);

        if (cycleSummary) {
            const totalIncomeEl = document.querySelector('.metrics-grid .metric-card:nth-child(1) .metric-value');
            const totalExpensesEl = document.querySelector('.metrics-grid .metric-card:nth-child(2) .metric-value');
            const currentBalanceEl = document.querySelector('.metrics-grid .metric-card:nth-child(3) .metric-value');
            const overviewMessageEl = document.querySelector('.overview-message');

            if (totalIncomeEl) totalIncomeEl.textContent = `₦${cycleSummary.totalIncome?.toFixed(2) || '0.00'}`;
            else console.warn("DEBUG script.js: Total Income element not found.");

            if (totalExpensesEl) totalExpensesEl.textContent = `₦${cycleSummary.totalExpenses?.toFixed(2) || '0.00'}`;
            else console.warn("DEBUG script.js: Total Expenses element not found.");

            if (currentBalanceEl) currentBalanceEl.textContent = `₦${cycleSummary.currentBalance?.toFixed(2) || '0.00'}`;
            else console.warn("DEBUG script.js: Current Balance element not found.");

            if (overviewMessageEl && cycleSummary.cyclePeriod) overviewMessageEl.textContent = `Here's your financial overview for ${cycleSummary.cyclePeriod}`;
            else console.warn("DEBUG script.js: Overview message element or cyclePeriod data not found.");

            const incomeChangeEl = document.querySelector('.metrics-grid .metric-card:nth-child(1) .metric-change');
            const expenseChangeEl = document.querySelector('.metrics-grid .metric-card:nth-child(2) .metric-change');
            const balanceChangeEl = document.querySelector('.metrics-grid .metric-card:nth-child(3) .metric-change');

            if (incomeChangeEl) {
                if (cycleSummary.totalIncome != null && cycleSummary.totalIncome > 0) {
                    incomeChangeEl.textContent = 'Income recorded this cycle';
                    incomeChangeEl.className = 'metric-change positive';
                } else {
                    incomeChangeEl.textContent = 'No income this cycle';
                    incomeChangeEl.className = 'metric-change';
                }
            } else { console.warn("DEBUG script.js: Income Change element not found."); }

            if (expenseChangeEl) {
                if (cycleSummary.totalExpenses != null && cycleSummary.totalExpenses > 0) {
                    expenseChangeEl.textContent = 'Expenses recorded this cycle';
                    expenseChangeEl.className = 'metric-change negative';
                } else {
                    expenseChangeEl.textContent = 'No expenses this cycle';
                    expenseChangeEl.className = 'metric-change';
                }
            } else { console.warn("DEBUG script.js: Expense Change element not found."); }

            if (balanceChangeEl) {
                balanceChangeEl.textContent = 'Available to spend';
                balanceChangeEl.className = 'metric-change';
            } else { console.warn("DEBUG script.js: Balance Change element not found."); }

            if (cycleSummary.recentTransactions && cycleSummary.recentTransactions.length > 0) {
                console.log("DEBUG script.js: Updating transactions list with data from cycleSummary:", cycleSummary.recentTransactions);
                updateTransactionsListDisplay(cycleSummary.recentTransactions);
            } else {
                console.log("DEBUG script.js: No recent transactions in cycleSummary or it's empty.");
                updateTransactionsListDisplay([]);
            }
        } else {
            console.error("DEBUG script.js: cycleSummary data is null or undefined after API call.");
            showError("Could not load dashboard summary data.", document.body);
        }
    } catch (error) {
        console.error("DEBUG script.js: Error in populateDashboardData:", error);
        showError("Could not load dashboard data: " + error.message, document.body);
        if (error.message.toLowerCase().includes("session expired") || error.message.toLowerCase().includes("unauthorized") || (error.name === 'TypeError' && error.message.includes("Failed to fetch"))) {
            console.log("DEBUG script.js: Redirecting to login due to error in populateDashboardData:", error.message);
            await logoutUser(); // from userApi.js
            window.location.href = 'login.html';
        }
    }
}

function updateTransactionsListDisplay(transactions) {
    console.log("DEBUG script.js: updateTransactionsListDisplay called with:", transactions);
    const container = document.querySelector('.transactions-list');

    if (!container) {
        console.error("DEBUG script.js: .transactions-list container not found in dashboard.html!");
        return;
    }

    const validTransactions = Array.isArray(transactions) ? transactions.filter(t => t != null) : [];

    if (validTransactions.length > 0) {
        container.innerHTML = `
            <h3>Recent Transactions</h3>
            ${validTransactions.map(t => {
                const categoryDisplay = t.categoryDisplayName || (t.category ? (typeof t.category === 'object' ? t.category.displayName || t.category.name : String(t.category)) : 'Uncategorized');
                const dateDisplay = t.date ? new Date(t.date).toLocaleDateString() : 'N/A';
                const amountDisplay = typeof t.amount === 'number' ? t.amount.toFixed(2) : '0.00';
                const isIncome = String(t.type).toUpperCase() === 'INCOME';
                const typeClass = isIncome ? 'positive' : 'negative';
                const typePrefix = isIncome ? '+' : '-';

                return `
                    <div class="transaction-item">
                        <div>
                            <div class="transaction-category">${categoryDisplay}</div>
                            <div class="transaction-date">${dateDisplay}</div>
                        </div>
                        <div class="transaction-amount ${typeClass}">
                            ${typePrefix}₦${amountDisplay}
                        </div>
                    </div>
                `;
            }).join('')}
        `;
    } else {
        container.innerHTML = `
            <h3>Recent Transactions</h3>
            <p>No transactions yet for this period.</p>
        `;
    }
}

function initDashboardEventListeners() {
    console.log("DEBUG script.js: initDashboardEventListeners called");
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    const setSavingsGoalBtn = document.getElementById('setSavingsGoalBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (addTransactionBtn) {
        addTransactionBtn.addEventListener('click', () => {
            window.location.href = 'transaction.html';
        });
    } else { console.warn("DEBUG script.js: addTransactionBtn not found"); }

    if (setSavingsGoalBtn) {
        setSavingsGoalBtn.addEventListener('click', () => {
            alert("Set Savings Goal functionality not fully implemented with API yet.");
        });
    } else { console.warn("DEBUG script.js: setSavingsGoalBtn not found (ensure it has the ID and is not commented out in HTML)"); }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log("DEBUG script.js: Logout button clicked");
            try {
                await logoutUser(); // from userApi.js
                console.log("DEBUG script.js: logoutUser API call finished. Redirecting to index.html");
                window.location.href = 'index.html';
            } catch (error) {
                console.error("DEBUG script.js: Error during logout:", error);
                localStorage.removeItem('user');
                window.location.href = 'index.html';
            }
        });
    } else { console.warn("DEBUG script.js: logoutBtn not found in dashboard."); }
}

// ==================== TRANSACTION FUNCTIONALITY (API DRIVEN) ====================

function initTransactionForm() {
    console.log("DEBUG script.js: initTransactionForm called");
    const form = document.querySelector('.transaction-form');
    if (!form) {
        console.warn("DEBUG script.js: Transaction form not found on this page.");
        return;
    }

    const dateInput = form.querySelector('input[type="date"]');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }

    const transactionTypeRadios = form.querySelectorAll('input[name="type"]');
    const frequencyField = document.getElementById('frequencyField');

    function toggleFrequencyField() {
        if (frequencyField) {
            const incomeSelected = form.querySelector('input[name="type"][value="income"]:checked');
            frequencyField.style.display = incomeSelected ? 'block' : 'none';
        }
    }

    if (transactionTypeRadios.length > 0 && frequencyField) {
        transactionTypeRadios.forEach(radio => {
            radio.addEventListener('change', toggleFrequencyField);
        });
        toggleFrequencyField();
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("DEBUG script.js: Transaction form submitted");

        const type = form.querySelector('input[name="type"]:checked')?.value;
        const amount = parseFloat(form.querySelector('input[type="number"]')?.value);
        const category = form.querySelector('#transactionCategorySelect')?.value; // Uses ID
        const dateValue = form.querySelector('input[type="date"]')?.value;
        const notes = form.querySelector('textarea')?.value || '';
        let incomeFrequency = null;

        if (type === 'income' && frequencyField && frequencyField.style.display !== 'none') {
            incomeFrequency = frequencyField.querySelector('select[name="frequency"]')?.value;
        }

        if (!type || isNaN(amount) || !category || !dateValue) {
            showError("Please fill in all required fields (Type, Amount, Category, Date).", form);
            return;
        }

        const transactionData = {
            type: type,
            amount: amount,
            category: category,
            date: dateValue,
            notes: notes,
            incomeFrequency: incomeFrequency
        };
        console.log("DEBUG script.js: Transaction data to send:", transactionData);

        try {
            console.log("DEBUG script.js: Attempting to call addApiTransaction...");
            const savedTransaction = await addApiTransaction(transactionData); // from userApi.js
            console.log("DEBUG script.js: addApiTransaction response:", savedTransaction);

            if (savedTransaction && savedTransaction.id) {
                window.location.href = 'dashboard.html';
            } else {
                throw new Error('Failed to save transaction to server.');
            }
        } catch (error) {
            console.error("DEBUG script.js: Error adding transaction:", error);
            showError(error.message || 'Failed to add transaction. Please try again.', form);
        }
    });

    const cancelButton = form.querySelector('.cancel-button');
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }
}

// ==================== SAVINGS GOALS FUNCTIONALITY (Still localStorage based) ====================
function initSavingsGoalForm() {
    console.log("DEBUG script.js: initSavingsGoalForm called (localStorage based)");
    const form = document.querySelector('.goal-form');
    if (!form) return;

    const dateInput = form.querySelector('input[type="date"]');
    if (dateInput) {
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 3);
        dateInput.valueAsDate = futureDate;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = {
            name: form.querySelector('input[type="text"]')?.value,
            targetAmount: parseFloat(form.querySelector('input[type="number"]')?.value),
            category: form.querySelector('select')?.value,
            targetDate: form.querySelector('input[type="date"]')?.value,
            isLocked: form.querySelector('input[type="checkbox"]')?.checked || false
        };
        if (!formData.name || isNaN(formData.targetAmount) || !formData.targetDate) {
            showError("Please fill in Goal Name, Target Amount, and Target Date.", form);
            return;
        }
        try {
            if (addSavingsGoal(formData)) {
                alert("Savings Goal (local) added!");
                form.reset();
            } else { throw new Error('Failed to create savings goal (local)'); }
        } catch (error) { showError(error.message, form); }
    });
}

function addSavingsGoal(goal) {
    const user = getLocalStoredUser();
    if (!user) { showError("You must be logged in."); return false; }
    if (!user.savingsGoals) user.savingsGoals = [];
    goal.id = Date.now();
    goal.currentAmount = 0;
    goal.createdAt = new Date().toISOString();
    user.savingsGoals.push(goal);
    updateUserData(user);
    console.log("DEBUG script.js: Savings goal added to localStorage:", goal);
    return true;
}

function updateSavingsGoals() {
    console.log("DEBUG script.js: updateSavingsGoals (localStorage version) called");
    const user = getLocalStoredUser();
    const container = document.querySelector('.goals-grid');
    if (!container) return;

    if (!user || !user.savingsGoals || user.savingsGoals.length === 0) {
        container.innerHTML = "<p>No savings goals set yet.</p>";
        return;
    }
    container.innerHTML = user.savingsGoals.map(goal => `
        <div class="goal-card">
            <div class="goal-icon">${getGoalIcon(goal.category || 'default')}</div>
            <h3 class="goal-title">${goal.name || 'Untitled Goal'}</h3>
            <p class="goal-target">Target: ₦${goal.targetAmount?.toFixed(2) || '0.00'}</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${((goal.currentAmount / goal.targetAmount) * 100) || 0}%"></div>
            </div>
            <div class="goal-progress">
                <span class="current-amount">₦${goal.currentAmount?.toFixed(2) || '0.00'}</span>
                <span class="percentage">${Math.round(((goal.currentAmount / goal.targetAmount) * 100) || 0)}%</span>
            </div>
            <button class="add-to-goal" data-id="${goal.id}">Add to Goal</button>
        </div>
    `).join('');

    document.querySelectorAll('.add-to-goal').forEach(button => {
        button.addEventListener('click', function () {
            const goalId = this.dataset.id;
            const amountStr = prompt("Enter amount to add to this goal:");
            if (amountStr) {
                const amount = parseFloat(amountStr);
                if (!isNaN(amount) && amount > 0) {
                    if (addToSavingsGoal(goalId, amount)) {
                        updateSavingsGoals();
                    }
                } else { alert("Invalid amount entered."); }
            }
        });
    });
}

function addToSavingsGoal(goalId, amount) {
    const user = getLocalStoredUser();
    if (!user || !user.savingsGoals) return false;
    const goal = user.savingsGoals.find(g => g.id.toString() === goalId.toString());
    if (!goal) { showError("Goal not found."); return false; }
    goal.currentAmount += amount;
    updateUserData(user);
    console.log("DEBUG script.js: Added to savings goal (localStorage):", goalId, amount);
    return true;
}

function getGoalIcon(category) {
    const icons = {
        'emergency': '🛡️', 'vehicle': '🚗', 'car': '🚗', 'housing': '🏠', 'home': '🏠',
        'education': '🎓', 'school': '🎓', 'travel': '✈️', 'vacation': '✈️',
        'default': '💰'
    };
    return icons[category?.toLowerCase()] || icons['default'];
}

// ==================== INITIALIZATION (END OF FILE) ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log("DEBUG script.js: DOMContentLoaded event fired on page:", window.location.pathname);

    // General DOM interactions
    document.querySelectorAll('.type-option input[type="radio"]').forEach(radio => {
        // Initialize based on checked state (applies if form is pre-filled or user navigates back)
        const typeOption = radio.closest('.type-option');
        if (typeOption) {
            if (radio.checked) {
                typeOption.classList.add('selected');
            } else {
                typeOption.classList.remove('selected');
            }
        }

        radio.addEventListener('change', () => {
            document.querySelectorAll('.type-option').forEach(option => {
                option.classList.remove('selected');
            });
            if (radio.checked) {
                radio.closest('.type-option')?.classList.add('selected');
            }
        });
    });

    const switchInput = document.querySelector('.switch input');
    if (switchInput) {
        switchInput.addEventListener('change', function () {
            console.log('DEBUG script.js: Switch toggled:', this.checked);
        });
    }

    // --- Logic to Update User Avatar ---
    const user = getLocalStoredUser();
    const path = window.location.pathname;
    const isIndexPage = path === '/' || path.endsWith('/index.html') || (path.endsWith('/') && !path.substring(0, path.length -1).includes('/'));
    const isLoginPage = path.includes('login.html');
    const isAuthPage = isIndexPage || isLoginPage;

    if (user && user.username && !isAuthPage) { // Only on authenticated pages
        const userAvatarElement = document.getElementById('userAvatar'); // Assumes <div id="userAvatar">
        if (userAvatarElement) {
            const firstLetter = user.username.charAt(0).toUpperCase();
            userAvatarElement.textContent = firstLetter;
            userAvatarElement.classList.add('has-initial'); // For styling
        } else {
            console.warn("DEBUG script.js: #userAvatar element not found on page:", path, " (This is normal for login/index pages without the navbar).");
        }
    } else if (!isAuthPage) { // If on a protected page but somehow no user, clear avatar
        const userAvatarElement = document.getElementById('userAvatar');
        if (userAvatarElement) {
            userAvatarElement.textContent = '';
            userAvatarElement.classList.remove('has-initial');
        }
    }
    // --- End of Avatar Update ---

    if (!user && !isAuthPage) {
        console.log("DEBUG script.js: No user in localStorage and not on auth page, redirecting to login.html");
        window.location.href = 'login.html';
        return; // Stop further execution for this page load
    }

    // Initialize page-specific forms and data loading
    if (isLoginPage) {
        console.log("DEBUG script.js: Current page is login.html, calling initAuthForms()");
        initAuthForms();
    } else if (path.includes('dashboard.html')) {
        console.log("DEBUG script.js: Current page is dashboard.html, calling API-driven dashboard functions.");
        populateDashboardData();
        initDashboardEventListeners();
        updateSavingsGoals(); // For localStorage-based savings goals display
    } else if (path.includes('transaction.html')) {
        console.log("DEBUG script.js: Current page is transaction.html, calling initTransactionForm (API-driven).");
        initTransactionForm();
    } else if (path.includes('new_savings.html')) {
        console.log("DEBUG script.js: Current page is new_savings.html, calling initSavingsGoalForm (localStorage based).");
        initSavingsGoalForm();
    }
    // Add other page initializations here if needed.
});
