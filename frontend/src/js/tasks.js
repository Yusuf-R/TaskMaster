class TaskManager {
    constructor() {
        this.API_URL = 'http://localhost:5000/api';
        this.tasks = [];
        this.currentTask = null;

        // DOM Elements
        this.tasksList = document.getElementById('tasks-list');
        this.addTaskBtn = document.getElementById('add-task-btn');
        this.taskModal = document.getElementById('task-modal');
        this.taskForm = document.getElementById('task-form');
        this.closeModalBtn = document.getElementById('close-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.searchInput = document.getElementById('search-input');
        this.priorityFilter = document.getElementById('priority-filter');
        this.statusFilter = document.getElementById('status-filter');

        // Event Listeners
        this.addTaskBtn.addEventListener('click', () => this.showModal());
        this.closeModalBtn.addEventListener('click', () => this.hideModal());
        this.taskForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.searchInput.addEventListener('input', debounce(() => this.loadTasks(), 300));
        this.priorityFilter.addEventListener('change', () => this.loadTasks());
        this.statusFilter.addEventListener('change', () => this.loadTasks());
    }

    // Show modal for adding/editing task
    showModal(task = null) {
        this.currentTask = task;
        this.modalTitle.textContent = task ? 'Edit Task' : 'Add New Task';
        this.taskForm.reset();

        if (task) {
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-description').value = task.description;
            document.getElementById('task-deadline').value = task.deadline.slice(0, 16);
            document.getElementById('task-priority').value = task.priority;
            document.getElementById('task-status').value = task.status;
        }

        this.taskModal.classList.remove('hidden');
    }

    // Hide modal
    hideModal() {
        this.taskModal.classList.add('hidden');
        this.currentTask = null;
        this.taskForm.reset();
    }

    // Handle form submission
    async handleSubmit(e) {
        e.preventDefault();

        const taskData = {
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-description').value,
            deadline: document.getElementById('task-deadline').value,
            priority: document.getElementById('task-priority').value,
            status: document.getElementById('task-status').value
        };

        try {
            if (this.currentTask) {
                await this.updateTask(this.currentTask._id, taskData);
            } else {
                await this.createTask(taskData);
            }

            this.hideModal();
            this.loadTasks();
        } catch (error) {
            alert(error.message);
        }
    }

    // Create new task
    async createTask(taskData) {
        try {
            const response = await fetch(`${this.API_URL}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.auth.getToken()}`
                },
                body: JSON.stringify(taskData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create task');
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    // Update existing task
    async updateTask(taskId, taskData) {
        try {
            const response = await fetch(`${this.API_URL}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.auth.getToken()}`
                },
                body: JSON.stringify(taskData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update task');
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    // Delete task
    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            const response = await fetch(`${this.API_URL}/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${window.auth.getToken()}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete task');
            }

            this.loadTasks();
        } catch (error) {
            alert(error.message);
        }
    }

    // Load tasks with filters
    async loadTasks() {
        try {
            let url = `${this.API_URL}/tasks?`;
            
            // Add filters
            const search = this.searchInput.value;
            const priority = this.priorityFilter.value;
            const status = this.statusFilter.value;

            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (priority) url += `&priority=${priority}`;
            if (status) url += `&status=${status}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${window.auth.getToken()}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to load tasks');
            }

            this.tasks = data;
            this.renderTasks();
        } catch (error) {
            alert(error.message);
        }
    }

    // Render tasks to DOM
    renderTasks() {
        this.tasksList.innerHTML = '';

        if (this.tasks.length === 0) {
            this.tasksList.innerHTML = '<p class="no-tasks">No tasks found</p>';
            return;
        }

        this.tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.tasksList.appendChild(taskElement);
        });
    }

    // Create task DOM element
    createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-card';
        
        const deadline = new Date(task.deadline).toLocaleString();
        
        taskDiv.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <div class="task-meta">
                <span class="priority-${task.priority}">${task.priority}</span>
                <span>${task.status}</span>
            </div>
            <div class="task-meta">
                <span>Deadline:</span>
                <span>${deadline}</span>
            </div>
            <div class="task-actions">
                <button class="btn btn-outline edit-btn">Edit</button>
                <button class="btn btn-outline delete-btn">Delete</button>
            </div>
        `;

        // Add event listeners
        taskDiv.querySelector('.edit-btn').addEventListener('click', () => this.showModal(task));
        taskDiv.querySelector('.delete-btn').addEventListener('click', () => this.deleteTask(task._id));

        return taskDiv;
    }
}

// Debounce function for search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize TaskManager
window.taskManager = new TaskManager();
