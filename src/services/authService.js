const bcrypt = require('bcrypt');
const db = require('./db');  // Example: Your DB connection or query utility

async function signupCadet(firstName, lastName, email, plainPassword) {
    const saltRounds = 10;
    try {
        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

        // Now insert the cadet into the database
        const insertCadetQuery = `
            INSERT INTO cadets (first_name, last_name, username, email, password_hash, access_level)
            VALUES ($1, $2, $3, $4, $5, 'POC')`;

        await db.query(insertCadetQuery, [firstName, lastName, `C/${lastName}, ${firstName[0]}`, email, hashedPassword]);

        console.log("Cadet registered successfully");
    } catch (error) {
        console.error("Error during signup:", error);
    }
}

async function login(email, enteredPassword) {
    try {
        // Get the stored password hash
        const query = `SELECT password_hash FROM cadets WHERE email = $1`;
        const result = await db.query(query, [email]);

        if (result.rows.length > 0) {
            const storedHash = result.rows[0].password_hash;

            // Compare the entered password with the stored hash
            const match = await bcrypt.compare(enteredPassword, storedHash);

            if (match) {
                console.log("Login successful");
                return true;
            } else {
                console.log("Invalid password");
                return false;
            }
        } else {
            console.log("Cadet not found");
            return false;
        }
    } catch (error) {
        console.error("Error during login:", error);
        return false;
    }
}

module.exports = {
    signupCadet,
    login,
};
