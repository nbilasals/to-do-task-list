// Wait for page to load
document.addEventListener('DOMContentLoaded', function() {
    console.log(' Todo App loaded successfully!');
    
    // Get DOM elements
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const dateInput = document.getElementById('dateInput');
    const taskList = document.getElementById('taskList');
    
    // Check if elements are found
    if (!taskForm || !taskInput || !taskList) {
        console.error(' Required elements not found!');
        return;
    }
    
    console.log(' All elements found:', { taskForm, taskInput, taskList });
    
    // Array to store tasks
    let tasks = [];
    
    // Load tasks from localStorage on page load
    loadTasksFromStorage();
    
    // Set today's date as default
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
    
    // Handle form submission
    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log(' Form submitted!');
        
        const taskText = taskInput.value.trim();
        const taskDate = dateInput.value;
        
        // Validation
        if (!taskText) {
            alert(' Please enter a task!');
            taskInput.focus();
            return;
        }
        
        // Create new task object
        const newTask = {
            id: Date.now(),
            text: taskText,
            date: taskDate,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        // Add task to array
        tasks.push(newTask);
        console.log(' Task added:', newTask);
        console.log(' Current tasks:', tasks);
        
        // Save to localStorage
        saveTasksToStorage();
        
        // Clear form
        taskInput.value = '';
        dateInput.value = new Date().toISOString().split('T')[0];
        taskInput.focus();
        
        // Update display
        displayTasks();
        
        // Show success feedback
        showNotification(' Task added successfully!', 'success');
    });
    
    // Function to display tasks
    function displayTasks() {
        console.log(' Displaying tasks...');
        
        // Update task count in header
        updateTaskCounter();
        
        // Clear current display
        taskList.innerHTML = '';
        
        if (tasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <p> No tasks yet. Add your first task above!</p>
                </div>
            `;
            return;
        }
        
        // Sort tasks: incomplete first, then by date
        const sortedTasks = [...tasks].sort((a, b) => {
            // Incomplete tasks first
            if (a.completed !== b.completed) {
                return a.completed - b.completed;
            }
            // Then sort by date (earliest first)
            if (a.date && b.date) {
                return new Date(a.date) - new Date(b.date);
            }
            // Tasks with dates come first
            if (a.date && !b.date) return -1;
            if (!a.date && b.date) return 1;
            // Finally by creation time
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        // Generate HTML for each task
        sortedTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            taskList.appendChild(taskElement);
        });
        
        console.log(` Displayed ${tasks.length} tasks`);
    }
    
    // Function to create task element
    function createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-item';
        taskDiv.dataset.taskId = task.id;
        
        // Add completed class if task is done
        if (task.completed) {
            taskDiv.classList.add('completed');
        }
        
        // Format date display
        const dateDisplay = task.date ? formatDate(task.date) : '';
        const dateHTML = dateDisplay ? `<div class="task-date">${dateDisplay}</div>` : '';
        
        // Create task HTML
        taskDiv.innerHTML = `
            <div class="task-content">
                <div class="task-text ${task.completed ? 'completed' : ''}">${escapeHtml(task.text)}</div>
                ${dateHTML}
            </div>
            <div class="task-actions">
                <button class="btn-complete ${task.completed ? 'completed' : ''}" 
                        onclick="toggleTask(${task.id})" 
                        title="${task.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                    ${task.completed ? '↩️' : '✅'}
                </button>
                <button class="btn-delete" 
                        onclick="deleteTask(${task.id})" 
                        title="Delete task">
                    🗑️
                </button>
            </div>
        `;
        
        return taskDiv;
    }
    
    // Function to update task counter in header
    function updateTaskCounter() {
        const headerP = document.querySelector('header p');
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;
        
        if (totalTasks === 0) {
            headerP.textContent = 'Manage your daily tasks';
        } else {
            headerP.textContent = `${totalTasks} total • ${completedTasks} done • ${pendingTasks} pending`;
        }
    }
    
    // Function to format date
    function formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Check if it's today, tomorrow, or yesterday
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            // Format as "Mon, Jan 15"
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        }
    }
    
    // Function to escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Function to show notification
    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Add CSS animation
        if (!document.querySelector('#notification-style')) {
            const style = document.createElement('style');
            style.id = 'notification-style';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Function to save tasks to localStorage
    function saveTasksToStorage() {
        try {
            localStorage.setItem('todoTasks', JSON.stringify(tasks));
            console.log(' Tasks saved to localStorage');
        } catch (error) {
            console.error(' Error saving to localStorage:', error);
        }
    }
    
    // Function to load tasks from localStorage
    function loadTasksFromStorage() {
        try {
            const savedTasks = localStorage.getItem('todoTasks');
            if (savedTasks) {
                tasks = JSON.parse(savedTasks);
                console.log(' Tasks loaded from localStorage:', tasks);
                displayTasks();
            }
        } catch (error) {
            console.error(' Error loading from localStorage:', error);
            tasks = [];
        }
    }
    
    // Global functions for onclick handlers
    window.toggleTask = function(taskId) {
        console.log(' Toggling task:', taskId);
        
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
            console.error(' Task not found:', taskId);
            return;
        }
        
        // Toggle completed status
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        console.log('Task toggled:', tasks[taskIndex]);
        
        // Save to localStorage
        saveTasksToStorage();
        
        // Update display
        displayTasks();
        
        // Show feedback
        const action = tasks[taskIndex].completed ? 'completed' : 'reactivated';
        showNotification(`Task ${action}!`, 'success');
    };
    
    window.deleteTask = function(taskId) {
        console.log('🗑️ Deleting task:', taskId);
        
        // Find task for confirmation
        const task = tasks.find(t => t.id === taskId);
        if (!task) {
            console.error('Task not found:', taskId);
            return;
        }
        
        // Confirm deletion
        if (!confirm(`Are you sure you want to delete "${task.text}"?`)) {
            return;
        }
        
        // Remove from array
        const initialLength = tasks.length;
        tasks = tasks.filter(task => task.id !== taskId);
        
        if (tasks.length < initialLength) {
            console.log('Task deleted successfully');
            
            // Save to localStorage
            saveTasksToStorage();
            
            // Update display
            displayTasks();
            
            // Show feedback
            showNotification('Task deleted!', 'success');
        } else {
            console.error('Failed to delete task');
        }
    };
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to add task quickly
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (taskInput.value.trim()) {
                taskForm.dispatchEvent(new Event('submit'));
            }
        }
        
        // Escape to clear form
        if (e.key === 'Escape' && document.activeElement === taskInput) {
            taskInput.value = '';
            taskInput.blur();
        }
    });
    
    // Focus on input when page loads
    taskInput.focus();
    
    // Initial display of tasks
    displayTasks();
    
    console.log('Todo App initialization complete!');
});