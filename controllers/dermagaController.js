const Dermaga = require('../models/dermagaModel');
exports.create = async (req, res) => {
  const dermaga = await Dermaga.create(req.body);
  res.status(201).json(dermaga);
};

exports.getAll = async (req, res) => {
  const filter = {};
  if (req.query.kode) {
    filter.kode = String(req.query.kode).toUpperCase();
  }
  if (req.query.nama) {
    filter.nama = String(req.query.nama);
  }
  const data = await Dermaga.find(filter);
  res.json(data);
};