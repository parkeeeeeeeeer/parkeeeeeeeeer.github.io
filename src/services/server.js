const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Optional for secure login
const mysql = require('mysql2');

// Create an Express app
const app = express();
app.use(express.json()); // Parse JSON bodies

// MySQL database connection
const db = mysql.createConnection({
    host: 'localhost', // Your MySQL host
    user: 'your_mysql_user',
    password: 'your_mysql_password',
    database: 'rotc_management' // Your database name
});

// Connect to MySQL
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database!');
});

// POST route to handle login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Query the database for the user
    const query = 'SELECT * FROM cadets WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            return res.status(400).json({ message: 'User not found' });
        }

        const user = results[0];

        // Compare the hashed password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;

            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // If password is correct, return the user’s role and generate a token (optional)
            const token = jwt.sign({ id: user.id, role: user.access_level }, 'your_jwt_secret', { expiresIn: '1h' });

            // Send role and token (optional) to the frontend
            return res.status(200).json({
                message: 'Login successful',
                role: user.access_level,
                token: token // Optional if you're using JWT for protected routes
            });
        });
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
