const Kapal = require('../models/kapalModel');
const { errorHttp } = require('../middlewares/errorHandler');

const LIMIT_DEFAULT = 10;
const LIMIT_MAKS = 50;
const FIELD_SORT = ['kodeKapal', 'nama', 'jenis', 'createdAt'];
const FIELD_PROJECTION = '_id kodeKapal nama kapasitas jenis';

// Mengubah bilangan dari query string menjadi bilangan bulat yang aman
function angkaAman(nilai, bawaan, min, maks) {
  const n = parseInt(nilai, 10);
  if (Number.isNaN(n)) return bawaan;
  return Math.min(Math.max(n, min), maks);
}

exports.create = async (req, res) => {
  const kapal = await Kapal.create(req.body);
  res.status(201).json(kapal);
};

exports.getAll = async (req, res) => {
  const filter = {};
  if (req.query.jenis) {
    filter.jenis = String(req.query.jenis);
  }

  if (req.query.dermagaId) {
    filter.dermagaId = String(req.query.dermagaId);
  }
  if (req.query.dermagaAwal) {
    filter['rute.dermagaAwal'] = String(req.query.dermagaAwal);
  }
  if (req.query.dermagaTujuan) {
    filter['rute.dermagaTujuan'] = String(req.query.dermagaTujuan);
  }

  const page = angkaAman(req.query.page, 1, 1, Number.MAX_SAFE_INTEGER);
  const limit = angkaAman(req.query.limit, LIMIT_DEFAULT, 1, LIMIT_MAKS);
  // ?sort=nama untuk urutan naik atau ?sort=-nama untuk urutan turun.
  const sortParam = String(req.query.sort || '-createdAt');
  const arah = sortParam.startsWith('-') ? -1 : 1;
  const sortField = sortParam.replace(/^-/, '');
  if (!FIELD_SORT.includes(sortField)) {
    throw errorHttp(400, `sort hanya boleh: ${FIELD_SORT.join(', ')}`);
  }
  const data = await Kapal.find(filter)
    .select(FIELD_PROJECTION)
    .sort({ [sortField]: arah, _id: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json(data);
};

exports.getById = async (req, res) => {
  const data = await Kapal.findById(req.params.id).populate('dermagaId', 'kode nama');
  if (!data) throw errorHttp(404, 'Data tidak ditemukan');
  res.json(data);
};

exports.update = async (req, res) => {
  const data = await Kapal.findByIdAndUpdate(
    req.params.id,
    req.body,
    { returnDocument: 'after', runValidators: true }
  );
  if (!data) throw errorHttp(404, 'Data tidak ditemukan');
  res.json(data);
};

exports.remove = async (req, res) => {
  const data = await Kapal.findByIdAndDelete(req.params.id);
  if (!data) throw errorHttp(404, 'Data tidak ditemukan');
  res.status(204).send();
};