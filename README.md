# AzureNotes - Web App Catatan

Aplikasi web untuk membuat, mengedit, dan mengelola catatan dengan antarmuka yang user-friendly.

## Fitur
- ✅ Membuat catatan baru
- ✅ Mengedit catatan
- ✅ Menghapus catatan
- ✅ Pencarian catatan
- ✅ Kategori/Tag
- ✅ Penyimpanan lokal (LocalStorage)
- ✅ Interface responsif

## Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Storage**: Browser LocalStorage
- **Build**: Optional (Webpack, Vite untuk production)

## Instalasi

1. Clone repository:
```bash
git clone https://github.com/azure551/AzureNotes.git
cd AzureNotes
```

2. Buka file `index.html` di browser atau jalankan local server:
```bash
# Dengan Python
python -m http.server 8000

# Atau dengan Node.js
npx serve .
```

3. Akses aplikasi di `http://localhost:8000`

## Struktur Folder

```
AzureNotes/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── noteManager.js
│   └── ui.js
├── assets/
│   └── icons/
├── README.md
└── package.json (optional)
```

## Penggunaan

1. **Buat Catatan**: Klik tombol "Catatan Baru" dan mulai ketik
2. **Edit Catatan**: Klik pada catatan untuk mengeditnya
3. **Hapus Catatan**: Klik tombol hapus pada setiap catatan
4. **Cari Catatan**: Gunakan search bar untuk mencari catatan
5. **Tambah Tag**: Kelompokkan catatan berdasarkan kategori

## Kontribusi

Silakan fork dan buat pull request untuk kontribusi.

## Lisensi

MIT License
