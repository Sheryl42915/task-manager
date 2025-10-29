const API_URL = 'https://task-manager-3q9m.onrender.com';

document.getElementById('signupBtn').addEventListener('click', async function() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorMsg = document.getElementById('error');
    
    if (!username || !password || !confirmPassword) {
        errorMsg.textContent = 'Please fill in all fields';
        return;
    }
    
    if (password !== confirmPassword) {
        errorMsg.textContent = 'Passwords do not match';
        return;
    }
    
    if (password.length < 6) {
        errorMsg.textContent = 'Password must be at least 6 characters';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Save token to localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            // Redirect to main app
            window.location.href = 'index.html';
        } else {
            errorMsg.textContent = data.error || 'Signup failed';
        }
    } catch (error) {
        errorMsg.textContent = 'Server error. Please try again.';
    }
});