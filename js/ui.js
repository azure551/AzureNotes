// UI Manager - Mengelola tampilan catatan dan interaksi UI
class UIManager {
    constructor(database) {
        this.database = database;
        this.currentEditingNoteId = null;
        this.initializeElements();
        this.attachEventListeners();
    }

    // Inisialisasi elemen DOM
    initializeElements() {
        // Main elements
        this.notesContainer = document.getElementById('notesContainer');
        this.searchInput = document.getElementById('searchInput');
        this.filterTags = document.getElementById('filterTags');
        this.newNoteBtn = document.getElementById('newNoteBtn');

        // Modal elements
        this.noteModal = document.getElementById('noteModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.noteTitle = document.getElementById('noteTitle');
        this.noteContent = document.getElementById('noteContent');
        this.noteTags = document.getElementById('noteTags');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.deleteBtn = document.getElementById('deleteBtn');

        // Toast
        this.toast = document.getElementById('toast');
    }

    // Attach event listeners
    attachEventListeners() {
        this.newNoteBtn.addEventListener('click', () => this.openNewNoteModal());
        this.searchInput.addEventListener('input', () => this.handleSearch());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        this.saveBtn.addEventListener('click', () => this.handleSaveNote());
        this.deleteBtn.addEventListener('click', () => this.handleDeleteNote());

        // Close modal on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.noteModal.classList.contains('show')) {
                this.closeModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.openNewNoteModal();
            }
        });
    }

    // ===== NOTE DISPLAY =====

    // Render semua catatan
    renderNotes(notes = null) {
        if (!notes) {
            notes = this.database.getUserNotes();
        }

        this.notesContainer.innerHTML = '';

        if (notes.length === 0) {
            this.notesContainer.innerHTML = `
                <div class="empty-state">
                    <p>📭 Belum ada catatan</p>
                    <p class="empty-subtitle">Mulai dengan membuat catatan baru!</p>
                </div>
            `;
            return;
        }

        notes.forEach(note => {
            const noteCard = this.createNoteCard(note);
            this.notesContainer.appendChild(noteCard);
        });

        this.updateFilterTags();
    }

    // Buat note card element
    createNoteCard(note) {
        const card = document.createElement('div');
        card.className = 'note-card';
        card.innerHTML = `
            <div class="note-card-title">${this.escapeHtml(note.title)}</div>
            <div class="note-card-content">${this.escapeHtml(note.content)}</div>
            <div class="note-card-date">${note.updatedAt}</div>
            <div class="note-card-tags">
                ${note.tags.map(tag => `<span class="note-tag">${this.escapeHtml(tag)}</span>`).join('')}
            </div>
        `;

        card.addEventListener('click', () => this.openEditNoteModal(note.id));

        return card;
    }

    // Update filter tags
    updateFilterTags() {
        const allTags = this.database.getAllUserTags();
        this.filterTags.innerHTML = '';

        if (allTags.length === 0) return;

        allTags.forEach(tag => {
            const tagButton = document.createElement('button');
            tagButton.className = 'tag-filter';
            tagButton.innerHTML = `
                ${this.escapeHtml(tag)}
                <span class="tag-filter-remove">×</span>
            `;

            tagButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterByTag(tag);
            });

            this.filterTags.appendChild(tagButton);
        });
    }

    // ===== SEARCH & FILTER =====

    // Handle search
    handleSearch() {
        const query = this.searchInput.value;
        const notes = this.database.searchUserNotes(query);
        this.renderNotes(notes);
    }

    // Filter by tag
    filterByTag(tag) {
        const notes = this.database.filterUserNotesByTag(tag);
        
        // Update UI to show selected tag
        this.filterTags.querySelectorAll('.tag-filter').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.trim().startsWith(tag)) {
                btn.classList.add('active');
            }
        });

        this.renderNotes(notes);
    }

    // Clear filter
    clearFilter() {
        this.filterTags.querySelectorAll('.tag-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        this.searchInput.value = '';
        this.renderNotes();
    }

    // ===== MODAL MANAGEMENT =====

    // Open new note modal
    openNewNoteModal() {
        this.currentEditingNoteId = null;
        this.modalTitle.textContent = '📝 Catatan Baru';
        this.noteTitle.value = '';
        this.noteContent.value = '';
        this.noteTags.value = '';
        this.deleteBtn.style.display = 'none';
        this.openModal();
        this.noteTitle.focus();
    }

    // Open edit note modal
    openEditNoteModal(noteId) {
        const note = this.database.getNoteById(noteId);
        if (!note) {
            this.showToast('Catatan tidak ditemukan!', 'error');
            return;
        }

        this.currentEditingNoteId = noteId;
        this.modalTitle.textContent = '✏️ Edit Catatan';
        this.noteTitle.value = note.title;
        this.noteContent.value = note.content;
        this.noteTags.value = note.tags.join(', ');
        this.deleteBtn.style.display = 'inline-block';
        this.openModal();
        this.noteTitle.focus();
    }

    // Open modal
    openModal() {
        this.noteModal.classList.add('show');
    }

    // Close modal
    closeModal() {
        this.noteModal.classList.remove('show');
        this.currentEditingNoteId = null;
        this.noteTitle.value = '';
        this.noteContent.value = '';
        this.noteTags.value = '';
    }

    // ===== NOTE OPERATIONS =====

    // Handle save note
    handleSaveNote() {
        const title = this.noteTitle.value.trim();
        const content = this.noteContent.value.trim();
        const tags = this.noteTags.value.trim();

        if (!title && !content) {
            this.showToast('Catatan tidak boleh kosong!', 'error');
            return;
        }

        let result;

        if (this.currentEditingNoteId) {
            // Update existing note
            result = this.database.updateUserNote(
                this.currentEditingNoteId,
                title,
                content,
                tags
            );
        } else {
            // Create new note
            result = this.database.addNoteForUser(title, content, tags);
        }

        if (result.success) {
            this.showToast(result.message, 'success');
            this.closeModal();
            this.renderNotes();
        } else {
            this.showToast(result.message, 'error');
        }
    }

    // Handle delete note
    handleDeleteNote() {
        if (!this.currentEditingNoteId) return;

        if (confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
            const result = this.database.deleteUserNote(this.currentEditingNoteId);

            if (result.success) {
                this.showToast(result.message, 'success');
                this.closeModal();
                this.renderNotes();
            } else {
                this.showToast(result.message, 'error');
            }
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

    // ===== HELPER FUNCTIONS =====

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Refresh display
    refresh() {
        this.renderNotes();
    }
}

// Export untuk digunakan di module lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
