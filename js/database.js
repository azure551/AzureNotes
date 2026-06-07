// Database Manager - Mengelola user dan authentication
class DatabaseManager {
    constructor() {
        this.initDatabase();
    }

    // Inisialisasi database di localStorage
    initDatabase() {
        // Inisialisasi users jika belum ada
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([]));
        }

        // Inisialisasi current user
        if (!localStorage.getItem('currentUser')) {
            localStorage.setItem('currentUser', JSON.stringify(null));
        }
    }

    // ===== USER MANAGEMENT =====

    // Daftar user baru
    registerUser(email, username, password) {
        // Validasi input
        if (!email || !username || !password) {
            return {
                success: false,
                message: 'Email, username, dan password harus diisi!'
            };
        }

        // Validasi email format
        if (!this.isValidEmail(email)) {
            return {
                success: false,
                message: 'Format email tidak valid!'
            };
        }

        // Validasi password length
        if (password.length < 6) {
            return {
                success: false,
                message: 'Password minimal 6 karakter!'
            };
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];

        // Cek apakah email sudah terdaftar
        if (users.some(u => u.email === email)) {
            return {
                success: false,
                message: 'Email sudah terdaftar!'
            };
        }

        // Cek apakah username sudah terdaftar
        if (users.some(u => u.username === username)) {
            return {
                success: false,
                message: 'Username sudah digunakan!'
            };
        }

        // Buat user baru
        const newUser = {
            id: Date.now(),
            email: email,
            username: username,
            password: this.hashPassword(password), // Simple hash (untuk production gunakan bcrypt)
            createdAt: new Date().toISOString(),
            notes: []
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        return {
            success: true,
            message: 'Pendaftaran berhasil! Silakan login.'
        };
    }

    // Login user
    loginUser(email, password) {
        if (!email || !password) {
            return {
                success: false,
                message: 'Email dan password harus diisi!'
            };
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email);

        if (!user) {
            return {
                success: false,
                message: 'Email tidak ditemukan!'
            };
        }

        if (user.password !== this.hashPassword(password)) {
            return {
                success: false,
                message: 'Password salah!'
            };
        }

        // Set current user (jangan simpan password)
        const currentUser = {
            id: user.id,
            email: user.email,
            username: user.username,
            createdAt: user.createdAt
        };

        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        return {
            success: true,
            message: 'Login berhasil!',
            user: currentUser
        };
    }

    // Logout user
    logoutUser() {
        localStorage.setItem('currentUser', JSON.stringify(null));
        return {
            success: true,
            message: 'Logout berhasil!'
        };
    }

    // Get current user
    getCurrentUser() {
        const current = localStorage.getItem('currentUser');
        return JSON.parse(current);
    }

    // Check apakah user sudah login
    isLoggedIn() {
        const currentUser = this.getCurrentUser();
        return currentUser !== null;
    }

    // ===== NOTE MANAGEMENT =====

    // Tambah catatan untuk user
    addNoteForUser(title, content, tags) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                message: 'User tidak login!'
            };
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);

        if (userIndex === -1) {
            return {
                success: false,
                message: 'User tidak ditemukan!'
            };
        }

        const newNote = {
            id: Date.now(),
            title: title || 'Tanpa Judul',
            content: content || '',
            tags: this.parseTags(tags),
            createdAt: new Date().toLocaleString('id-ID'),
            updatedAt: new Date().toLocaleString('id-ID')
        };

        users[userIndex].notes.unshift(newNote);
        localStorage.setItem('users', JSON.stringify(users));

        return {
            success: true,
            message: 'Catatan berhasil ditambahkan!',
            note: newNote
        };
    }

    // Get semua catatan user
    getUserNotes() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return [];

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.id === currentUser.id);

        return user ? user.notes : [];
    }

    // Update catatan user
    updateUserNote(noteId, title, content, tags) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                message: 'User tidak login!'
            };
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);

        if (userIndex === -1) {
            return {
                success: false,
                message: 'User tidak ditemukan!'
            };
        }

        const noteIndex = users[userIndex].notes.findIndex(n => n.id === noteId);

        if (noteIndex === -1) {
            return {
                success: false,
                message: 'Catatan tidak ditemukan!'
            };
        }

        users[userIndex].notes[noteIndex] = {
            ...users[userIndex].notes[noteIndex],
            title: title,
            content: content,
            tags: this.parseTags(tags),
            updatedAt: new Date().toLocaleString('id-ID')
        };

        localStorage.setItem('users', JSON.stringify(users));

        return {
            success: true,
            message: 'Catatan berhasil diperbarui!',
            note: users[userIndex].notes[noteIndex]
        };
    }

    // Hapus catatan user
    deleteUserNote(noteId) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                message: 'User tidak login!'
            };
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);

        if (userIndex === -1) {
            return {
                success: false,
                message: 'User tidak ditemukan!'
            };
        }

        users[userIndex].notes = users[userIndex].notes.filter(n => n.id !== noteId);
        localStorage.setItem('users', JSON.stringify(users));

        return {
            success: true,
            message: 'Catatan berhasil dihapus!'
        };
    }

    // Get note by ID
    getNoteById(noteId) {
        const notes = this.getUserNotes();
        return notes.find(n => n.id === noteId);
    }

    // ===== HELPER FUNCTIONS =====

    // Hash password (simple - untuk production gunakan bcrypt)
    hashPassword(password) {
        // Simple hash function - sebaiknya gunakan bcrypt untuk production
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }

    // Validasi email
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Parse tags
    parseTags(tagString) {
        if (!tagString) return [];
        return tagString
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
    }

    // Get all unique tags untuk user
    getAllUserTags() {
        const notes = this.getUserNotes();
        const allTags = new Set();
        notes.forEach(note => {
            note.tags.forEach(tag => allTags.add(tag));
        });
        return Array.from(allTags).sort();
    }

    // Search notes
    searchUserNotes(query) {
        const notes = this.getUserNotes();
        if (!query.trim()) return notes;

        const q = query.toLowerCase();
        return notes.filter(note =>
            note.title.toLowerCase().includes(q) ||
            note.content.toLowerCase().includes(q) ||
            note.tags.some(tag => tag.toLowerCase().includes(q))
        );
    }

    // Filter notes by tag
    filterUserNotesByTag(tag) {
        const notes = this.getUserNotes();
        if (!tag) return notes;
        return notes.filter(note => note.tags.includes(tag));
    }
}

// Export untuk digunakan di module lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseManager;
}
