require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const Dermaga = require('./models/dermagaModel');
const Kapal = require('./models/kapalModel');

const NAMA_KAPAL = [
  'Sriwijaya Explorer', 'Musi Indah', 'Ampera Express', 'Kuto Besak Star', 'Kapal Musi Raya',
  'Segentar Alam', 'Gending Sriwijaya', 'Ratu Sinuhun', 'Mahameru Musi', 'Lancang Kuning',
  'Putri Kemaro', 'Ketek Barokah', 'Ketek Jaya', 'Ketek Berkah Musi', 'Ketek Harapan',
  'Speedboat Kilat 01', 'Speedboat Kilat 02', 'Speedboat Musi Fast', 'Speedboat Anugerah', 'Speedboat Bahari',
  'Wisata Musi Elok', 'Wisata Belida', 'Wisata Kemaro Indah', 'Pesona Musi', 'Sultan Mahmud Badaruddin',
];

const DERMAGA = [
  { kode: 'DRM01', nama: 'Dermaga Benteng Kuto Besak' },
  { kode: 'DRM02', nama: 'Dermaga 16 Ilir' },
  { kode: 'DRM03', nama: 'Dermaga Tangga Buntung' },
  { kode: 'DRM04', nama: 'Dermaga Pulau Kemaro' },
];

const RUTE_DERMAGA = [
  { awal: 'Dermaga Benteng Kuto Besak', tujuan: 'Dermaga Pulau Kemaro' },
  { awal: 'Dermaga 16 Ilir', tujuan: 'Dermaga Benteng Kuto Besak' },
  { awal: 'Dermaga Tangga Buntung', tujuan: 'Dermaga 16 Ilir' },
  { awal: 'Dermaga Benteng Kuto Besak', tujuan: 'Dermaga Tangga Buntung' },
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
  const kapal = NAMA_KAPAL.map((nama, i) => {
    const dermagaKode = DERMAGA[i % DERMAGA.length].kode;
    const rute = RUTE_DERMAGA[i % RUTE_DERMAGA.length];
    return {
      kodeKapal: `KPL-${String(i + 1).padStart(2, '0')}`,
      nama,
      kapasitas: 10 + (i % 6) * 5,
      jenis: ['speedboat', 'ketek', 'kapal_wisata'][i % 3],
      rute: {
        dermagaAwal: rute.awal,
        dermagaTujuan: rute.tujuan,
      },
      dermagaId: dermagaByKode.get(dermagaKode),
    };
  });
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