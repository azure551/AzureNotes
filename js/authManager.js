// Auth Manager - Mengelola authentication UI dan logic
class AuthManager {
    constructor(database) {
        this.database = database;
        this.initializeElements();
        this.attachEventListeners();
    }

    // Inisialisasi elemen DOM
    initializeElements() {
        // Auth screens
        this.authScreen = document.getElementById('authScreen');
        this.appScreen = document.getElementById('appScreen');
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');

        // Login form elements
        this.loginFormElement = document.getElementById('loginFormElement');
        this.loginEmail = document.getElementById('loginEmail');
        this.loginPassword = document.getElementById('loginPassword');

        // Register form elements
        this.registerFormElement = document.getElementById('registerFormElement');
        this.registerUsername = document.getElementById('registerUsername');
        this.registerEmail = document.getElementById('registerEmail');
        this.registerPassword = document.getElementById('registerPassword');
        this.registerPasswordConfirm = document.getElementById('registerPasswordConfirm');

        // Switch buttons
        this.switchToRegister = document.getElementById('switchToRegister');
        this.switchToLogin = document.getElementById('switchToLogin');

        // User display & logout
        this.userDisplay = document.getElementById('userDisplay');
        this.logoutBtn = document.getElementById('logoutBtn');

        // Toast
        this.toast = document.getElementById('toast');
    }

    // Attach event listeners
    attachEventListeners() {
        // Login form
        this.loginFormElement.addEventListener('submit', (e) => this.handleLogin(e));

        // Register form
        this.registerFormElement.addEventListener('submit', (e) => this.handleRegister(e));

        // Switch forms
        this.switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterForm();
        });

        this.switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });

        // Logout
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // ===== AUTHENTICATION HANDLERS =====

    // Handle login
    handleLogin(e) {
        e.preventDefault();

        const email = this.loginEmail.value.trim();
        const password = this.loginPassword.value.trim();

        if (!email || !password) {
            this.showToast('Email dan password harus diisi!', 'error');
            return;
        }

        const result = this.database.loginUser(email, password);

        if (result.success) {
            this.showToast(result.message, 'success');
            this.loginFormElement.reset();
            this.showAppScreen();
        } else {
            this.showToast(result.message, 'error');
        }
    }

    // Handle register
    handleRegister(e) {
        e.preventDefault();

        const username = this.registerUsername.value.trim();
        const email = this.registerEmail.value.trim();
        const password = this.registerPassword.value.trim();
        const passwordConfirm = this.registerPasswordConfirm.value.trim();

        // Validasi input
        if (!username || !email || !password || !passwordConfirm) {
            this.showToast('Semua field harus diisi!', 'error');
            return;
        }

        // Validasi username length
        if (username.length < 3) {
            this.showToast('Username minimal 3 karakter!', 'error');
            return;
        }

        // Validasi password match
        if (password !== passwordConfirm) {
            this.showToast('Password dan konfirmasi password tidak cocok!', 'error');
            return;
        }

        // Register
        const result = this.database.registerUser(email, username, password);

        if (result.success) {
            this.showToast(result.message, 'success');
            this.registerFormElement.reset();
            // Auto switch to login
            setTimeout(() => {
                this.showLoginForm();
            }, 1000);
        } else {
            this.showToast(result.message, 'error');
        }
    }

    // Handle logout
    handleLogout() {
        if (confirm('Apakah Anda yakin ingin logout?')) {
            this.database.logoutUser();
            this.showToast('Logout berhasil!', 'success');
            this.showAuthScreen();
            this.loginFormElement.reset();
            this.registerFormElement.reset();
        }
    }

    // ===== SCREEN MANAGEMENT =====

    // Show auth screen
    showAuthScreen() {
        this.authScreen.classList.add('show');
        this.appScreen.classList.remove('show');
    }

    // Show app screen
    showAppScreen() {
        this.authScreen.classList.remove('show');
        this.appScreen.classList.add('show');
        this.updateUserDisplay();
    }

    // Show login form
    showLoginForm() {
        this.loginForm.classList.add('show');
        this.registerForm.classList.remove('show');
    }

    // Show register form
    showRegisterForm() {
        this.loginForm.classList.remove('show');
        this.registerForm.classList.add('show');
    }

    // Update user display
    updateUserDisplay() {
        const user = this.database.getCurrentUser();
        if (user) {
            this.userDisplay.textContent = `👤 ${user.username}`;
        }
    }

    // Check if user is logged in and show appropriate screen
    checkAuthStatus() {
        if (this.database.isLoggedIn()) {
            this.showAppScreen();
        } else {
            this.showAuthScreen();
        }
    }

    // ===== TOAST NOTIFICATION =====

    showToast(message, type = 'success') {
        this.toast.textContent = message;
        this.toast.className = `toast show ${type}`;

        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }

    // ===== FORM CLEARING =====

    clearAllForms() {
        this.loginFormElement.reset();
        this.registerFormElement.reset();
    }
}

// Export untuk digunakan di module lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
