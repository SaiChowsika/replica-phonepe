const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const path = require('path');
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// Hardcoded users in memory
let users = [
  { id: 1, username: "user1", password: "pass1", balance: 1000, transactions: [] },
  { id: 2, username: "user2", password: "pass2", balance: 2000, transactions: [] },
  { id: 3, username: "user3", password: "pass3", balance: 3000, transactions: [] }
];

// Simple login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ message: 'Login successful', userId: user.id });
});

// Check balance
app.get('/balance/:userId', (req, res) => {
  const user = users.find(u => u.id == req.params.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ balance: user.balance });
});

// Send money
app.post('/send', (req, res) => {
  const { fromId, toUsername, amount } = req.body;
  const sender = users.find(u => u.id == fromId);
  const receiver = users.find(u => u.username === toUsername);

  if (!sender || !receiver) return res.status(404).json({ message: 'User not found' });
  if (sender.balance < amount) return res.status(400).json({ message: 'Insufficient funds' });

  sender.balance -= amount;
  receiver.balance += amount;

  sender.transactions.push({ type: 'Sent', amount, to: toUsername });
  receiver.transactions.push({ type: 'Received', amount, from: sender.username });

  res.json({ message: 'Transfer successful' });
});

// Show transactions
app.get('/transactions/:userId', (req, res) => {
  const user = users.find(u => u.id == req.params.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ transactions: user.transactions });
});

// Start server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
