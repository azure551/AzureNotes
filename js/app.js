// Main App - Koordinator aplikasi
class AzureNotesApp {
    constructor() {
        this.database = new Database();
        this.authManager = new AuthManager(this.database);
        this.uiManager = new UIManager(this.database);
        this.initialize();
    }

    // Inisialisasi aplikasi
    initialize() {
        // Check auth status
        this.authManager.checkAuthStatus();

        // Load notes jika user sudah login
        if (this.database.isLoggedIn()) {
            this.uiManager.renderNotes();
        }
    }

    // Start aplikasi
    start() {
        console.log('🚀 AzureNotes aplikasi dimulai!');
    }
}

// Inisialisasi aplikasi ketika DOM sudah siap
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new AzureNotesApp();
        window.app.start();
    });
} else {
    window.app = new AzureNotesApp();
    window.app.start();
}

// Export untuk digunakan di module lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AzureNotesApp;
}
