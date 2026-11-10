# REST API Kapal Wisata Sungai (Topik 35)

API Express.js dan MongoDB untuk mengelola data operasional kapal wisata sungai dan dermaga.

- **Mahasiswa**: M. Fadhil Anhar (2428240158)
- **Topik**: Topik 35. Kapal Wisata Sungai
- **Entity Utama**: Model `Kapal`, endpoint `/kapal`
- **Entity Pendukung**: Model `Dermaga`, endpoint `/dermaga`

## Persiapan

1. Pastikan Node.js, npm, dan MongoDB sudah terpasang dan MongoDB sedang berjalan.
2. Pasang dependensi dari folder proyek:

	```powershell
	npm ci
	```

3. Buat file konfigurasi lokal dengan menyalin `.env.example` menjadi `.env`, lalu sesuaikan nilainya:

	```powershell
	Copy-Item .env.example .env
	```

4. Jalankan server mode pengembangan:

	```powershell
	npm run dev
	```

Server berjalan di `http://localhost:3000`. Endpoint baca (`GET`) dapat diakses langsung; endpoint tulis (`POST`, `PUT`, `DELETE`) memerlukan header `x-api-key` dengan nilai yang cocok dengan `API_KEY` di `.env`.

Untuk mengisi data awal ke basis data:

```powershell
npm run seed
```

## Spesifikasi Model dan Data

### 1. Model Dermaga (`/dermaga`)
- `kode`: String, wajib, unik, trim, uppercase (contoh: `DRM01`)
- `nama`: String, wajib, trim (contoh: `Dermaga Benteng Kuto Besak`)

Contoh body `POST /dermaga`:
```json
{
  "kode": "DRM01",
  "nama": "Dermaga Benteng Kuto Besak"
}
```

### 2. Model Kapal (`/kapal`)
- `kodeKapal`: String, wajib, unik, trim (contoh: `KPL-01`)
- `nama`: String, wajib, trim
- `kapasitas`: Number, wajib, minimal 1
- `jenis`: String, wajib, trim (contoh: `speedboat`, `ketek`, `kapal_wisata`)
- `rute`: Subdocument (embedding) `{ dermagaAwal: String, dermagaTujuan: String }`, tanpa `_id`
- `dermagaId`: ObjectId (referencing), wajib, ref: `'Dermaga'`
- `createdAt`: Date, bawaan waktu data dibuat

Contoh body `POST /kapal`:
```json
{
  "kodeKapal": "KPL-01",
  "nama": "Contoh nama",
  "kapasitas": 11,
  "jenis": "speedboat",
  "rute": {
    "dermagaAwal": "Contoh dermagaAwal",
    "dermagaTujuan": "Contoh dermagaTujuan"
  },
  "dermagaId": "<_id Dermaga>"
}
```

## Endpoint

- `GET /kapal` — daftar kapal dalam bentuk array. Menggunakan projection field: `_id`, `kodeKapal`, `nama`, `kapasitas`, `jenis`. Mendukung filter `?jenis=ketek` serta pagination opsional `?page=1&limit=10`.
- `GET /kapal/:id` — detail kapal dengan `dermagaId` yang ter-populate (`kode` dan `nama`).
- `POST /kapal` — tambah kapal baru (wajib header `x-api-key`).
- `PUT /kapal/:id` — perbarui data kapal (wajib header `x-api-key`).
- `DELETE /kapal/:id` — hapus data kapal (wajib header `x-api-key`).
- `GET /dermaga` — daftar dermaga. Mendukung filter `?kode=DRM01` dan `?nama=...`.
- `POST /dermaga` — tambah dermaga baru (wajib header `x-api-key`).
- `GET /` — pemeriksaan status server.

## Alasan Desain Data Model

- **Embedding (`rute: { dermagaAwal, dermagaTujuan }`)**:
  Rute selalu dibaca bersama kapalnya dan tidak pernah dicari atau diubah sendiri, jadi disimpan di dalam dokumen kapal agar satu kali baca sudah lengkap tanpa query tambahan. Isinya kecil dan tetap (dua nama dermaga), sehingga dokumen tidak membengkak.

- **Referencing (`dermagaId`)**:
  Satu dermaga bisa dipakai banyak kapal, punya kode dan nama sendiri, dan datanya bisa berubah. Dengan menyimpan hanya `dermagaId`, perubahan cukup dilakukan di satu tempat, dan detailnya diambil lewat populate saat `GET /kapal/:id`.
