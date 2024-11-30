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

    async handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // Show loading state
        const loginBtn = document.getElementById('login-btn');
        this.setLoadingState(loginBtn, true);

        try {
            const response = await fetch(`${this.API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and user data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Show success notification
                this.showNotification('Successfully logged in!', 'success');
                
                // Redirect after notification
                setTimeout(() => {
                    window.location.href = './taskManager.html';
                }, 1500);
            } else {
                this.showNotification(data.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Network error. Please try again.', 'error');
        } finally {
            this.setLoadingState(loginBtn, false);
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-password-confirm').value;

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        // Show loading state
        const registerBtn = document.getElementById('register-btn');
        this.setLoadingState(registerBtn, true);

        try {
            const response = await fetch(`${this.API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and user data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Show success notification
                this.showNotification('Registration successful!', 'success');
                
                // Redirect after notification
                setTimeout(() => {
                    window.location.href = './taskManager.html';
                }, 1500);
            } else {
                this.showNotification(data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Network error. Please try again.', 'error');
        } finally {
            this.setLoadingState(registerBtn, false);
        }
    }

    setLoadingState(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Add icon based on type
        const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);

        // Remove notification after animation
        setTimeout(() => {
            notification.classList.add('hiding');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    checkAuth() {
        const token = this.getToken();
        const currentPath = window.location.pathname;
        
        // Protected routes need auth
        if (currentPath.includes('taskManager.html')) {
            if (!token) {
                window.location.href = 'auth.html';
            }
            return;
        }
        
        // Redirect from auth page if already logged in
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
        
        // Show success message
        this.showNotification('Successfully logged out!', 'success');
        
        // Redirect to landing page after logout
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
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