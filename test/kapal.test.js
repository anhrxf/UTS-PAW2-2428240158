const test = require('node:test');
const assert = require('node:assert/strict');
const Kapal = require('../models/kapalModel');
const controller = require('../controllers/kapalController');

function createResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function createQuery(data) {
  const calls = {};
  const query = {
    select(fields) {
      calls.projection = fields;
      return this;
    },
    sort(fields) {
      calls.sort = fields;
      return this;
    },
    skip(count) {
      calls.skip = count;
      return this;
    },
    limit(count) {
      calls.limit = count;
      return this;
    },
    populate(path, fields) {
      calls.populate = [path, fields];
      return this;
    },
    then(resolve, reject) {
      return Promise.resolve(data).then(resolve, reject);
    },
  };

  return { query, calls };
}

test('kapal schema requires kodeKapal, complete rute, and dermagaId', async () => {
  const kapal = new Kapal({
    nama: 'Kapal Uji',
    kapasitas: 20,
    jenis: 'ketek',
    rute: { dermagaAwal: 'Palembang' },
  });

  await assert.rejects(kapal.validate(), (error) => {
    assert.ok(error.errors.kodeKapal);
    assert.ok(error.errors['rute.dermagaTujuan']);
    assert.ok(error.errors.dermagaId);
    return true;
  });
  assert.equal(Kapal.schema.path('kodeKapal').options.unique, true);
});

test('GET kapal returns projected array and applies type filter', async () => {
  const rows = [{ kodeKapal: 'K001', nama: 'Kapal Uji', jenis: 'ketek' }];
  const { query, calls } = createQuery(rows);
  const originalFind = Kapal.find;
  Kapal.find = (filter) => {
    calls.filter = filter;
    return query;
  };
  const res = createResponse();

  try {
    await controller.getAll({ query: { jenis: 'ketek' } }, res);
  } finally {
    Kapal.find = originalFind;
  }

  assert.deepEqual(calls.filter, { jenis: 'ketek' });
  assert.equal(calls.projection, '_id kodeKapal nama kapasitas jenis');
  assert.deepEqual(res.body, rows);
  assert.ok(Array.isArray(res.body));
});

test('GET kapal by ID populates dermaga code and name', async () => {
  const row = {
    kodeKapal: 'K001',
    dermagaId: { kode: 'D001', nama: 'Dermaga Palembang' },
  };
  const { query, calls } = createQuery(row);
  const originalFindById = Kapal.findById;
  Kapal.findById = (id) => {
    calls.id = id;
    return query;
  };
  const res = createResponse();

  try {
    await controller.getById({ params: { id: 'kapal-id' } }, res);
  } finally {
    Kapal.findById = originalFindById;
  }

  assert.equal(calls.id, 'kapal-id');
  assert.deepEqual(calls.populate, ['dermagaId', 'kode nama']);
  assert.deepEqual(res.body, row);
});

test('GET kapal by unknown ID returns not found', async () => {
  const { query } = createQuery(null);
  const originalFindById = Kapal.findById;
  Kapal.findById = () => query;

  try {
    await assert.rejects(
      controller.getById({ params: { id: 'unknown-id' } }, createResponse()),
      { status: 404, message: 'Data tidak ditemukan' }
    );
  } finally {
    Kapal.findById = originalFindById;
  }
});
