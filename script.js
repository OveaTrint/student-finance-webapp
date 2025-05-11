// Radio Button Interactions
document.querySelectorAll('.type-option input[type="radio"]').forEach(radio => {
    // Initialize selected state
    if(radio.checked) {
        radio.closest('.type-option').classList.add('selected');
    }
    
    // Add change handler
    radio.addEventListener('change', () => {
        document.querySelectorAll('.type-option').forEach(option => {
            option.classList.remove('selected');
        });
        if(radio.checked) {
            radio.closest('.type-option').classList.add('selected');
        }
    });
});


document.addEventListener('DOMContentLoaded', function() {
    // Get all necessary elements
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    // Function to get URL parameters
    function getUrlParameter(name) {
        name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
    
    // Check URL parameter on page load
    const formType = getUrlParameter('form');
    
    if (formType === 'signup') {
        // Show signup form and activate signup tab
        signupTab.classList.add('active');
        signupForm.style.display = 'block';
        loginTab.classList.remove('active');
        loginForm.style.display = 'none';
    } else {
        // Default to login form
        loginTab.classList.add('active');
        loginForm.style.display = 'block';
        signupTab.classList.remove('active');
        signupForm.style.display = 'none';
    }
    
    // Tab click handlers
    loginTab.addEventListener('click', function() {
        loginTab.classList.add('active');
        loginForm.style.display = 'block';
        signupTab.classList.remove('active');
        signupForm.style.display = 'none';
    });
    
    signupTab.addEventListener('click', function() {
        signupTab.classList.add('active');
        signupForm.style.display = 'block';
        loginTab.classList.remove('active');
        loginForm.style.display = 'none';
    });
    
    // Form submission handlers
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Login form submitted');
            // Add your login logic here
        });
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Signup form submitted');
            // Add your signup logic here
        });
    }
});

// dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Handle button clicks using button elements
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    const setSavingsGoalBtn = document.getElementById('setSavingsGoalBtn');
    
    if (addTransactionBtn) {
        addTransactionBtn.addEventListener('click', function() {
            window.location.href = 'transaction.html';
        });
    }
    
    if (setSavingsGoalBtn) {
        setSavingsGoalBtn.addEventListener('click', function() {
            window.location.href = 'new_savings.html';
        });
    }
});


// Add interaction for add-to-goal buttons
document.querySelectorAll('.add-to-goal').forEach(button => {
    button.addEventListener('click', () => {
        // Implement add funds functionality
        alert('Open add funds modal');
    });
});

// Add toggle switch interaction
document.querySelector('.switch input').addEventListener('change', function() {
    console.log('Lock Goal:', this.checked);
});   

// Transaction Form
document.querySelector('.transaction-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const form = e.target;
    const type = form.querySelector('input[name="type"]:checked').value;
    const amount = parseFloat(form.querySelector('input[type="number"]').value);
    const category = form.querySelector('select').value;
    const date = form.querySelector('input[type="date"]').value;
    const notes = form.querySelector('textarea').value;
    
    if (addTransaction({ type, amount, category, date, notes })) {
      window.location.href = 'dashboard.html';
    } else {
      alert('Failed to add transaction');
    }
  });
  
  // Savings Goal Form
  document.querySelector('.goal-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const form = e.target;
    const name = form.querySelector('input[type="text"]').value;
    const targetAmount = parseFloat(form.querySelector('input[type="number"]').value);
    const category = form.querySelector('select').value;
    const targetDate = form.querySelector('input[type="date"]').value;
    const isLocked = form.querySelector('input[type="checkbox"]').checked;
    
    if (addSavingsGoal({ name, targetAmount, category, targetDate, isLocked })) {
      window.location.href = 'saving_goal.html';
    } else {
      alert('Failed to create savings goal');
    }
  });

// dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded'); // Add this
    
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    const setSavingsGoalBtn = document.getElementById('setSavingsGoalBtn');
    
    console.log('Buttons found:', addTransactionBtn, setSavingsGoalBtn); // Add this
    
    if (addTransactionBtn) {
        addTransactionBtn.addEventListener('click', function() {
            console.log('Add Transaction button clicked'); // Add this
            window.location.href = 'transaction.html';
        });
    }
    
    if (setSavingsGoalBtn) {
        setSavingsGoalBtn.addEventListener('click', function() {
            console.log('Set Savings Goal button clicked'); // Add this
            window.location.href = 'new_savings.html';
        });
    }
});
function updateDashboard() {
    const user = getCurrentUser();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    
    // Update greeting
    document.querySelector('.user-greeting h2').textContent = `Welcome back, ${user.username || 'User'}!`;
    
    // Update metrics
    document.querySelector('.metric-value:nth-child(1)').textContent = `₦${user.currentCycle.income.toFixed(2)}`;
    document.querySelector('.metric-value:nth-child(2)').textContent = `₦${user.currentCycle.expenses.toFixed(2)}`;
    document.querySelector('.metric-value:nth-child(3)').textContent = `₦${user.currentCycle.balance.toFixed(2)}`;
    
    // Update recent transactions
    const transactionsContainer = document.querySelector('.transactions-list');
    if (transactionsContainer) {
      const recentTransactions = getTransactions().slice(0, 5);
      transactionsContainer.innerHTML = `
        <h3>Recent Transactions</h3>
        ${recentTransactions.map(t => `
          <div class="transaction-item">
            <div>
              <div class="transaction-category">${t.category}</div>
              <div class="transaction-date">${new Date(t.date).toLocaleDateString()}</div>
            </div>
            <div class="transaction-amount ${t.type === 'income' ? 'positive' : 'negative'}">
              ${t.type === 'income' ? '+' : '-'}₦${t.amount.toFixed(2)}
            </div>
          </div>
        `).join('')}
      `;
    }
  }


// Add interaction for add-to-goal buttons
document.querySelectorAll('.add-to-goal').forEach(button => {
    button.addEventListener('click', () => {
        // Implement add funds functionality
        alert('Open add funds modal');
    });
});

// Add toggle switch interaction
document.querySelector('.switch input').addEventListener('change', function() {
    console.log('Lock Goal:', this.checked);
});


document.getElementById('logoutBtn')?.addEventListener('click', function(e) {
    e.preventDefault();
    logout();
    window.location.href = 'index.html';
  });


// saving goals
function addSavingsGoal(goal) {
    const user = getCurrentUser();
    if (!user) return false;
    
    goal.id = Date.now();
    goal.currentAmount = 0;
    goal.createdAt = new Date().toISOString();
    user.savingsGoals.push(goal);
    
    updateUserData(user);
    return true;
  }
  
  function addToSavingsGoal(goalId, amount) {
    const user = getCurrentUser();
    if (!user) return false;
    
    const goal = user.savingsGoals.find(g => g.id === goalId);
    if (!goal) return false;
    
    goal.currentAmount += amount;
    updateUserData(user);
    return true;
  }
  
  function getSavingsGoals() {
    const user = getCurrentUser();
    return user ? user.savingsGoals : [];
  }

//   Allowance Cycle Management
function getCurrentCycleId(user) {
    const date = new Date(user.currentCycle.startDate);
    return user.frequency === "WEEKLY" 
      ? `${date.getFullYear()}-W${getWeekNumber(date)}`
      : `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  }
  
  function checkCycleReset() {
    const user = getCurrentUser();
    if (!user) return;
    
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
  
  // Helper function to get week number
  function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  }

//   Transaction management
function addTransaction(transaction) {
    const user = getCurrentUser();
    if (!user) return false;
    
    // Update cycle totals
    if (transaction.type === "income") {
      user.currentCycle.income += transaction.amount;
      user.currentCycle.balance += transaction.amount;
    } else {
      user.currentCycle.expenses += transaction.amount;
      user.currentCycle.balance -= transaction.amount;
    }
    
    // Add to transactions
    transaction.id = Date.now();
    transaction.cycle = getCurrentCycleId(user);
    user.transactions.push(transaction);
    
    // Update storage
    updateUserData(user);
    return true;
  }
  
  function getTransactions(cycleId = null) {
    const user = getCurrentUser();
    if (!user) return [];
    
    if (cycleId) {
      return user.transactions.filter(t => t.cycle === cycleId);
    }
    return user.transactions;
  }

   // Show/hide frequency field based on transaction type
   document.querySelectorAll('input[name="type"]').forEach(radio => {
    radio.addEventListener('change', () => {
        document.getElementById('frequencyField').style.display = 
            radio.value === 'income' ? 'block' : 'none';
    });
});


  // Update cycle UI
async function updateCycleUI() {
    const cycle = await getCurrentCycle();
    document.getElementById('cycleDates').textContent = 
        `${formatDate(cycle.startDate)} - ${formatDate(cycle.endDate)}`;
    document.getElementById('remainingBalance').textContent = 
        `₦${cycle.remainingBalance.toFixed(2)}`;
}

// Manual reset handler
document.getElementById('manualResetBtn')?.addEventListener('click', async () => {
    if (confirm("Reset your cycle early? This will archive current transactions.")) {
        await resetCycle();
        updateCycleUI();
    }
});

// Filter logic
async function loadTransactions(cycleId = 'current') {
    const response = await fetch(`/api/transactions?cycle=${cycleId}`);
    const transactions = await response.json();
    renderTransactions(transactions);
}

function renderTransactions(transactions) {
    const container = document.getElementById('transactionsContainer');
    container.innerHTML = transactions.map(t => `
        <div class="transaction">
            <span class="category">${t.category}</span>
            <span class="amount ${t.type}">${t.type === 'income' ? '+' : '-'}₦${t.amount}</span>
        </div>
    `).join('');
}

// Filter event listener
document.getElementById('cycleFilter').addEventListener('change', (e) => {
    loadTransactions(e.target.value);
});

// For temporary frontend testing (without backend)
function getTransactions() {
    try {
      return JSON.parse(localStorage.getItem('transactions')) || [];
    } catch {
      return [];
    }
  }
  
  function addTransaction(transaction) {
    const transactions = getTransactions();
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }