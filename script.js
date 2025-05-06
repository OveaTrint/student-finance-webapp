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


 // Add interaction for new goal button
 document.querySelector('.new-goal-button').addEventListener('click', () => {
    // Implement modal or new goal creation flow
    alert('Open new goal creation form');
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