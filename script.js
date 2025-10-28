const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const taskList = document.getElementById('taskList');
const addButton = document.getElementById('addButton');
const clearButton = document.getElementById('clearButton');

const API_URL = 'http://localhost:3001/tasks';

// Load tasks when page loads
loadTasks();

function loadTasks() {
    fetch(API_URL)
        .then(response => response.json())
        .then(tasks => {
            taskList.innerHTML = '';
            tasks.forEach(task => displayTask(task));
        });
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
    
    // Click to edit
    taskSpan.addEventListener('click', function() {
        const newText = prompt('Edit task:', task.text);
        if (newText && newText.trim() !== '') {
            fetch(`${API_URL}/${task.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
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
    // Update the visual style
    if (checkbox.checked) {
        taskSpan.style.textDecoration = 'line-through';
        taskSpan.style.color = '#888';
    } else {
        taskSpan.style.textDecoration = 'none';
        taskSpan.style.color = 'black';
    }
    
    // Save to backend
    fetch(`${API_URL}/${task.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed: checkbox.checked })
    });
});
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.style.marginLeft = '10px';
    deleteBtn.style.backgroundColor = '#f44336';
    
    deleteBtn.addEventListener('click', function() {
        fetch(`${API_URL}/${task.id}`, {
            method: 'DELETE'
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
                'Content-Type': 'application/json'
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
            method: 'DELETE'
        })
        .then(() => {
            taskList.innerHTML = '';
        });
    }
});