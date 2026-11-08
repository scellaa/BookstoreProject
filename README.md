#  Tandai Shop

Aplikasi web toko buku sederhana berbasis **HTML, CSS, dan JavaScript murni** (tanpa framework dan tanpa backend). Pengguna dapat masuk ke akun, melihat koleksi dan stok buku, memasukkan buku ke keranjang, melakukan checkout, menerima struk, melihat riwayat pesanan, dan melacak pengiriman.

Seluruh data pesanan, keranjang, dan sesi login disimpan di `localStorage` browser, sehingga proyek ini bisa langsung dijalankan tanpa instalasi apa pun.

---

##  Fitur

| Fitur | Keterangan |
|---|---|
| **Sign In / Sign Up** | Login dengan akun bawaan (`data.js`) atau akun yang didaftarkan sendiri lewat Sign Up. |
| **Dashboard** | Sapaan sesuai waktu lokal (pagi / siang / sore / malam) lengkap dengan nama pengguna, tanggal, dan jam. Kartu statistik dihitung otomatis dari data buku. |
| **Our Collection and Stock** | Menampilkan sampul, judul, kategori, harga, jumlah stok, dan status stok (*Available*, *Low Stock*, *Out of Stock*). Dilengkapi pencarian dan filter kategori. |
| **Shopping Cart** | Drawer keranjang: tambah, kurangi, hapus item, dan batas jumlah sesuai stok. |
| **Checkout + Struk** | Setelah *Place Order*, struk muncul sebagai pop-up (Order ID, nomor resi, produk, qty, total, estimasi tiba) dan bisa dicetak. |
| **View Order** | Riwayat pesanan dengan nomor resi, kurir, estimasi pengiriman, nama produk, qty, dan total harga. |
| **Tracking Your Order** | Pelacakan lewat nomor DO atau nomor resi dengan *progress bar* 4 tahap, detail ekspedisi, tanggal kirim, tanggal terima, jenis paket, total pembayaran, dan riwayat perjalanan. |

---


##  Akun Demo

| Nama | Email | Password | Role |
|---|---|---|---|
| Rina Wulandari | rina@gmail.com | rina123 | User |
| Agus Pranoto | agus@gmail.com | agus123 | User |
| Siti Marlina | siti@gmail.com | siti123 | Admin |

Anda juga dapat membuat akun baru lewat **Sign Up**.

---

##  Mencoba Tracking

Buka **Dashboard → Services → Tracking Your Order**, lalu masukkan salah satu nomor berikut:

| Nomor DO | Kondisi |
|---|---|
| `20230012` | Dalam perjalanan (JNE) |
| `20230013` | Sudah diterima (Pos Indonesia) |

Pesanan yang dibuat lewat checkout mendapat nomor resi sendiri (awalan `TDI`) dan bisa dilacak dari tombol **Track This Order** di halaman View Order.

---

##  Sumber Data

Semua data awal ada di `data.js`:

- `dataPengguna`: akun bawaan.
- `dataKatalogBuku`: buku ajar (kode, nama, edisi, stok, harga, sampul).
- `dataTracking`: contoh data pengiriman berdasarkan nomor DO.

Buku genre (romance, action, dan lainnya) didefinisikan di `script.js` pada array `genreBooks`.

Data yang disimpan di browser:

| Kunci `localStorage` | Isi |
|---|---|
| `tandaiUser` | Sesi pengguna yang sedang login |
| `tandaiUsers` | Akun yang mendaftar lewat Sign Up |
| `tandaiCart` | Isi keranjang |
| `tandaiOrders` | Riwayat pesanan |

---

##  Palet Warna

| Warna | Kode |
|---|---|
| ![#0f1f17](https://placehold.co/16x16/0f1f17/0f1f17.png) | `#0f1f17` |
| ![#1e3a2e](https://placehold.co/16x16/1e3a2e/1e3a2e.png) | `#1e3a2e` |
| ![#3d4337](https://placehold.co/16x16/3d4337/3d4337.png) | `#3d4337` |
| ![#3e5a3f](https://placehold.co/16x16/3e5a3f/3e5a3f.png) | `#3e5a3f` |
| ![#6b7f67](https://placehold.co/16x16/6b7f67/6b7f67.png) | `#6b7f67` |
| ![#c7cbb8](https://placehold.co/16x16/c7cbb8/c7cbb8.png) | `#c7cbb8` |

Font: **Montserrat**. Ikon: **Font Awesome 6**.

---

##  Teknologi

- HTML5
- CSS3 (Flexbox dan Grid)
- JavaScript (ES6+)
- [Font Awesome](https://fontawesome.com/) via CDN
- [Google Fonts: Montserrat](https://fonts.google.com/specimen/Montserrat)

---

##  Catatan dan Keterbatasan

Proyek ini dibuat untuk **pembelajaran/demo**, bukan untuk produksi:

- Tidak ada backend. Login hanya mencocokkan data di `data.js` dan `localStorage`, dan **password disimpan tanpa enkripsi**. Jangan gunakan password asli.
- Data pesanan hanya ada di browser yang digunakan; menghapus data situs akan menghapus riwayat pesanan.
- Stok buku tidak berkurang setelah pesanan dibuat.
- Pembayaran, ekspedisi, dan estimasi pengiriman bersifat simulasi.
- Tombol *Forgot your password?*, login sosial media, dan formulir Contact belum berfungsi.

---

##  Rencana Pengembangan

- [ ] Backend dan database (autentikasi dengan hash password)
- [ ] Stok berkurang otomatis setelah checkout
- [ ] Panel admin untuk mengelola buku dan status pesanan
- [ ] Integrasi pembayaran dan API ekspedisi
- [ ] Formulir Contact yang terhubung ke email

---
