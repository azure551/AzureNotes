// Main App - Inisialisasi aplikasi
document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi manager
    const noteManager = new NoteManager();
    const uiManager = new UIManager(noteManager);

    // Render awal
    uiManager.renderNotes();
    uiManager.renderFilterTags();

    // Attach event listeners
    uiManager.attachEventListeners();

    // Log untuk development
    console.log('🚀 AzureNotes App Started');
    console.log('📝 Total notes:', noteManager.notes.length);
});
