const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

const JWT_SECRET = 'your-secret-key-change-this-in-production'; // We'll use environment variables later
const USERS_FILE = path.join(__dirname, 'users.json');

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

// Load users from file
let users = [];
if (fs.existsSync(USERS_FILE)) {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    users = JSON.parse(data);
}

// Function to save users to file
function saveUsers() {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// SIGNUP - Create new user
app.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check if user already exists
        const existingUser = users.find(u => u.username === username);
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = {
            id: Date.now(),
            username: username,
            password: hashedPassword
        };
        
        users.push(newUser);
        saveUsers();
        
        // Create JWT token
        const token = jwt.sign({ userId: newUser.id, username: newUser.username }, JWT_SECRET);
        
        res.json({ token, username: newUser.username });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// LOGIN - Authenticate user
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user
        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        
        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        
        // Create JWT token
        const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET);
        
        res.json({ token, username: user.username });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied' });
    }
    
    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token' });
    }
}

// GET all tasks for logged-in user
app.get('/tasks', authenticateToken, (req, res) => {
    const userTasks = tasks.filter(task => task.userId === req.user.userId);
    res.json(userTasks);
});

// POST a new task for logged-in user
app.post('/tasks', authenticateToken, (req, res) => {
    const newTask = {
        id: Date.now(),
        text: req.body.text,
        completed: false,
        priority: req.body.priority || 'medium',
        userId: req.user.userId  // Associate with user
    };
    tasks.push(newTask);
    saveTasks();
    res.json(newTask);
});

// UPDATE a task
app.put('/tasks/:id', authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    const task = tasks.find(t => t.id === id && t.userId === req.user.userId);
    
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

// DELETE a task
app.delete('/tasks/:id', authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    const initialLength = tasks.length;
    tasks = tasks.filter(task => !(task.id === id && task.userId === req.user.userId));
    
    if (tasks.length < initialLength) {
        saveTasks();
        res.json({ message: 'Task deleted' });
    } else {
        res.status(404).json({ error: 'Task not found' });
    }
});

// DELETE all tasks for logged-in user
app.delete('/tasks', authenticateToken, (req, res) => {
    tasks = tasks.filter(task => task.userId !== req.user.userId);
    saveTasks();
    res.json({ message: 'All tasks cleared' });
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
