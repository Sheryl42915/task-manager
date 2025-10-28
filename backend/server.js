const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Path to store tasks
const TASKS_FILE = path.join(__dirname, 'tasks.json');

// Load tasks from file when server starts
let tasks = [];
if (fs.existsSync(TASKS_FILE)) {
    const data = fs.readFileSync(TASKS_FILE, 'utf8');
    tasks = JSON.parse(data);
}

// Function to save tasks to file
function saveTasks() {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

// GET all tasks
app.get('/tasks', (req, res) => {
    res.json(tasks);
});

// POST a new task
app.post('/tasks', (req, res) => {
    const newTask = {
        id: Date.now(),
        text: req.body.text,
        completed: false,
        priority: req.body.priority || 'medium' 
    };
    tasks.push(newTask);
    saveTasks();
    res.json(newTask);
});

// DELETE a task
app.delete('/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    res.json({ message: 'Task deleted' });
});

// DELETE all tasks
app.delete('/tasks', (req, res) => {
    tasks = [];
    saveTasks();
    res.json({ message: 'All tasks cleared' });
});

// UPDATE a task
app.put('/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const task = tasks.find(t => t.id === id);
    
    if (task) {
        task.text = req.body.text || task.text;
        task.priority = req.body.priority || task.priority;
        task.completed = req.body.completed !== undefined ? req.body.completed : task.completed;
        saveTasks();
        res.json(task);
    } else {
        res.status(404).json({ error: 'Task not found' });
    }
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
