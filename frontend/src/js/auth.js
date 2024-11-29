class Auth {
    constructor() {
        this.API_URL = 'http://localhost:5000/api';
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user'));
        
        // DOM Elements
        this.authContainer = document.getElementById('auth-container');
        this.loginForm = document.getElementById('login-form');
        this.registerForm = document.getElementById('register-form');
        this.showRegisterBtn = document.getElementById('show-register');
        this.showLoginBtn = document.getElementById('show-login');
        this.logoutBtn = document.getElementById('logout-btn');
        this.usernameSpan = document.getElementById('username');
        this.app = document.getElementById('app');

        // Event Listeners
        this.loginForm.addEventListener('submit', (e) => this.login(e));
        this.registerForm.addEventListener('submit', (e) => this.register(e));
        this.showRegisterBtn.addEventListener('click', () => this.toggleForms());
        this.showLoginBtn.addEventListener('click', () => this.toggleForms());
        this.logoutBtn.addEventListener('click', () => this.logout());

        // Check authentication status
        this.checkAuth();
    }

    // Toggle between login and register forms
    toggleForms() {
        this.loginForm.classList.toggle('hidden');
        this.registerForm.classList.toggle('hidden');
    }

    // Check if user is authenticated
    checkAuth() {
        if (this.token && this.user) {
            this.authContainer.classList.add('hidden');
            this.app.classList.remove('hidden');
            this.usernameSpan.textContent = this.user.username;
        } else {
            this.authContainer.classList.remove('hidden');
            this.app.classList.add('hidden');
        }
    }

    // Handle login
    async login(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(`${this.API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            this.setAuth(data);
            this.checkAuth();
            
            // Clear form
            this.loginForm.reset();
            
            // Initialize tasks
            window.taskManager.loadTasks();
        } catch (error) {
            alert(error.message);
        }
    }

    // Handle registration
    async register(e) {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            const response = await fetch(`${this.API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            this.setAuth(data);
            this.checkAuth();
            
            // Clear form
            this.registerForm.reset();
            
            // Initialize tasks
            window.taskManager.loadTasks();
        } catch (error) {
            alert(error.message);
        }
    }

    // Handle logout
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.token = null;
        this.user = null;
        this.checkAuth();
    }

    // Set authentication data
    setAuth(data) {
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
    }

    // Get authentication token
    getToken() {
        return this.token;
    }
}

// Initialize Auth
window.auth = new Auth();
