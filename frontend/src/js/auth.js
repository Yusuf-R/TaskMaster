class Auth {
    constructor() {
        this.API_URL = 'http://localhost:5000/api';
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');

        // Initialize elements
        this.initializeFormElements();
        this.initializeEventListeners();
        this.checkAuth();
    }

    initializeFormElements() {
        // Auth containers and forms
        this.authContainer = document.getElementById('auth-container');
        this.loginForm = document.getElementById('login-form');
        this.registerForm = document.getElementById('register-form');
        
        // Navigation elements
        this.showRegisterBtn = document.getElementById('show-register');
        this.showLoginBtn = document.getElementById('show-login');
        this.logoutBtn = document.getElementById('logout-btn');
        this.logoutModal = document.getElementById('logout-modal');

        // Initialize password toggle buttons
        const passwordToggles = document.querySelectorAll('.password-toggle');
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => this.togglePasswordVisibility(e));
        });
    }

    initializeEventListeners() {
        // Form submissions
        this.loginForm?.addEventListener('submit', (e) => this.handleLogin(e));
        this.registerForm?.addEventListener('submit', (e) => this.handleRegister(e));

        // Form switching
        document.getElementById('show-register')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleForms();
        });

        document.getElementById('show-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleForms();
        });

        // Logout handling
        this.logoutBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLogoutConfirmation();
        });

        // Logout modal buttons
        document.getElementById('cancel-logout')?.addEventListener('click', () => {
            this.hideLogoutConfirmation();
        });

        document.getElementById('confirm-logout')?.addEventListener('click', () => {
            this.performLogout();
        });

        // Close modal on outside click
        this.logoutModal?.addEventListener('click', (e) => {
            if (e.target === this.logoutModal) {
                this.hideLogoutConfirmation();
            }
        });
    }

    toggleForms() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (loginForm && registerForm) {
            loginForm.classList.toggle('hidden');
            registerForm.classList.toggle('hidden');
        }
    }

    togglePasswordVisibility(e) {
        const button = e.currentTarget;
        const input = button.previousElementSibling;
        const icon = button.querySelector('i');

        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        try {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            console.log('Attempting login with:', { email }); // Log for debugging

            const response = await fetch(`${this.API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log('Login response:', data); // Log for debugging

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            this.setAuth(data);
            window.location.href = 'taskManager.html';
        } catch (error) {
            console.error('Login error:', error);
            alert(error.message || 'Failed to login. Please check your credentials.');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        try {
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-password-confirm').value;

            console.log('Attempting registration with:', { email, username }); // Log for debugging

            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            const response = await fetch(`${this.API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();
            console.log('Register response:', data); // Log for debugging

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            this.setAuth(data);
            window.location.href = 'taskManager.html';
        } catch (error) {
            console.error('Registration error:', error);
            alert(error.message || 'Failed to register. Please try again.');
        }
    }

    checkAuth() {
        const token = this.getToken();
        const currentPath = window.location.pathname;
        
        // Allow free access to landing page (index.html)
        if (currentPath.endsWith('index.html') || currentPath.endsWith('/')) {
            return;
        }

        // Only redirect if trying to access protected pages without auth
        if (!token && currentPath.includes('taskManager.html')) {
            window.location.href = 'auth.html';
        }
        
        // Redirect to tasks if trying to access auth page while logged in
        if (token && currentPath.includes('auth.html')) {
            window.location.href = 'taskManager.html';
        }
    }

    showLogoutConfirmation() {
        if (this.logoutModal) {
            this.logoutModal.classList.remove('hidden');
            requestAnimationFrame(() => {
                this.logoutModal.style.opacity = '1';
            });
        }
    }

    hideLogoutConfirmation() {
        if (this.logoutModal) {
            this.logoutModal.style.opacity = '0';
            setTimeout(() => {
                this.logoutModal.classList.add('hidden');
            }, 300);
        }
    }

    performLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'auth.html';
    }

    setAuth(data) {
        if (!data.token || !data.user) {
            console.error('Invalid auth data:', data);
            throw new Error('Invalid authentication data received');
        }
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('Auth data set successfully'); // Log for debugging
    }

    getToken() {
        return this.token;
    }

    getUser() {
        return this.user;
    }
}

// Initialize auth when the script loads
window.auth = new Auth();