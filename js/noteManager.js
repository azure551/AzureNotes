// Note Manager - Mengelola data catatan
class NoteManager {
    constructor() {
        this.notes = this.loadNotes();
    }

    // Load notes dari localStorage
    loadNotes() {
        const saved = localStorage.getItem('azureNotes');
        return saved ? JSON.parse(saved) : [];
    }

    // Save notes ke localStorage
    saveNotes() {
        localStorage.setItem('azureNotes', JSON.stringify(this.notes));
    }

    // Tambah catatan baru
    addNote(note) {
        const newNote = {
            id: Date.now(),
            title: note.title || 'Tanpa Judul',
            content: note.content || '',
            tags: this.parseTags(note.tags),
            createdAt: new Date().toLocaleString('id-ID'),
            updatedAt: new Date().toLocaleString('id-ID')
        };
        this.notes.unshift(newNote);
        this.saveNotes();
        return newNote;
    }

    // Update catatan
    updateNote(id, updates) {
        const note = this.notes.find(n => n.id === id);
        if (note) {
            note.title = updates.title || note.title;
            note.content = updates.content || note.content;
            note.tags = this.parseTags(updates.tags);
            note.updatedAt = new Date().toLocaleString('id-ID');
            this.saveNotes();
            return note;
        }
        return null;
    }

    // Hapus catatan
    deleteNote(id) {
        this.notes = this.notes.filter(n => n.id !== id);
        this.saveNotes();
    }

    // Dapatkan catatan by ID
    getNote(id) {
        return this.notes.find(n => n.id === id);
    }

    // Cari catatan berdasarkan text
    searchNotes(query) {
        if (!query.trim()) return this.notes;
        
        const q = query.toLowerCase();
        return this.notes.filter(note => 
            note.title.toLowerCase().includes(q) ||
            note.content.toLowerCase().includes(q) ||
            note.tags.some(tag => tag.toLowerCase().includes(q))
        );
    }

    // Filter catatan berdasarkan tag
    filterByTag(tag) {
        if (!tag) return this.notes;
        return this.notes.filter(note => note.tags.includes(tag));
    }

    // Parse tags dari string
    parseTags(tagString) {
        if (!tagString) return [];
        return tagString
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
    }

    // Dapatkan semua unique tags
    getAllTags() {
        const allTags = new Set();
        this.notes.forEach(note => {
            note.tags.forEach(tag => allTags.add(tag));
        });
        return Array.from(allTags).sort();
    }

    // Hitung notes by tag
    countByTag(tag) {
        return this.notes.filter(note => note.tags.includes(tag)).length;
    }
}

// Export untuk digunakan di module lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NoteManager;
}
