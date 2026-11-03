const Dermaga = require('../models/dermagaModel');
exports.create = async (req, res) => {
  const dermaga = await Dermaga.create(req.body);
  res.status(201).json(dermaga);
};

exports.getAll = async (req, res) => {
  const filter = {};
  if (req.query.rute) {
    filter.rute = String(req.query.rute);
  }
  if (req.query.jenis) {
    filter.jenis = String(req.query.jenis);
  }
  if (req.query.kode) {
    filter.kode = String(req.query.kode).toUpperCase();
  }
  const data = await Dermaga.find(filter);
  res.json(data);
};