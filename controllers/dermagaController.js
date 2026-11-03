const Prodi = require('../models/dermagaModel');
exports.create = async (req, res) => {
  try {
    const dermaga = await Dermaga.create(req.body);
    res.status(201).json(dermaga);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  const filter = {};
  if (req.query.rute) {
    filter['dermagaAwal.rute'] = String(req.query.rute);
  }
  if (req.query.dermaga) {
    const dermaga = await Dermaga.findOne({ kode: String(req.query.dermaga).toUpperCase() });
    // Kode dermaga tidak dikenal -> hasil kosong ($in: [] tidak cocok dengan apa pun)
    filter.dermagaId = dermaga ? dermaga._id : { $in: [] };
  }
  const data = await Dermaga.find(filter);
  res.json(data);
};