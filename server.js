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
    const newUser = {
      id: users.length + 1,
      name,
      pin: hashedPin,
      accountNumber: generateAccountNumber(),
      balance: Math.floor(Math.random() * 50000) + 10000, // Random balance between 10k-60k
      cardNumber: generateCardNumber(),
      cardExpiry: '12/28',
      cardCvv: Math.floor(100 + Math.random() * 900).toString(),
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeUsers(users);

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

    // Update balances
    sender.balance -= amount;
    recipient.balance += amount;
    writeUsers(users);

    // Create transaction records
    const transactions = readTransactions();
    const transactionId = transactions.length + 1;
    const date = new Date().toISOString();

    const senderTransaction = {
      id: transactionId,
      userId: sender.id,
      type: 'transfer_out',
      amount: -amount,
      recipient: recipient.name,
      description: description || 'Money Transfer',
      date,
      balance: sender.balance
    };

    const recipientTransaction = {
      id: transactionId + 1,
      userId: recipient.id,
      type: 'transfer_in',
      amount: amount,
      sender: sender.name,
      description: description || 'Money Transfer',
      date,
      balance: recipient.balance
    };

    transactions.push(senderTransaction, recipientTransaction);
    writeTransactions(transactions);

    res.json({
      message: 'Transfer successful',
      transaction: senderTransaction,
      newBalance: sender.balance
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

app.listen(PORT, () => {
  console.log(`NSG Bank server running on port ${PORT}`);
});