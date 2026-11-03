// seed.js
// Mengisi basis data dengan 3 prodi dan 25 mahasiswa. Aman dijalankan berulang:
// data lama dihapus dulu.
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const Dermaga = require('./models/dermagaModel');
const Kapal = require('./models/kapalModel');

const NAMA = ['Andi', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Gita', 'Hadi', 'Indra', 'Joko',
  'Kiki', 'Lina', 'Maya', 'Nanda', 'Oka', 'Putri', 'Qori', 'Rina', 'Sari', 'Tono',
  'Umar', 'Vina', 'Wawan', 'Yuni', 'Zaki'];
const RUTE = ['Palembang', 'Indralaya', 'Prabumulih', 'Lubuklinggau'];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Dermaga.deleteMany({});
  await Kapal.deleteMany({});

  const dermaga = await Dermaga.insertMany([
    { kode: 'D001', nama: 'Dermaga A' },
    { kode: 'D002', nama: 'Dermaga B' },
    { kode: 'D003', nama: 'Dermaga C' },
  ]);

  const kapal = NAMA.map((nama, i) => ({
    nama,
    kode: `K${String(i + 1).padStart(3, '0')}`,
    jenis: ['speedboat', 'ketek', 'kapal_wisata'][i % 3],
    rute: { asal: RUTE[i % RUTE.length], tujuan: RUTE[(i + 1) % RUTE.length] },
    dermagaId: dermaga[i % 3]._id,
  }));
  await Kapal.insertMany(kapal);

  console.log(`Seed selesai: ${dermaga.length} dermaga, ${kapal.length} kapal`);
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err.message); process.exit(1); });