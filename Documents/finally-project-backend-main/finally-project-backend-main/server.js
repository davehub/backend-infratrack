// server.js (Node.js/Express example)
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your_jwt_secret_key'; // **CHANGE THIS IN PRODUCTION**

app.use(cors());
app.use(express.json());

app.use((req, res) => {
  res.send('API is running');
});

// --- Mock User Database (Replace with a real database) ---
// Note: In a real app, this would be a persistent database
const users = []; // Start with an empty array for new registrations

// Function to generate a unique ID (for mock database)
const generateId = () => users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

// --- API Endpoint for Registration ---
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    // 1. Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        console.log(`Registration failed: User with email ${email} already exists.`);
        return res.status(409).json({ message: 'User already exists' }); // 409 Conflict
    }

    try {
        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create new user and save to mock database
        const newUser = {
            id: generateId(),
            email,
            password: hashedPassword, // Store hashed password
            name: email.split('@')[0] // Simple name from email
        };
        users.push(newUser);
        console.log(`User registered: ${newUser.email}, ID: ${newUser.id}`);

        // 4. Respond with success (do NOT send password back)
        res.status(201).json({ message: 'User registered successfully', user: { id: newUser.id, email: newUser.email, name: newUser.name } });

    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// --- Existing Login Endpoint ---
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`Attempting login for: ${email}`);

    const user = users.find(u => u.email === email);
    if (!user) {
        console.log(`Login failed: User not found for ${email}`);
        return res.status(400).json({ message: 'Invalid credentials' }); // Use a generic message for security
    }

    // Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        console.log(`Login failed: Wrong password for ${email}`);
        return res.status(400).json({ message: 'Invalid credentials' }); // Use a generic message
    }

    // If credentials are valid, generate a JWT
    const token = jwt.sign(
        { id: user.id, email: user.email }, // Payload
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    console.log(`Login successful for: ${user.email}. Token generated.`);
    res.json({ message: 'Login successful', token, user: { id: user.id, email: user.email, name: user.name } });
});


// Optional: Protected Route Example
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.get('/api/dashboard', authenticateToken, (req, res) => {
    res.json({ message: `Welcome to the dashboard, ${req.user.email}! You are authenticated.`, user: req.user });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});