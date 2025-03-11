# Samp Boombox Discord Bot

Samp Boombox Discord Bot adalah proyek yang diciptakan khusus untuk para pemain GTA SAMP yang suka memutar musik di boombox. Karena boombox di GTA SAMP harus menggunakan direct link, proyek ini hadir untuk mempermudah pengguna: cukup upload file MP3 melalui Discord, dan bot akan menghasilkan direct link yang siap diputar di boombox!

## Fitur

- **Uploader MP3:** Hanya file dengan ekstensi `.mp3` yang diizinkan untuk diupload.
- **Batas Ukuran File:** Maksimal ukuran file yang dapat diupload adalah 15MB.
- **Direct Link:** Setelah file diupload, bot memberikan satu direct link yang dapat langsung diklik dan digunakan di boombox.
- **Auto Delete:** File yang diupload akan disimpan selama 7 hari, kemudian dihapus secara otomatis.
- **Persistent Storage:** Data file disimpan secara persisten (melalui file JSON), sehingga informasi upload tidak hilang meskipun bot di-restart.

## Teknologi yang Digunakan

- **Node.js:** Runtime environment untuk menjalankan aplikasi JavaScript di server.
- **Discord.js:** Library untuk interaksi dengan Discord API.
- **Express:** Untuk menjalankan web server yang menyajikan file secara statis.
- **Axios:** Untuk mengunduh file dari URL attachment.
- **dotenv:** Untuk mengelola variabel environment.

## Struktur Proyek

```
my-discord-uploader/
├── .env                # Konfigurasi environment (DISCORD_BOT_TOKEN, BASE_URL, PORT)
├── index.js            # Entry point aplikasi
├── package.json        # Dependency dan metadata proyek
├── storage.json        # Penyimpanan data upload (dibuat otomatis)
├── commands/
│   ├── upload.js       # Command untuk mengupload file MP3
│   ├── myfile.js       # Command untuk melihat file yang telah diupload
│   ├── removefile.js   # Command untuk menghapus file yang diupload
│   └── statusserver.js # Command untuk menampilkan status server
├── utils/
│   ├── fileUtils.js    # Fungsi utilitas (misal: format durasi)
│   └── storage.js      # Fungsi untuk load & save data ke storage.json
└── uploads/            # Folder untuk menyimpan file yang diupload
```

## Cara Install dan Menjalankan

1. **Clone Repository:**
   ```bash
   git clone https://github.com/YudhaUNSP/samp-boombox-discord
   cd samp-boombox-discord
   ```

2. **Install Dependencies:**
   Pastikan Node.js sudah terinstall, kemudian jalankan:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment:**
   Buat file `.env` di root proyek dengan isi:
   ```ini
   DISCORD_BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN
   BASE_URL=http://yourdomain.com or http://localhost:3000
   PORT=3000
   ```
   Ganti `YOUR_DISCORD_BOT_TOKEN` dengan token bot Discord Anda.

4. **Jalankan Bot:**
   ```bash
   npm start
   ```
   Bot akan online dan server Express akan berjalan di port yang sudah ditentukan.

## Cara Penggunaan

- **/upload:**  
  Gunakan command ini untuk mengupload file MP3. Pastikan file yang diupload berukuran tidak lebih dari 15MB. Setelah file berhasil diupload, bot akan mengembalikan satu direct link yang dapat langsung digunakan di boombox GTA SAMP.

- **/myfile:**  
  Menampilkan daftar file yang telah kamu upload beserta direct link dan sisa waktu sebelum file dihapus.

- **/removefile:**  
  Menghapus file tertentu yang sudah kamu upload.

- **/statusserver:**  
  Menampilkan status server serta jumlah file yang tersimpan.

## Catatan

- Proyek ini diciptakan untuk memudahkan pemain GTA SAMP dalam memutar musik di boombox dengan menggunakan direct link.
- File MP3 yang diupload disimpan di folder `uploads/` dan data file di-track melalui `storage.json`.
- File akan otomatis dihapus setelah 7 hari. Jika bot offline selama periode tersebut, file akan dihapus saat bot online kembali.
- Untuk penggunaan di lingkungan produksi, pertimbangkan hosting pada server publik dan penggunaan database untuk penyimpanan data yang lebih handal.

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).