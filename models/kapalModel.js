const mongoose = require('mongoose');

const ruteSchema = new mongoose.Schema({
  dermagaAwal: String,
  dermagaTujuan: String,
}, { _id: false });


const KapalSchema = new mongoose.Schema({
  kode: { type: String, required: [true, 'kode wajib diisi'], unique: true, trim: true },
  nama: { type: String, required: [true, 'nama wajib diisi'], trim: true },
  kapasitas: { type: Number, required: [true, 'kapasitas wajib diisi'], min: [1, 'kapasitas minimal 1'] },
  jenis: { type: String, required: [true, 'jenis wajib diisi'], enum: ['speedboat', 'ketek', 'kapal_wisata'] },
  rute: { type: ruteSchema, required: [true, 'rute wajib diisi'] },
  dermagaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dermaga' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Kapal', KapalSchema);