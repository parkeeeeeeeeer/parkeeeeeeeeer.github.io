import React, { useState } from 'react';
import "../css"; // Add your CSS styles
import "../assets"

const LoginPage = () => {
    const [showLoginForm, setShowLoginForm] = useState(false);

    const handleLoginButtonClick = () => {
        setShowLoginForm(!showLoginForm);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const email = event.target.elements['user-email'].value;
        const password = event.target.elements['user-password'].value;

        // You can handle form submission here
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                window.location.href = '/dashboard'; // Redirect to the dashboard
            } else {
                alert('Login failed: ' + (data.message || 'Please try again.'));
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    };

    return (
        <div id="main-container">
            <h1>
                Evaluation Tracker
                <br /><span className="subH1">Detachment 130, Howard University</span>
            </h1>
            
            <p id="logo">
                <img src="det130.png" alt="Detachment 130 Logo" className="logo" />
            </p>
            
            <div className="login-button-container">
                <button className="login-btn" onClick={handleLoginButtonClick}>
                    Login
                </button>
            </div>

            {showLoginForm && (
                <div id="login-form-container">
                    <h2>Login with your Detachment or School Email</h2>
                    <form id="user-login-form" onSubmit={handleSubmit}>
                        <label htmlFor="user-email">Email:</label>
                        <input type="email" id="user-email" name="user-email" placeholder="Enter your email" required />
                        
                        <label htmlFor="user-password">Password:</label>
                        <input type="password" id="user-password" name="user-password" placeholder="Enter your password" required />
                        
                        <button type="submit" className="submit-login-btn">Login</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default LoginPage;
