// Global state
let currentUser = null;
let currentLanguage = 'en';
let balanceVisible = true;
let authToken = localStorage.getItem('authToken');
let allTransactions = [];
let currentBillType = null;

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
        'Sent to': 'Sent to',
        'Bills': 'Bills',
        'Reports': 'Reports',
        'Settings': 'Settings',
        'Pay Bills': 'Pay Bills',
        'Account Reports': 'Account Reports',
        'All': 'All',
        'Transfers': 'Transfers',
        'Deposits': 'Deposits',
        'Electricity': 'Electricity',
        'Water': 'Water',
        'Internet': 'Internet',
        'Mobile': 'Mobile',
        'Gas': 'Gas',
        'Insurance': 'Insurance',
        'Account Number': 'Account Number',
        'Pay Bill': 'Pay Bill',
        'Cancel': 'Cancel',
        'Select Period': 'Select Period',
        'Last 7 days': 'Last 7 days',
        'Last 30 days': 'Last 30 days',
        'Last 3 months': 'Last 3 months',
        'Last year': 'Last year',
        'Generate Report': 'Generate Report',
        'Financial Summary': 'Financial Summary',
        'Total Income': 'Total Income',
        'Total Expenses': 'Total Expenses',
        'Net Amount': 'Net Amount',
        'Total Transactions': 'Total Transactions',
        'Account Information': 'Account Information',
        'Account Number:': 'Account Number:',
        'IBAN:': 'IBAN:',
        'Current Balance:': 'Current Balance:',
        'Profile Information': 'Profile Information',
        'Name:': 'Name:',
        'Email:': 'Email:',
        'Phone:': 'Phone:',
        'Account Type:': 'Account Type:',
        'Transaction Limits': 'Transaction Limits',
        'Daily Limit:': 'Daily Limit:',
        'Monthly Limit:': 'Monthly Limit:',
        'Notifications': 'Notifications',
        'SMS Alerts': 'SMS Alerts',
        'Email Alerts': 'Email Alerts',
        'Push Notifications': 'Push Notifications',
        'Security': 'Security',
        'Change PIN': 'Change PIN',
        'Biometric Login': 'Biometric Login'
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
        'Sent to': 'مُرسل إلى',
        'Bills': 'الفواتير',
        'Reports': 'التقارير',
        'Settings': 'الإعدادات',
        'Pay Bills': 'دفع الفواتير',
        'Account Reports': 'تقارير الحساب',
        'All': 'الكل',
        'Transfers': 'التحويلات',
        'Deposits': 'الإيداعات',
        'Electricity': 'الكهرباء',
        'Water': 'المياه',
        'Internet': 'الإنترنت',
        'Mobile': 'الجوال',
        'Gas': 'الغاز',
        'Insurance': 'التأمين',
        'Account Number': 'رقم الحساب',
        'Pay Bill': 'دفع الفاتورة',
        'Cancel': 'إلغاء',
        'Select Period': 'اختر الفترة',
        'Last 7 days': 'آخر 7 أيام',
        'Last 30 days': 'آخر 30 يوم',
        'Last 3 months': 'آخر 3 أشهر',
        'Last year': 'آخر سنة',
        'Generate Report': 'إنشاء التقرير',
        'Financial Summary': 'الملخص المالي',
        'Total Income': 'إجمالي الدخل',
        'Total Expenses': 'إجمالي المصروفات',
        'Net Amount': 'المبلغ الصافي',
        'Total Transactions': 'إجمالي المعاملات',
        'Account Information': 'معلومات الحساب',
        'Account Number:': 'رقم الحساب:',
        'IBAN:': 'الآيبان:',
        'Current Balance:': 'الرصيد الحالي:',
        'Profile Information': 'معلومات الملف الشخصي',
        'Name:': 'الاسم:',
        'Email:': 'البريد الإلكتروني:',
        'Phone:': 'الهاتف:',
        'Account Type:': 'نوع الحساب:',
        'Transaction Limits': 'حدود المعاملات',
        'Daily Limit:': 'الحد اليومي:',
        'Monthly Limit:': 'الحد الشهري:',
        'Notifications': 'الإشعارات',
        'SMS Alerts': 'تنبيهات الرسائل',
        'Email Alerts': 'تنبيهات البريد',
        'Push Notifications': 'الإشعارات المباشرة',
        'Security': 'الأمان',
        'Change PIN': 'تغيير الرقم السري',
        'Biometric Login': 'تسجيل الدخول بالبصمة'
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
    transactions: document.getElementById('transactions-screen'),
    bills: document.getElementById('bills-screen'),
    statements: document.getElementById('statements-screen'),
    settings: document.getElementById('settings-screen')
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
    allTransactions = transactions;
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
    
    renderTransactions(transactions.slice(0, 5), transactionsList);
    renderTransactions(transactions, fullTransactionsList);
}

function renderTransactions(transactions, container) {
    const transactionHTML = transactions.map(transaction => {
        const isPositive = transaction.amount > 0;
        const amountClass = isPositive ? 'positive' : 'negative';
        const category = transaction.category || 'transfer';
        
        let title, subtitle;
        if (transaction.type === 'transfer_in') {
            title = transaction.description || translations[currentLanguage]['Money Transfer'];
            subtitle = `${translations[currentLanguage]['Received from']} ${transaction.sender}`;
        } else if (transaction.type === 'transfer_out') {
            title = transaction.description || translations[currentLanguage]['Money Transfer'];
            subtitle = `${translations[currentLanguage]['Sent to']} ${transaction.recipient}`;
        } else if (transaction.type === 'bill_payment') {
            title = transaction.description || `${transaction.billType} Bill`;
            subtitle = transaction.accountNumber;
        } else {
            title = transaction.description;
            subtitle = transaction.merchant || transaction.sender || '';
        }
        
        return `
            <div class="transaction-item ${category}">
                <div class="transaction-info">
                    <h4>${title}</h4>
                    <p>${subtitle}</p>
                    ${transaction.reference ? `<div class="transaction-reference">${transaction.reference}</div>` : ''}
                </div>
                <div class="transaction-amount ${amountClass}">
                    <div class="amount">${formatCurrency(Math.abs(transaction.amount))}</div>
                    <div class="date">${formatDate(transaction.date)}</div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = transactionHTML;
}

function filterTransactions(category) {
    if (category === 'all') {
        renderTransactions(allTransactions, document.getElementById('full-transactions-list'));
    } else {
        const filtered = allTransactions.filter(t => t.category === category || t.type.includes(category));
        renderTransactions(filtered, document.getElementById('full-transactions-list'));
    }
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

// Bill Payment Functions
function showBillPaymentForm(billType) {
    currentBillType = billType;
    const billCategories = document.querySelector('.bill-categories');
    const billForm = document.getElementById('bill-payment-form');
    const billTitle = document.getElementById('bill-title');
    
    billCategories.classList.add('hidden');
    billForm.classList.remove('hidden');
    billTitle.textContent = `${translations[currentLanguage][billType.charAt(0).toUpperCase() + billType.slice(1)]} ${translations[currentLanguage]['Pay Bill']}`;
}

function hideBillPaymentForm() {
    const billCategories = document.querySelector('.bill-categories');
    const billForm = document.getElementById('bill-payment-form');
    
    billCategories.classList.remove('hidden');
    billForm.classList.add('hidden');
    billForm.reset();
    currentBillType = null;
}

async function payBill(billType, accountNumber, amount, description) {
    try {
        showLoading();
        const data = await apiCall('/pay-bill', {
            method: 'POST',
            body: { billType, accountNumber, amount, description }
        });
        
        showToast('Bill payment successful!');
        await loadDashboard();
        showScreen('dashboard');
        hideBillPaymentForm();
    } catch (error) {
        console.error('Bill payment error:', error);
    } finally {
        hideLoading();
    }
}

// Reports Functions
async function generateReport(period) {
    try {
        showLoading();
        const data = await apiCall(`/statements?period=${period}`);
        
        // Update summary data
        document.getElementById('total-income').textContent = formatCurrency(data.totalIncome);
        document.getElementById('total-expenses').textContent = formatCurrency(data.totalExpenses);
        document.getElementById('net-amount').textContent = formatCurrency(data.netAmount);
        document.getElementById('total-transactions').textContent = data.totalTransactions;
        
        // Update account information
        document.getElementById('report-account-number').textContent = data.accountInfo.accountNumber;
        document.getElementById('report-iban').textContent = data.accountInfo.iban;
        document.getElementById('report-balance').textContent = formatCurrency(data.accountInfo.currentBalance);
        
        // Set net amount color
        const netAmountElement = document.getElementById('net-amount');
        netAmountElement.className = 'value ' + (data.netAmount >= 0 ? 'positive' : 'negative');
        
        // Show report summary
        document.getElementById('report-summary').classList.remove('hidden');
        
        showToast('Report generated successfully!');
    } catch (error) {
        console.error('Generate report error:', error);
    } finally {
        hideLoading();
    }
}

// Settings Functions
async function loadSettings() {
    try {
        const data = await apiCall('/settings');
        
        // Update profile information
        document.getElementById('profile-name').textContent = data.profile.name;
        document.getElementById('profile-email').textContent = data.profile.email;
        document.getElementById('profile-phone').textContent = data.profile.phone;
        document.getElementById('profile-account-type').textContent = data.profile.accountType;
        
        // Update limits
        document.getElementById('daily-limit').textContent = formatCurrency(data.limits.daily);
        document.getElementById('monthly-limit').textContent = formatCurrency(data.limits.monthly);
        
        // Update settings toggles
        document.getElementById('sms-alerts').checked = data.settings.smsAlerts;
        document.getElementById('email-alerts').checked = data.settings.emailAlerts;
        document.getElementById('push-notifications').checked = data.settings.notifications;
        
    } catch (error) {
        console.error('Load settings error:', error);
    }
}

async function updateSettings(settings) {
    try {
        await apiCall('/settings', {
            method: 'PUT',
            body: { settings }
        });
        
        showToast('Settings updated successfully!');
    } catch (error) {
        console.error('Update settings error:', error);
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
    
    document.getElementById('bills-btn').addEventListener('click', () => {
        showScreen('bills');
    });
    
    document.getElementById('transactions-btn').addEventListener('click', () => {
        showScreen('transactions');
    });
    
    document.getElementById('statements-btn').addEventListener('click', () => {
        showScreen('statements');
    });
    
    document.getElementById('settings-btn').addEventListener('click', async () => {
        await loadSettings();
        showScreen('settings');
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
    
    // Filter tabs for transactions
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            filterTransactions(tab.dataset.filter);
        });
    });
    
    // Bill categories
    document.querySelectorAll('.bill-category').forEach(category => {
        category.addEventListener('click', () => {
            showBillPaymentForm(category.dataset.bill);
        });
    });
    
    // Bill payment form
    document.getElementById('bill-payment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const accountNumber = document.getElementById('bill-account-number').value;
        const amount = parseFloat(document.getElementById('bill-amount').value);
        const description = document.getElementById('bill-description').value;
        
        if (!accountNumber || amount <= 0) {
            showToast('Please enter valid account number and amount', 'error');
            return;
        }
        
        await payBill(currentBillType, accountNumber, amount, description);
    });
    
    document.getElementById('cancel-bill').addEventListener('click', hideBillPaymentForm);
    
    // Generate report
    document.getElementById('generate-report').addEventListener('click', async () => {
        const period = document.getElementById('period-select').value;
        await generateReport(period);
    });
    
    // Settings toggles
    document.getElementById('sms-alerts').addEventListener('change', async (e) => {
        await updateSettings({ smsAlerts: e.target.checked });
    });
    
    document.getElementById('email-alerts').addEventListener('change', async (e) => {
        await updateSettings({ emailAlerts: e.target.checked });
    });
    
    document.getElementById('push-notifications').addEventListener('change', async (e) => {
        await updateSettings({ notifications: e.target.checked });
    });
    
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