class TaskManager {
    constructor() {
        // Prevent multiple instances
        if (window.taskManager) {
            return window.taskManager;
        }

        this.API_URL = 'https://task-master-server-be.vercel.app/api';
        this.auth = window.auth;
        this.currentTaskId = null;
        this.isLoading = false;
        
        // Initialize DOM elements
        this.tasksList = document.querySelector('#tasks-list');
        this.taskModal = document.getElementById('task-modal');
        this.taskForm = document.getElementById('task-form');
        this.addTaskBtn = document.getElementById('addTaskBtn');
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
        this.loadTasks(); // Load tasks immediately
        
        // Store instance in window object
        window.taskManager = this;
    }

    showModal(task = null) {
        if (this.taskModal) {
            this.taskModal.classList.remove('hidden');
            this.taskModal.style.display = 'flex';  // Ensure modal is displayed
            
            // Update modal title and form based on whether we're editing
            const modalTitleSpan = this.modalTitle.querySelector('span');
            const modalTitleIcon = this.modalTitle.querySelector('i');
            
            if (task) {
                modalTitleSpan.textContent = 'Edit Task';
                modalTitleIcon.className = 'fas fa-edit';
                this.currentTaskId = task._id;
                
                // Fill form with task data
                document.getElementById('task-title').value = task.title;
                document.getElementById('task-description').value = task.description;
                document.getElementById('task-deadline').value = task.deadline.split('.')[0]; // Remove milliseconds
                document.getElementById('task-priority').value = task.priority;
                document.getElementById('task-status').value = task.status;
            } else {
                modalTitleSpan.textContent = 'Add New Task';
                modalTitleIcon.className = 'fas fa-plus-circle';
                this.currentTaskId = null;
                this.taskForm.reset();
            }
        }
    }

    hideModal() {
        if (this.taskModal) {
            this.taskModal.classList.add('hidden');
            this.taskModal.style.display = 'none';  // Ensure modal is hidden
            this.currentTaskId = null;
        }
    }

    initializeEventListeners() {
        // Add task button
        this.addTaskBtn?.addEventListener('click', () => this.showModal());

        // Close modal
        this.closeModalBtn?.addEventListener('click', () => this.hideModal());

        // Form submission
        this.taskForm?.addEventListener('submit', (e) => this.handleSubmit(e));

        // Search and filters
        this.searchInput?.addEventListener('input', debounce(() => this.loadTasks(), 300));
        this.priorityFilter?.addEventListener('change', () => this.loadTasks());
        this.statusFilter?.addEventListener('change', () => this.loadTasks());
        this.clearSearchBtn?.addEventListener('click', () => {
            if (this.searchInput) {
                this.searchInput.value = '';
                this.loadTasks();
            }
        });

        // Reset filters
        this.resetFilters?.addEventListener('click', () => {
            if (this.searchInput) this.searchInput.value = '';
            if (this.priorityFilter) this.priorityFilter.value = '';
            if (this.statusFilter) this.statusFilter.value = '';
            this.loadTasks();
        });

        // Close modal on outside click
        this.taskModal?.addEventListener('click', (e) => {
            if (e.target === this.taskModal) {
                this.hideModal();
            }
        });
    }

    showLoadingSkeleton() {
        if (!this.tasksList) return;
        
        const skeletons = Array(3).fill(0).map(() => `
            <div class="task-card skeleton">
                <div class="skeleton-header">
                    <div class="skeleton-title"></div>
                </div>
                <div class="skeleton-description"></div>
                <div class="skeleton-meta">
                    <div class="skeleton-tag"></div>
                    <div class="skeleton-tag"></div>
                    <div class="skeleton-tag"></div>
                </div>
                <div class="skeleton-actions">
                    <div class="skeleton-button"></div>
                    <div class="skeleton-button"></div>
                </div>
            </div>
        `).join('');

        this.tasksList.innerHTML = skeletons;
    }

    async loadTasks() {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            this.showLoadingSkeleton();

            const searchQuery = this.searchInput?.value.toLowerCase() || '';
            const priorityFilter = this.priorityFilter?.value || '';
            const statusFilter = this.statusFilter?.value || '';

            const response = await fetch(`${this.API_URL}/tasks`, {
                headers: {
                    'Authorization': `Bearer ${this.auth.getToken()}`
                }
            });

            if (!response.ok) throw new Error('Failed to load tasks');

            let tasks = await response.json();
            
            // Apply filters
            tasks = tasks.filter(task => {
                const matchesSearch = task.title.toLowerCase().includes(searchQuery) ||
                                    task.description.toLowerCase().includes(searchQuery);
                const matchesPriority = !priorityFilter || task.priority === priorityFilter;
                const matchesStatus = !statusFilter || task.status === statusFilter;
                
                return matchesSearch && matchesPriority && matchesStatus;
            });

            if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
                this.tasksList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-clipboard-list fa-4x"></i>
                        <h3>No Tasks Found</h3>
                        <p>Your task list is empty. Start by adding your first task!</p>
                        <button class="btn btn-primary add-first-task" onclick="window.taskManager.showModal()">
                            <i class="fas fa-plus"></i> Create Your First Task
                        </button>
                    </div>
                `;
                return;
            }

            this.renderTasks(tasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.showNotification('Failed to load tasks. Please try again.', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    renderTasks(tasks) {
        if (!this.tasksList) return;

        this.tasksList.innerHTML = '';
        
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

    async handleSubmit(e) {
        e.preventDefault();
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        try {
            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            
            const taskData = {
                title: document.getElementById('task-title').value,
                description: document.getElementById('task-description').value,
                deadline: document.getElementById('task-deadline').value,
                priority: document.getElementById('task-priority').value,
                status: document.getElementById('task-status').value
            };

            let url = `${this.API_URL}/tasks`;
            let method = 'POST';

            // If editing, use PATCH method and include task ID
            if (this.currentTaskId) {
                url += `/${this.currentTaskId}`;
                method = 'PATCH';
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.auth.getToken()}`
                },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error response:', errorText);
                throw new Error(`Failed to ${this.currentTaskId ? 'update' : 'create'} task: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Server response:', data);

            this.hideModal();
            this.showNotification(`Task ${this.currentTaskId ? 'updated' : 'created'} successfully!`, 'success');
            this.loadTasks();
        } catch (error) {
            console.error('Error saving task:', error);
            this.showNotification(error.message || 'Failed to save task. Please try again.', 'error');
        } finally {
            // Restore button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    }

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
        } else {
            window.location.href = 'auth.html';
        }
    });
}