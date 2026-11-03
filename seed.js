require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const Dermaga = require('./models/dermagaModel');
const Kapal = require('./models/kapalModel');

const NAMA_KAPAL = [
  'Andi', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Gita', 'Hadi', 'Indra', 'Joko',
  'Kiki', 'Lina', 'Maya', 'Nanda', 'Oka', 'Putri', 'Qori', 'Rina', 'Sari', 'Tono',
  'Umar', 'Vina', 'Wawan', 'Yuni', 'Zaki',
];
const RUTE = ['Palembang', 'Indralaya', 'Prabumulih', 'Lubuklinggau'];
const DERMAGA = [
  { kode: 'D001', nama: 'Dermaga Palembang', kapasitas: 100, jenis: 'penumpang', rute: 'Palembang' },
  { kode: 'D002', nama: 'Dermaga Indralaya', kapasitas: 80, jenis: 'penumpang', rute: 'Indralaya' },
  { kode: 'D003', nama: 'Dermaga Prabumulih', kapasitas: 60, jenis: 'barang', rute: 'Prabumulih' },
];

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI belum diatur pada file .env');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  await Dermaga.bulkWrite(DERMAGA.map((item) => ({
    updateOne: {
      filter: { kode: item.kode },
      update: { $set: item },
      upsert: true,
    },
  })));

  const dermaga = await Dermaga.find({ kode: { $in: DERMAGA.map((item) => item.kode) } });
  const dermagaByKode = new Map(dermaga.map((item) => [item.kode, item._id]));
  const kapal = NAMA_KAPAL.map((nama, i) => ({
    nama,
    kodeKapal: `K${String(i + 1).padStart(3, '0')}`,
    kapasitas: 20 + (i % 5) * 10,
    jenis: ['speedboat', 'ketek', 'kapal_wisata'][i % 3],
    rute: {
      dermagaAwal: RUTE[i % RUTE.length],
      dermagaTujuan: RUTE[(i + 1) % RUTE.length],
    },
    dermagaId: dermagaByKode.get(DERMAGA[i % DERMAGA.length].kode),
  }));
  await Kapal.bulkWrite(kapal.map((item) => ({
    updateOne: {
      filter: { kodeKapal: item.kodeKapal },
      update: { $set: item },
      upsert: true,
    },
  })));

  console.log(`Seed selesai: ${dermaga.length} dermaga, ${kapal.length} kapal`);
}

main()
  .catch((err) => {
    console.error(`Seed gagal: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());