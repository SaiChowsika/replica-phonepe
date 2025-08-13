const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname));

let users = [
    { username: "user1", password: "pass1", balance: 5000, transactions: [] },
    { username: "user2", password: "pass2", balance: 3000, transactions: [] },
    { username: "user3", password: "pass3", balance: 7000, transactions: [] }
];

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(
        u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
    }
    res.json(user);
});

app.post("/sendMoney", (req, res) => {
    const { fromUser, toUser, amount } = req.body;
    const sender = users.find(u => u.username === fromUser);
    const receiver = users.find(u => u.username === toUser);

    // Check if user is sending money to themselves
    if (fromUser === toUser) {
        return res.status(400).json({ message: "You cannot send money to yourself." });
    }

    if (!sender || !receiver) {
        return res.status(404).json({ message: "User not found" });
    }
    if (sender.balance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
    }

    sender.balance -= amount;
    receiver.balance += amount;

    sender.transactions.push(`Sent ₹${amount} to ${toUser}`);
    receiver.transactions.push(`Received ₹${amount} from ${fromUser}`);

    res.json({ message: "Transaction successful", balance: sender.balance, transactions: sender.transactions });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
