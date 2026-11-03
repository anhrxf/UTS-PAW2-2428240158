const mongoose = require('mongoose');

const dermagaSchema = new mongoose.Schema({
  kode: { type: String, required: [true, 'kode wajib diisi'], unique: true, trim: true, uppercase: true },
  nama: { type: String, required: [true, 'nama wajib diisi'], trim: true },
  kapasitas: { type: Number, required: [true, 'kapasitas wajib diisi'], min: [1, 'kapasitas minimal 1'] },
  jenis: { type: String, required: [true, 'jenis wajib diisi'], enum: ['penumpang', 'barang'] },
  rute: { type: String, required: [true, 'rute wajib diisi'], trim: true },
});

module.exports = mongoose.model('Dermaga', dermagaSchema);