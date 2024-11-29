class Auth {
    constructor() {
        this.API_URL = 'http://localhost:5000/api';
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user'));
        
        // Initialize form elements
        this.initializeFormElements();
        
        // Add event listeners
        this.addEventListeners();

        // Check authentication status
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
        this.usernameSpan = document.getElementById('username');
        this.app = document.getElementById('app');
        this.landingPage = document.getElementById('landing-page');

        // Learn More button (only on index.html)
        const learnMoreBtn = document.getElementById('learn-more');
        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', () => {
                const featuresSection = document.querySelector('.features-section');
                featuresSection.scrollIntoView({ behavior: 'smooth' });
            });
        }

        // Initialize password toggle buttons
        const passwordToggles = document.querySelectorAll('.password-toggle');
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => this.togglePasswordVisibility(e));
        });
    }

    addEventListeners() {
        // Form submissions
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        if (this.registerForm) {
            this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
            
            // Add real-time password validation
            const registerPassword = document.getElementById('register-password');
            if (registerPassword) {
                registerPassword.addEventListener('input', (e) => this.validatePassword(e.target.value));
            }

            // Add password confirmation validation
            const confirmPassword = document.getElementById('register-password-confirm');
            if (confirmPassword) {
                confirmPassword.addEventListener('input', () => this.validatePasswordConfirmation());
            }
        }

        // Form switching
        if (this.showRegisterBtn) {
            this.showRegisterBtn.addEventListener('click', () => this.toggleForms());
        }
        if (this.showLoginBtn) {
            this.showLoginBtn.addEventListener('click', () => this.toggleForms());
        }
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    // Toggle password visibility
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

    // Validate email format
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate password requirements
    validatePassword(password) {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*]/.test(password)
        };

        // Update requirement checks in the UI
        Object.keys(requirements).forEach(req => {
            const element = document.getElementById(`${req}-check`);
            if (element) {
                element.classList.toggle('valid', requirements[req]);
            }
        });

        return Object.values(requirements).every(Boolean);
    }

    // Validate password confirmation
    validatePasswordConfirmation() {
        const password = document.getElementById('register-password');
        const confirm = document.getElementById('register-password-confirm');
        const errorElement = document.getElementById('register-password-confirm-error');

        if (password && confirm && errorElement) {
            const isMatch = password.value === confirm.value;
            confirm.classList.toggle('is-invalid', !isMatch);
            confirm.classList.toggle('is-valid', isMatch);
            errorElement.textContent = isMatch ? '' : 'Passwords do not match';
            return isMatch;
        }
        return false;
    }

    // Handle login form submission
    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email');
        const password = document.getElementById('login-password');
        const emailError = document.getElementById('login-email-error');
        const passwordError = document.getElementById('login-password-error');

        // Reset errors
        emailError.textContent = '';
        passwordError.textContent = '';
        email.classList.remove('is-invalid', 'is-valid');
        password.classList.remove('is-invalid', 'is-valid');

        // Validate email
        if (!this.validateEmail(email.value)) {
            email.classList.add('is-invalid');
            emailError.textContent = 'Please enter a valid email address';
            return;
        }
        email.classList.add('is-valid');

        // Proceed with login
        try {
            await this.login(email.value, password.value);
        } catch (error) {
            passwordError.textContent = 'Invalid email or password';
            password.classList.add('is-invalid');
        }
    }

    // Handle register form submission
    async handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('register-username');
        const email = document.getElementById('register-email');
        const password = document.getElementById('register-password');
        const confirm = document.getElementById('register-password-confirm');

        // Reset errors
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        document.querySelectorAll('input').forEach(input => {
            input.classList.remove('is-invalid', 'is-valid');
        });

        let isValid = true;

        // Validate username
        if (username.value.length < 3) {
            username.classList.add('is-invalid');
            document.getElementById('register-username-error').textContent = 'Username must be at least 3 characters';
            isValid = false;
        }

        // Validate email
        if (!this.validateEmail(email.value)) {
            email.classList.add('is-invalid');
            document.getElementById('register-email-error').textContent = 'Please enter a valid email address';
            isValid = false;
        }

        // Validate password
        if (!this.validatePassword(password.value)) {
            password.classList.add('is-invalid');
            document.getElementById('register-password-error').textContent = 'Password does not meet requirements';
            isValid = false;
        }

        // Validate password confirmation
        if (!this.validatePasswordConfirmation()) {
            isValid = false;
        }

        if (isValid) {
            try {
                await this.register(username.value, email.value, password.value);
            } catch (error) {
                document.getElementById('register-email-error').textContent = 'Registration failed. Please try again.';
            }
        }
    }

    // Toggle between login and register forms
    toggleForms() {
        this.loginForm.classList.toggle('hidden');
        this.registerForm.classList.toggle('hidden');
    }

    // Check if user is authenticated
    checkAuth() {
        // On index page
        if (this.landingPage && this.app) {
            if (this.token && this.user) {
                // User is logged in, show app
                this.app.classList.remove('hidden');
                this.landingPage.classList.add('hidden');
                if (this.usernameSpan) {
                    this.usernameSpan.textContent = this.user.username;
                }
            } else {
                // User is not logged in, show landing
                this.landingPage.classList.remove('hidden');
                this.app.classList.add('hidden');
            }
        }
    }

    // Handle login
    async login(email, password) {
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
            
            // Initialize tasks
            window.taskManager.loadTasks();
        } catch (error) {
            alert(error.message);
        }
    }

    // Handle registration
    async register(username, email, password) {
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
        window.location.href = 'index.html';
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

    // Function to show auth forms
    showAuthForms() {
        this.authContainer.classList.remove('hidden');
        this.app.classList.add('hidden');
    }
}

// Initialize Auth
window.auth = new Auth();
