# REST API Dermaga dan Kapal

API Express.js dengan MongoDB untuk mengelola data dermaga dan kapal.

## Persiapan

1. Pastikan Node.js, npm, dan MongoDB sudah terpasang dan MongoDB sedang berjalan.
2. Pasang dependensi dari folder proyek:

	```powershell
	npm install
	```

3. Buat file konfigurasi lokal dengan menyalin `.env.example` menjadi `.env`, lalu sesuaikan nilainya. Jangan commit file `.env` karena berisi konfigurasi privat.

	```powershell
	Copy-Item .env.example .env
	```

4. Jalankan server mode pengembangan:

	```powershell
	npm run dev
	```

Server tersedia di `http://localhost:3000`. Endpoint baca dapat digunakan tanpa API key; endpoint tulis memerlukan header `x-api-key` yang nilainya sama dengan `API_KEY` pada `.env`.

## Endpoint

- `GET /kapal` — daftar kapal. Mendukung `page`, `limit`, `sort`, `jenis`, `dermagaId`, `dermagaAwal`, dan `dermagaTujuan`.
- `GET /kapal/:id` — detail kapal.
- `POST /kapal`, `PUT /kapal/:id`, `DELETE /kapal/:id` — kelola kapal (wajib API key).
- `GET /dermaga` — daftar dermaga. Mendukung filter `kode`, `jenis`, dan `rute`.
- `POST /dermaga` — tambah dermaga (wajib API key).
- `GET /` — pemeriksaan server.

Opsional, isi data contoh tanpa menghapus dokumen lain:

```powershell
npm run seed
```

