const API_URL = 'https://task-manager-3q9m.onrender.com';

document.getElementById('loginBtn').addEventListener('click', async function() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error');
    
    if (!username || !password) {
        errorMsg.textContent = 'Please fill in all fields';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/login`, {
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
            errorMsg.textContent = data.error || 'Login failed';
        }
    } catch (error) {
        errorMsg.textContent = 'Server error. Please try again.';
    }
});