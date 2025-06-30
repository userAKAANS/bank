// Global state
let currentUser = null;
let currentLanguage = 'en';
let balanceVisible = true;
let authToken = localStorage.getItem('authToken');

// API base URL
const API_BASE = window.location.origin;

// Language translations
const translations = {
    en: {
        'Digital Banking': 'Digital Banking',
        'Welcome Back': 'Welcome Back',
        'Sign in to your account': 'Sign in to your account',
        'Name': 'Name',
        'PIN': 'PIN',
        'Sign In': 'Sign In',
        "Don't have an account?": "Don't have an account?",
        'Sign Up': 'Sign Up',
        'Create Account': 'Create Account',
        'Join NSG Bank today': 'Join NSG Bank today',
        'Full Name': 'Full Name',
        '4-Digit PIN': '4-Digit PIN',
        'Confirm PIN': 'Confirm PIN',
        'Already have an account?': 'Already have an account?',
        'Welcome': 'Welcome',
        'Total Balance': 'Total Balance',
        'Account:': 'Account:',
        'Transfer': 'Transfer',
        'Cards': 'Cards',
        'History': 'History',
        'Recent Transactions': 'Recent Transactions',
        'Transfer Money': 'Transfer Money',
        'Select Recipient': 'Select Recipient',
        'Choose recipient...': 'Choose recipient...',
        'Amount': 'Amount',
        'Description (Optional)': 'Description (Optional)',
        'Send Money': 'Send Money',
        'My Cards': 'My Cards',
        'Generate New Card': 'Generate New Card',
        'Transaction History': 'Transaction History',
        'No transactions yet': 'No transactions yet',
        'Start by making a transfer': 'Start by making a transfer',
        'Money Transfer': 'Money Transfer',
        'Received from': 'Received from',
        'Sent to': 'Sent to'
    },
    ar: {
        'Digital Banking': 'الخدمات المصرفية الرقمية',
        'Welcome Back': 'مرحباً بعودتك',
        'Sign in to your account': 'سجل دخولك إلى حسابك',
        'Name': 'الاسم',
        'PIN': 'الرقم السري',
        'Sign In': 'تسجيل الدخول',
        "Don't have an account?": 'ليس لديك حساب؟',
        'Sign Up': 'إنشاء حساب',
        'Create Account': 'إنشاء حساب',
        'Join NSG Bank today': 'انضم إلى بنك NSG اليوم',
        'Full Name': 'الاسم الكامل',
        '4-Digit PIN': 'الرقم السري (4 أرقام)',
        'Confirm PIN': 'تأكيد الرقم السري',
        'Already have an account?': 'لديك حساب بالفعل؟',
        'Welcome': 'مرحباً',
        'Total Balance': 'الرصيد الإجمالي',
        'Account:': 'رقم الحساب:',
        'Transfer': 'تحويل',
        'Cards': 'البطاقات',
        'History': 'التاريخ',
        'Recent Transactions': 'المعاملات الأخيرة',
        'Transfer Money': 'تحويل الأموال',
        'Select Recipient': 'اختر المستلم',
        'Choose recipient...': 'اختر المستلم...',
        'Amount': 'المبلغ',
        'Description (Optional)': 'الوصف (اختياري)',
        'Send Money': 'إرسال الأموال',
        'My Cards': 'بطاقاتي',
        'Generate New Card': 'إنشاء بطاقة جديدة',
        'Transaction History': 'تاريخ المعاملات',
        'No transactions yet': 'لا توجد معاملات بعد',
        'Start by making a transfer': 'ابدأ بإجراء تحويل',
        'Money Transfer': 'تحويل أموال',
        'Received from': 'مُستلم من',
        'Sent to': 'مُرسل إلى'
    }
};

// DOM Elements
const screens = {
    loading: document.getElementById('loading-screen'),
    login: document.getElementById('login-screen'),
    signup: document.getElementById('signup-screen'),
    dashboard: document.getElementById('dashboard-screen'),
    transfer: document.getElementById('transfer-screen'),
    cards: document.getElementById('cards-screen'),
    transactions: document.getElementById('transactions-screen')
};

// Utility Functions
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.getElementById('toast-container').appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function showLoading() {
    screens.loading.classList.add('active');
}

function hideLoading() {
    screens.loading.classList.remove('active');
}

function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    screens[screenName].classList.add('active');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Language Functions
function switchLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    document.documentElement.setAttribute('dir', currentLanguage === 'ar' ? 'rtl' : 'ltr');
    document.getElementById('lang-text').textContent = currentLanguage === 'en' ? 'العربية' : 'English';
    updatePageText();
}

function updatePageText() {
    const elements = document.querySelectorAll('[data-en]');
    elements.forEach(element => {
        const key = element.getAttribute('data-en');
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });
}

// API Functions
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE}/api${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        ...options
    };

    if (options.body) {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'An error occurred');
        }

        return data;
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    }
}

// Authentication Functions
async function signup(name, pin) {
    try {
        showLoading();
        const data = await apiCall('/signup', {
            method: 'POST',
            body: { name, pin }
        });

        authToken = data.token;
        localStorage.setItem('authToken', authToken);
        currentUser = data.user;
        
        showToast('Account created successfully!');
        await loadDashboard();
        showScreen('dashboard');
    } catch (error) {
        console.error('Signup error:', error);
    } finally {
        hideLoading();
    }
}

async function login(name, pin) {
    try {
        showLoading();
        const data = await apiCall('/login', {
            method: 'POST',
            body: { name, pin }
        });

        authToken = data.token;
        localStorage.setItem('authToken', authToken);
        currentUser = data.user;
        
        showToast('Login successful!');
        await loadDashboard();
        showScreen('dashboard');
    } catch (error) {
        console.error('Login error:', error);
    } finally {
        hideLoading();
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    showScreen('login');
    showToast('Logged out successfully');
}

// Dashboard Functions
async function loadDashboard() {
    try {
        const data = await apiCall('/dashboard');
        
        // Update user info
        document.getElementById('user-name').textContent = data.user.name;
        document.getElementById('balance-display').textContent = formatCurrency(data.user.balance);
        document.getElementById('account-number').textContent = data.user.accountNumber;
        
        // Update card info
        document.getElementById('card-number').textContent = data.card.number;
        document.getElementById('card-holder-name').textContent = data.user.name.toUpperCase();
        document.getElementById('card-expiry').textContent = data.card.expiry;
        document.getElementById('card-cvv').textContent = data.card.cvv;
        
        // Load transactions
        loadTransactions(data.transactions);
        
        currentUser = data.user;
        currentUser.card = data.card;
    } catch (error) {
        console.error('Dashboard load error:', error);
    }
}

function loadTransactions(transactions) {
    const transactionsList = document.getElementById('transactions-list');
    const fullTransactionsList = document.getElementById('full-transactions-list');
    
    if (transactions.length === 0) {
        const emptyState = `
            <div class="no-transactions">
                <p data-en="No transactions yet" data-ar="لا توجد معاملات بعد">${translations[currentLanguage]['No transactions yet']}</p>
                <p data-en="Start by making a transfer" data-ar="ابدأ بإجراء تحويل">${translations[currentLanguage]['Start by making a transfer']}</p>
            </div>
        `;
        transactionsList.innerHTML = emptyState;
        fullTransactionsList.innerHTML = emptyState;
        return;
    }
    
    const transactionHTML = transactions.map(transaction => {
        const isPositive = transaction.amount > 0;
        const icon = isPositive ? 'fas fa-arrow-down' : 'fas fa-arrow-up';
        const amountClass = isPositive ? 'positive' : 'negative';
        
        let title, subtitle;
        if (transaction.type === 'transfer_in') {
            title = transaction.description || translations[currentLanguage]['Money Transfer'];
            subtitle = `${translations[currentLanguage]['Received from']} ${transaction.sender}`;
        } else {
            title = transaction.description || translations[currentLanguage]['Money Transfer'];
            subtitle = `${translations[currentLanguage]['Sent to']} ${transaction.recipient}`;
        }
        
        return `
            <div class="transaction-item">
                <div class="transaction-info">
                    <h4>${title}</h4>
                    <p>${subtitle}</p>
                </div>
                <div class="transaction-amount ${amountClass}">
                    <div class="amount">${formatCurrency(Math.abs(transaction.amount))}</div>
                    <div class="date">${formatDate(transaction.date)}</div>
                </div>
            </div>
        `;
    }).join('');
    
    transactionsList.innerHTML = transactionHTML;
    fullTransactionsList.innerHTML = transactionHTML;
}

// Transfer Functions
async function loadRecipients() {
    try {
        const users = await apiCall('/users');
        const select = document.getElementById('recipient-select');
        
        select.innerHTML = `<option value="">${translations[currentLanguage]['Choose recipient...']}</option>`;
        
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.name} (${user.accountNumber})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Load recipients error:', error);
    }
}

async function transfer(recipientId, amount, description) {
    try {
        showLoading();
        const data = await apiCall('/transfer', {
            method: 'POST',
            body: { recipientId, amount, description }
        });
        
        showToast('Transfer successful!');
        await loadDashboard();
        showScreen('dashboard');
        
        // Reset form
        document.getElementById('transfer-form').reset();
    } catch (error) {
        console.error('Transfer error:', error);
    } finally {
        hideLoading();
    }
}

// Card Functions
async function generateNewCard() {
    try {
        showLoading();
        const data = await apiCall('/generate-card', {
            method: 'POST'
        });
        
        // Update card display
        document.getElementById('card-number').textContent = data.card.number;
        document.getElementById('card-expiry').textContent = data.card.expiry;
        document.getElementById('card-cvv').textContent = data.card.cvv;
        
        showToast('New card generated successfully!');
    } catch (error) {
        console.error('Generate card error:', error);
    } finally {
        hideLoading();
    }
}

// Balance visibility toggle
function toggleBalanceVisibility() {
    balanceVisible = !balanceVisible;
    const icon = document.querySelector('#toggle-balance i');
    
    if (balanceVisible) {
        document.body.classList.remove('balance-hidden');
        icon.className = 'fas fa-eye';
    } else {
        document.body.classList.add('balance-hidden');
        icon.className = 'fas fa-eye-slash';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Language toggle
    document.getElementById('lang-toggle').addEventListener('click', switchLanguage);
    
    // Auth form switches
    document.getElementById('show-signup').addEventListener('click', (e) => {
        e.preventDefault();
        showScreen('signup');
    });
    
    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        showScreen('login');
    });
    
    // Forms
    document.getElementById('signup-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const pin = document.getElementById('signup-pin').value;
        const confirmPin = document.getElementById('confirm-pin').value;
        
        if (pin !== confirmPin) {
            showToast('PINs do not match', 'error');
            return;
        }
        
        if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
            showToast('PIN must be 4 digits', 'error');
            return;
        }
        
        await signup(name, pin);
    });
    
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('login-name').value;
        const pin = document.getElementById('login-pin').value;
        
        await login(name, pin);
    });
    
    document.getElementById('transfer-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const recipientId = document.getElementById('recipient-select').value;
        const amount = parseFloat(document.getElementById('transfer-amount').value);
        const description = document.getElementById('transfer-description').value;
        
        if (!recipientId) {
            showToast('Please select a recipient', 'error');
            return;
        }
        
        if (amount <= 0) {
            showToast('Please enter a valid amount', 'error');
            return;
        }
        
        await transfer(recipientId, amount, description);
    });
    
    // Navigation
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('toggle-balance').addEventListener('click', toggleBalanceVisibility);
    
    // Quick actions
    document.getElementById('transfer-btn').addEventListener('click', async () => {
        await loadRecipients();
        showScreen('transfer');
    });
    
    document.getElementById('cards-btn').addEventListener('click', () => {
        showScreen('cards');
    });
    
    document.getElementById('transactions-btn').addEventListener('click', () => {
        showScreen('transactions');
    });
    
    // Back buttons
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            showScreen(target);
        });
    });
    
    // Generate card button
    document.getElementById('generate-card-btn').addEventListener('click', generateNewCard);
    
    // Initial setup
    updatePageText();
    
    // Check if user is logged in
    if (authToken) {
        loadDashboard().then(() => {
            showScreen('dashboard');
        }).catch(() => {
            localStorage.removeItem('authToken');
            authToken = null;
            showScreen('login');
        });
    } else {
        showScreen('login');
    }
});

// PIN input formatting
document.addEventListener('input', function(e) {
    if (e.target.type === 'password' && e.target.hasAttribute('maxlength')) {
        // Only allow digits for PIN inputs
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    }
});

// Prevent form submission on enter in PIN fields during typing
document.addEventListener('keydown', function(e) {
    if (e.target.type === 'password' && e.key === 'Enter' && e.target.value.length < 4) {
        e.preventDefault();
    }
});