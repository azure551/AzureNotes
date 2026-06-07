// UI Manager - Mengelola tampilan dan interaksi
class UIManager {
    constructor(noteManager) {
        this.noteManager = noteManager;
        this.currentEditId = null;
        this.currentFilter = null;
        this.initializeElements();
    }

    // Inisialisasi elemen DOM
    initializeElements() {
        this.notesContainer = document.getElementById('notesContainer');
        this.searchInput = document.getElementById('searchInput');
        this.newNoteBtn = document.getElementById('newNoteBtn');
        this.modal = document.getElementById('noteModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.noteTitle = document.getElementById('noteTitle');
        this.noteContent = document.getElementById('noteContent');
        this.noteTags = document.getElementById('noteTags');
        this.saveBtn = document.getElementById('saveBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.deleteBtn = document.getElementById('deleteBtn');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.filterTags = document.getElementById('filterTags');
        this.toast = document.getElementById('toast');
    }

    // Render semua catatan
    renderNotes() {
        let notes = this.noteManager.searchNotes(this.searchInput.value);
        
        if (this.currentFilter) {
            notes = notes.filter(note => note.tags.includes(this.currentFilter));
        }

        if (notes.length === 0) {
            this.notesContainer.innerHTML = `
                <div class="empty-state">
                    <p>📭 Belum ada catatan</p>
                    <p class="empty-subtitle">Mulai dengan membuat catatan baru!</p>
                </div>
            `;
            return;
        }

        this.notesContainer.innerHTML = notes.map(note => this.createNoteCard(note)).join('');
        
        // Tambah event listeners ke note cards
        document.querySelectorAll('.note-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = parseInt(card.dataset.id);
                this.openEditModal(id);
            });
        });
    }

    // Buat card untuk satu catatan
    createNoteCard(note) {
        const tagsHTML = note.tags.map(tag => 
            `<span class="note-tag">${this.escapeHtml(tag)}</span>`
        ).join('');

        return `
            <div class="note-card" data-id="${note.id}">
                <div class="note-title">${this.escapeHtml(note.title)}</div>
                <div class="note-content">${this.escapeHtml(note.content)}</div>
                <div class="note-date">📅 ${note.updatedAt}</div>
                <div class="note-tags">${tagsHTML}</div>
            </div>
        `;
    }

    // Render filter tags
    renderFilterTags() {
        const tags = this.noteManager.getAllTags();
        
        if (tags.length === 0) {
            this.filterTags.innerHTML = '';
            return;
        }

        this.filterTags.innerHTML = tags.map(tag => {
            const count = this.noteManager.countByTag(tag);
            const isActive = this.currentFilter === tag ? 'active' : '';
            return `
                <button class="tag-btn ${isActive}" data-tag="${this.escapeHtml(tag)}">
                    ${this.escapeHtml(tag)} (${count})
                </button>
            `;
        }).join('');

        // Tambah event listeners ke filter buttons
        document.querySelectorAll('.tag-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tag = btn.dataset.tag;
                this.currentFilter = this.currentFilter === tag ? null : tag;
                this.renderFilterTags();
                this.renderNotes();
            });
        });
    }

    // Buka modal untuk catatan baru
    openNewModal() {
        this.currentEditId = null;
        this.modalTitle.textContent = 'Catatan Baru';
        this.noteTitle.value = '';
        this.noteContent.value = '';
        this.noteTags.value = '';
        this.deleteBtn.style.display = 'none';
        this.modal.classList.add('show');
    }

    // Buka modal untuk edit catatan
    openEditModal(id) {
        const note = this.noteManager.getNote(id);
        if (!note) return;

        this.currentEditId = id;
        this.modalTitle.textContent = 'Edit Catatan';
        this.noteTitle.value = note.title;
        this.noteContent.value = note.content;
        this.noteTags.value = note.tags.join(', ');
        this.deleteBtn.style.display = 'inline-flex';
        this.modal.classList.add('show');
    }

    // Tutup modal
    closeModal() {
        this.modal.classList.remove('show');
        this.currentEditId = null;
    }

    // Simpan catatan
    saveNote() {
        const title = this.noteTitle.value.trim();
        const content = this.noteContent.value.trim();
        const tags = this.noteTags.value.trim();

        if (!title || !content) {
            this.showToast('Judul dan konten tidak boleh kosong!', 'error');
            return;
        }

        if (this.currentEditId) {
            // Update existing note
            this.noteManager.updateNote(this.currentEditId, {
                title,
                content,
                tags
            });
            this.showToast('Catatan berhasil diperbarui! ✏️');
        } else {
            // Add new note
            this.noteManager.addNote({
                title,
                content,
                tags
            });
            this.showToast('Catatan baru berhasil dibuat! ✅');
        }

        this.closeModal();
        this.renderNotes();
        this.renderFilterTags();
    }

    // Hapus catatan
    deleteNote() {
        if (!this.currentEditId) return;

        if (confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
            this.noteManager.deleteNote(this.currentEditId);
            this.showToast('Catatan berhasil dihapus! 🗑️');
            this.closeModal();
            this.renderNotes();
            this.renderFilterTags();
        }
    }

    // Tampilkan toast notification
    showToast(message, type = 'success') {
        this.toast.textContent = message;
        this.toast.className = `toast show ${type}`;

        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }

    // Escape HTML untuk keamanan
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Attach event listeners
    attachEventListeners() {
        this.newNoteBtn.addEventListener('click', () => this.openNewModal());
        this.saveBtn.addEventListener('click', () => this.saveNote());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        this.deleteBtn.addEventListener('click', () => this.deleteNote());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        
        this.searchInput.addEventListener('input', () => {
            this.renderNotes();
        });

        // Tutup modal jika klik di luar
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Shortcut keyboard
        document.addEventListener('keydown', (e) => {
            // Ctrl+N atau Cmd+N untuk catatan baru
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.openNewModal();
            }
            // Esc untuk tutup modal
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }
}
