class TaskManager {
    constructor() {
        // Prevent multiple instances
        if (window.taskManager) {
            return window.taskManager;
        }

        this.API_URL = 'http://localhost:5000/api';
        this.auth = window.auth;
        
        // Initialize DOM elements
        this.tasksList = document.querySelector('#tasks-list');
        this.taskModal = document.getElementById('task-modal');
        this.taskForm = document.getElementById('task-form');
        this.addTaskBtn = document.getElementById('add-task-btn');
        this.closeModalBtn = document.getElementById('close-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.searchInput = document.getElementById('searchInput');
        this.priorityFilter = document.getElementById('priorityFilter');
        this.statusFilter = document.getElementById('statusFilter');
        this.clearSearchBtn = document.getElementById('clearSearch');
        this.resetFilters = document.getElementById('resetFilters');

        if (!this.tasksList) {
            console.warn('Tasks grid element not found');
            return;
        }

        this.initializeEventListeners();
        
        // Store instance in window object
        window.taskManager = this;
    }

    initializeEventListeners() {
        // Remove any existing event listeners
        const newAddTaskBtn = document.getElementById('addTaskBtn');
        const oldAddTaskBtn = newAddTaskBtn.cloneNode(true);
        newAddTaskBtn.parentNode.replaceChild(oldAddTaskBtn, newAddTaskBtn);
        oldAddTaskBtn.addEventListener('click', () => this.showModal());

        // Close modal
        const closeModal = document.getElementById('close-modal');
        const newCloseModal = closeModal.cloneNode(true);
        closeModal.parentNode.replaceChild(newCloseModal, closeModal);
        newCloseModal.addEventListener('click', () => this.hideModal());

        // Form submission
        const taskForm = document.getElementById('task-form');
        const newTaskForm = taskForm.cloneNode(true);
        taskForm.parentNode.replaceChild(newTaskForm, taskForm);
        newTaskForm.addEventListener('submit', (e) => this.handleSubmit(e));

        // Search and filters
        const searchInput = document.getElementById('searchInput');
        const newSearchInput = searchInput.cloneNode(true);
        searchInput.parentNode.replaceChild(newSearchInput, searchInput);
        newSearchInput.addEventListener('input', debounce(() => this.loadTasks(), 300));

        const priorityFilter = document.getElementById('priorityFilter');
        const newPriorityFilter = priorityFilter.cloneNode(true);
        priorityFilter.parentNode.replaceChild(newPriorityFilter, priorityFilter);
        newPriorityFilter.addEventListener('change', () => this.loadTasks());

        const statusFilter = document.getElementById('statusFilter');
        const newStatusFilter = statusFilter.cloneNode(true);
        statusFilter.parentNode.replaceChild(newStatusFilter, statusFilter);
        newStatusFilter.addEventListener('change', () => this.loadTasks());

        const clearSearch = document.getElementById('clearSearch');
        const newClearSearch = clearSearch.cloneNode(true);
        clearSearch.parentNode.replaceChild(newClearSearch, clearSearch);
        newClearSearch.addEventListener('click', () => {
            newSearchInput.value = '';
            this.loadTasks();
        });

        // Initialize filter event listeners
        const resetFilters = document.getElementById('resetFilters');
        const newResetFilters = resetFilters.cloneNode(true);
        resetFilters.parentNode.replaceChild(newResetFilters, resetFilters);
        newResetFilters.addEventListener('click', () => {
            console.log('Resetting filters');
            if (searchInput) searchInput.value = '';
            if (priorityFilter) priorityFilter.value = '';
            if (statusFilter) statusFilter.value = '';
            this.loadTasks();
        });

        // Task Modal Cancel Button
        const cancelTaskBtn = document.getElementById('cancel-task');
        if (cancelTaskBtn) {
            cancelTaskBtn.addEventListener('click', () => this.hideModal());
        }

        // Close Task Modal Button
        const closeTaskModal = document.getElementById('close-task-modal');
        if (closeTaskModal) {
            closeTaskModal.addEventListener('click', () => this.hideModal());
        }

        // Logout Button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.showLogoutConfirmation());
        }

        // Confirm Logout Button
        const confirmLogoutBtn = document.getElementById('confirm-logout');
        if (confirmLogoutBtn) {
            confirmLogoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Cancel Logout Button
        const cancelLogoutBtn = document.getElementById('cancel-logout');
        if (cancelLogoutBtn) {
            cancelLogoutBtn.addEventListener('click', () => this.hideLogoutConfirmation());
        }
    }

    // Show modal for adding/editing task
    showModal(task = null) {
        this.currentTask = task;
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('task-form');
        
        if (task) {
            console.log('Editing task:', task); // Debug log
            modalTitle.textContent = 'Edit Task';
            document.getElementById('task-title').value = task.title || '';
            document.getElementById('task-description').value = task.description || '';
            document.getElementById('task-deadline').value = task.deadline ? task.deadline.split('T')[0] : '';
            document.getElementById('task-priority').value = task.priority || 'medium';
            document.getElementById('task-status').value = task.status || 'pending';
        } else {
            console.log('Creating new task'); // Debug log
            modalTitle.textContent = 'Add Task';
            form.reset();
        }

        document.getElementById('task-modal').classList.remove('hidden');
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
        try {
            const taskData = {
                title: document.getElementById('task-title').value,
                description: document.getElementById('task-description').value,
                deadline: document.getElementById('task-deadline').value,
                priority: document.getElementById('task-priority').value,
                status: document.getElementById('task-status').value
            };

            console.log('Submitting task:', taskData); // Debug log
            console.log('Current task:', this.currentTask); // Debug log

            let url = `${this.API_URL}/tasks`;
            let method = 'POST';

            if (this.currentTask && this.currentTask._id) {
                url = `${this.API_URL}/tasks/${this.currentTask._id}`;
                method = 'PATCH';
                console.log('Edit URL:', url); // Debug log
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.auth.getToken()}`
                },
                body: JSON.stringify(taskData)
            });

            // First check if response is ok before trying to parse JSON
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error response:', errorText);
                throw new Error(`Failed to save task: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Server response:', data); // Debug log

            // Reset current task
            this.currentTask = null;
            
            // Hide modal and show success message
            this.hideModal();
            this.showNotification(
                method === 'PATCH' ? 'Task updated successfully!' : 'Task created successfully!',
                'success'
            );
            
            // Clear form
            document.getElementById('task-form').reset();
            
            // Reload tasks
            await this.loadTasks();
        } catch (error) {
            console.error('Error saving task:', error);
            this.showNotification(error.message || 'Failed to save task. Please try again.', 'error');
        }
    }

    // Create new task
    async createTask(taskData) {
        try {
            const token = this.auth?.getToken();
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`${this.API_URL}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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
            const token = this.auth?.getToken();
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`${this.API_URL}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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
            const token = this.auth?.getToken();
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`${this.API_URL}/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
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
            // Get filter values
            const searchQuery = document.getElementById('searchInput')?.value || '';
            const priorityFilter = document.getElementById('priorityFilter')?.value || '';
            const statusFilter = document.getElementById('statusFilter')?.value || '';

            // Build query string
            const queryParams = new URLSearchParams();
            if (searchQuery) queryParams.append('search', searchQuery);
            if (priorityFilter) queryParams.append('priority', priorityFilter);
            if (statusFilter) queryParams.append('status', statusFilter);

            console.log('Loading tasks with filters:', {
                search: searchQuery,
                priority: priorityFilter,
                status: statusFilter
            });

            const url = `${this.API_URL}/tasks${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            console.log('Fetching tasks from:', url);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.auth.getToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load tasks');
            }

            const tasks = await response.json();
            console.log('Loaded tasks:', tasks);

            this.renderTasks(tasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.showNotification('Failed to load tasks. Please try again.', 'error');
        }
    }

    // Render tasks to DOM
    renderTasks(tasks) {
        if (!this.tasksList) return;

        this.tasksList.innerHTML = '';
        
        if (tasks.length === 0) {
            this.tasksList.innerHTML = `
                <div class="no-tasks">
                    <i class="fas fa-tasks"></i>
                    <p>No tasks found</p>
                </div>
            `;
            return;
        }

        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-card';
            
            const deadline = new Date(task.deadline);
            const formattedDeadline = deadline.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            taskElement.innerHTML = `
                <div class="task-header">
                    <h3 class="task-title">${task.title}</h3>
                </div>
                <p class="task-description">${task.description}</p>
                <div class="task-meta">
                    <span class="task-tag priority-${task.priority}">
                        <i class="fas fa-flag"></i>
                        ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                    <span class="task-tag status-${task.status}">
                        <i class="fas fa-clock"></i>
                        ${task.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                    <span class="task-tag">
                        <i class="fas fa-calendar"></i>
                        ${formattedDeadline}
                    </span>
                </div>
                <div class="task-actions">
                    <button class="btn btn-icon edit-btn">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-icon delete-btn">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;

            // Add event listeners for edit and delete buttons
            const editBtn = taskElement.querySelector('.edit-btn');
            const deleteBtn = taskElement.querySelector('.delete-btn');

            editBtn.addEventListener('click', () => this.showModal(task));
            deleteBtn.addEventListener('click', () => this.deleteTask(task._id));

            this.tasksList.appendChild(taskElement);
        });
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    showLogoutConfirmation() {
        const modal = document.getElementById('logout-modal');
        if (modal) {
            modal.classList.remove('hidden');
            // Add fade-in animation
            modal.style.animation = 'fadeIn 0.3s ease-in-out';
        }
    }

    hideLogoutConfirmation() {
        const modal = document.getElementById('logout-modal');
        if (modal) {
            // Add fade-out animation
            modal.style.animation = 'fadeOut 0.3s ease-in-out';
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }
    }

    handleLogout() {
        try {
            // Clear all storage
            localStorage.clear();
            sessionStorage.clear();
            
            // Show success notification
            this.showNotification('Successfully logged out!', 'success');
            
            // Redirect to login page
            window.location.replace('./auth.html');
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('Error during logout. Please try again.', 'error');
        }
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

// Initialize TaskManager only once when the page loads
if (!window.taskManagerInitialized) {
    window.taskManagerInitialized = true;
    document.addEventListener('DOMContentLoaded', () => {
        // Check authentication
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (token && user) {
            document.getElementById('username').textContent = `Hi, ${user.username}`;
            const taskManager = new TaskManager();
            taskManager.loadTasks();
        } else {
            window.location.href = 'auth.html';
        }
    });
}