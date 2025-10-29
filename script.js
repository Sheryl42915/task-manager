const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const taskList = document.getElementById('taskList');
const addButton = document.getElementById('addButton');
const clearButton = document.getElementById('clearButton');

const API_URL = 'https://task-manager-3q9m.onrender.com/tasks';

// Check if user is logged in
const token = localStorage.getItem('token');
const username = localStorage.getItem('username');

if (!token) {
    // Redirect to login if not logged in
    window.location.href = 'login.html';
}

// Display username and logout button
const h1 = document.querySelector('h1');
h1.innerHTML = `✓ Task Manager <small style="font-size: 0.5em;">- ${username}</small> <button id="logoutBtn" style="font-size: 0.4em; margin-left: 10px;">Logout</button>`;

document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
});

// Load tasks when page loads
loadTasks();

function loadTasks() {
    fetch(API_URL, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            if (response.status === 401) {
                // Token invalid, redirect to login
                localStorage.removeItem('token');
                window.location.href = 'login.html';
                return;
            }
            return response.json();
        })
        .then(tasks => {
            if (tasks) {
                taskList.innerHTML = '';
                tasks.forEach(task => displayTask(task));
            }
        })
        .catch(error => console.error('Error loading tasks:', error));
}

function displayTask(task) {
    const li = document.createElement('li');
    li.className = `priority-${task.priority}`;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.style.marginRight = '10px';
    
    const taskSpan = document.createElement('span');
    taskSpan.textContent = task.text;
    taskSpan.style.cursor = 'pointer';
    taskSpan.title = 'Click to edit';
    
    if (task.completed) {
        taskSpan.style.textDecoration = 'line-through';
        taskSpan.style.color = '#888';
    }
    
    taskSpan.addEventListener('click', function() {
        const newText = prompt('Edit task:', task.text);
        if (newText && newText.trim() !== '') {
            fetch(`https://task-manager-3q9m.onrender.com/tasks/${task.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text: newText })
            })
            .then(response => response.json())
            .then(updatedTask => {
                taskSpan.textContent = updatedTask.text;
            });
        }
    });
    
    checkbox.addEventListener('change', function() {
        if (checkbox.checked) {
            taskSpan.style.textDecoration = 'line-through';
            taskSpan.style.color = '#888';
        } else {
            taskSpan.style.textDecoration = 'none';
            taskSpan.style.color = 'black';
        }
        
        fetch(`https://task-manager-3q9m.onrender.com/tasks/${task.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ completed: checkbox.checked })
        });
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.style.marginLeft = '10px';
    deleteBtn.style.backgroundColor = '#f44336';
    
    deleteBtn.addEventListener('click', function() {
        fetch(`https://task-manager-3q9m.onrender.com/tasks/${task.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(() => {
            li.remove();
        });
    });
    
    li.appendChild(checkbox);
    li.appendChild(taskSpan);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
}

addButton.addEventListener('click', function() {
    const taskText = taskInput.value;
    const priority = prioritySelect.value;
    
    if (taskText.trim() !== '') {
        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                text: taskText,
                priority: priority
            })
        })
        .then(response => response.json())
        .then(task => {
            displayTask(task);
            taskInput.value = '';
            prioritySelect.value = 'medium';
        });
    }
});

clearButton.addEventListener('click', function() {
    if (confirm('Are you sure you want to delete all tasks?')) {
        fetch(API_URL, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(() => {
            taskList.innerHTML = '';
        });
    }
});