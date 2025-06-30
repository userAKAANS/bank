const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'nsg-bank-secret-key';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Database file paths
const USERS_FILE = './data/users.json';
const TRANSACTIONS_FILE = './data/transactions.json';

// Ensure data directory exists
if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data');
}

// Initialize database files
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

if (!fs.existsSync(TRANSACTIONS_FILE)) {
  fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify([]));
}

// Helper functions
const readUsers = () => {
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
};

const writeUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

const readTransactions = () => {
  return JSON.parse(fs.readFileSync(TRANSACTIONS_FILE, 'utf8'));
};

const writeTransactions = (transactions) => {
  fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2));
};

const generateAccountNumber = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

const generateCardNumber = () => {
  return Array.from({length: 4}, () => 
    Math.floor(1000 + Math.random() * 9000)
  ).join(' ');
};

const generateIBAN = () => {
  const countryCode = 'SA';
  const checkDigits = Math.floor(10 + Math.random() * 89);
  const bankCode = '80';
  const accountNumber = Math.floor(100000000000000000 + Math.random() * 900000000000000000).toString();
  return `${countryCode}${checkDigits}${bankCode}${accountNumber}`;
};

const generateTransactionRef = () => {
  return 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
};

const addInitialTransactions = (userId, userName, balance) => {
  const transactions = readTransactions();
  const currentTransactions = transactions.filter(t => t.userId === userId);
  
  if (currentTransactions.length === 0) {
    // Add some initial fake transactions
    const initialTransactions = [
      {
        id: transactions.length + 1,
        userId: userId,
        type: 'deposit',
        amount: balance * 0.7,
        description: 'Initial Deposit',
        category: 'deposit',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        reference: generateTransactionRef(),
        balance: balance * 0.7
      },
      {
        id: transactions.length + 2,
        userId: userId,
        type: 'transfer_in',
        amount: balance * 0.2,
        sender: 'NSG Bank',
        description: 'Welcome Bonus',
        category: 'bonus',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        reference: generateTransactionRef(),
        balance: balance * 0.9
      },
      {
        id: transactions.length + 3,
        userId: userId,
        type: 'payment',
        amount: -150,
        merchant: 'Online Store',
        description: 'Online Purchase',
        category: 'shopping',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        reference: generateTransactionRef(),
        balance: balance * 0.9 - 150
      },
      {
        id: transactions.length + 4,
        userId: userId,
        type: 'transfer_in',
        amount: balance * 0.1 + 150,
        sender: 'Family Transfer',
        description: 'Monthly Allowance',
        category: 'family',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        reference: generateTransactionRef(),
        balance: balance
      }
    ];
    
    transactions.push(...initialTransactions);
    writeTransactions(transactions);
  }
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Signup
app.post('/api/signup', async (req, res) => {
  try {
    const { name, pin } = req.body;

    if (!name || !pin) {
      return res.status(400).json({ error: 'Name and PIN are required' });
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ error: 'PIN must be 4 digits' });
    }

    const users = readUsers();
    
    // Check if user already exists
    if (users.find(user => user.name.toLowerCase() === name.toLowerCase())) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash PIN
    const hashedPin = await bcrypt.hash(pin, 10);

    // Create new user
    const balance = Math.floor(Math.random() * 50000) + 10000; // Random balance between 10k-60k
    const newUser = {
      id: users.length + 1,
      name,
      pin: hashedPin,
      accountNumber: generateAccountNumber(),
      iban: generateIBAN(),
      balance: balance,
      cardNumber: generateCardNumber(),
      cardExpiry: '12/28',
      cardCvv: Math.floor(100 + Math.random() * 900).toString(),
      phoneNumber: '+966' + Math.floor(500000000 + Math.random() * 100000000),
      email: name.toLowerCase().replace(/\s+/g, '.') + '@email.com',
      accountType: 'Current Account',
      branchCode: 'NSG001',
      isActive: true,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      monthlyLimit: 100000,
      dailyLimit: 10000,
      settings: {
        notifications: true,
        biometric: false,
        smsAlerts: true,
        emailAlerts: true
      }
    };

    users.push(newUser);
    writeUsers(users);
    
    // Add initial transaction history
    addInitialTransactions(newUser.id, newUser.name, balance);

    // Generate token
    const token = jwt.sign(
      { id: newUser.id, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        accountNumber: newUser.accountNumber,
        balance: newUser.balance
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { name, pin } = req.body;

    if (!name || !pin) {
      return res.status(400).json({ error: 'Name and PIN are required' });
    }

    const users = readUsers();
    const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const validPin = await bcrypt.compare(pin, user.pin);
    if (!validPin) {
      return res.status(400).json({ error: 'Invalid PIN' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        accountNumber: user.accountNumber,
        balance: user.balance
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user dashboard data
app.get('/api/dashboard', authenticateToken, (req, res) => {
  try {
    const users = readUsers();
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const transactions = readTransactions();
    const userTransactions = transactions
      .filter(t => t.userId === user.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10); // Last 10 transactions

    res.json({
      user: {
        name: user.name,
        accountNumber: user.accountNumber,
        balance: user.balance
      },
      transactions: userTransactions,
      card: {
        number: user.cardNumber,
        expiry: user.cardExpiry,
        cvv: user.cardCvv
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users for transfer (names only)
app.get('/api/users', authenticateToken, (req, res) => {
  try {
    const users = readUsers();
    const userList = users
      .filter(u => u.id !== req.user.id)
      .map(u => ({ id: u.id, name: u.name, accountNumber: u.accountNumber }));

    res.json(userList);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Transfer money
app.post('/api/transfer', authenticateToken, (req, res) => {
  try {
    const { recipientId, amount, description } = req.body;

    if (!recipientId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid recipient and amount required' });
    }

    const users = readUsers();
    const sender = users.find(u => u.id === req.user.id);
    const recipient = users.find(u => u.id === parseInt(recipientId));

    if (!sender || !recipient) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    if (amount > sender.dailyLimit) {
      return res.status(400).json({ error: 'Amount exceeds daily limit' });
    }

    // Update balances
    sender.balance -= amount;
    recipient.balance += amount;
    writeUsers(users);

    // Create transaction records
    const transactions = readTransactions();
    const transactionId = transactions.length + 1;
    const date = new Date().toISOString();
    const reference = generateTransactionRef();

    const senderTransaction = {
      id: transactionId,
      userId: sender.id,
      type: 'transfer_out',
      amount: -amount,
      recipient: recipient.name,
      recipientAccount: recipient.accountNumber,
      description: description || 'Money Transfer',
      category: 'transfer',
      reference: reference,
      status: 'completed',
      date,
      balance: sender.balance
    };

    const recipientTransaction = {
      id: transactionId + 1,
      userId: recipient.id,
      type: 'transfer_in',
      amount: amount,
      sender: sender.name,
      senderAccount: sender.accountNumber,
      description: description || 'Money Transfer',
      category: 'transfer',
      reference: reference,
      status: 'completed',
      date,
      balance: recipient.balance
    };

    transactions.push(senderTransaction, recipientTransaction);
    writeTransactions(transactions);

    res.json({
      message: 'Transfer successful',
      transaction: senderTransaction,
      newBalance: sender.balance,
      reference: reference
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get account statements/reports
app.get('/api/statements', authenticateToken, (req, res) => {
  try {
    const { period = '30' } = req.query;
    const users = readUsers();
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const transactions = readTransactions();
    const daysAgo = parseInt(period);
    const fromDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    
    const userTransactions = transactions
      .filter(t => t.userId === user.id && new Date(t.date) >= fromDate)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalIncome = userTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = userTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    res.json({
      period: `${period} days`,
      totalTransactions: userTransactions.length,
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
      transactions: userTransactions,
      accountInfo: {
        name: user.name,
        accountNumber: user.accountNumber,
        iban: user.iban,
        currentBalance: user.balance
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Bill payments
app.post('/api/pay-bill', authenticateToken, (req, res) => {
  try {
    const { billType, amount, accountNumber, description } = req.body;

    if (!billType || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid bill type and amount required' });
    }

    const users = readUsers();
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Update balance
    user.balance -= amount;
    writeUsers(users);

    // Create transaction record
    const transactions = readTransactions();
    const transaction = {
      id: transactions.length + 1,
      userId: user.id,
      type: 'bill_payment',
      amount: -amount,
      billType,
      accountNumber: accountNumber || 'N/A',
      description: description || `${billType} Bill Payment`,
      category: 'bills',
      reference: generateTransactionRef(),
      status: 'completed',
      date: new Date().toISOString(),
      balance: user.balance
    };

    transactions.push(transaction);
    writeTransactions(transactions);

    res.json({
      message: 'Bill payment successful',
      transaction,
      newBalance: user.balance
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user settings
app.get('/api/settings', authenticateToken, (req, res) => {
  try {
    const users = readUsers();
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      settings: user.settings,
      limits: {
        daily: user.dailyLimit,
        monthly: user.monthlyLimit
      },
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phoneNumber,
        accountType: user.accountType,
        branchCode: user.branchCode
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user settings
app.put('/api/settings', authenticateToken, (req, res) => {
  try {
    const { settings, limits } = req.body;
    const users = readUsers();
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (settings) {
      user.settings = { ...user.settings, ...settings };
    }

    if (limits) {
      if (limits.daily && limits.daily > 0) user.dailyLimit = limits.daily;
      if (limits.monthly && limits.monthly > 0) user.monthlyLimit = limits.monthly;
    }

    writeUsers(users);

    res.json({
      message: 'Settings updated successfully',
      settings: user.settings,
      limits: {
        daily: user.dailyLimit,
        monthly: user.monthlyLimit
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate new card
app.post('/api/generate-card', authenticateToken, (req, res) => {
  try {
    const users = readUsers();
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new card details
    user.cardNumber = generateCardNumber();
    user.cardExpiry = '12/28';
    user.cardCvv = Math.floor(100 + Math.random() * 900).toString();

    writeUsers(users);

    res.json({
      message: 'New card generated successfully',
      card: {
        number: user.cardNumber,
        expiry: user.cardExpiry,
        cvv: user.cardCvv
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`NSG Bank server running on port ${PORT}`);
});