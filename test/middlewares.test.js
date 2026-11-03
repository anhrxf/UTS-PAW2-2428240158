const test = require('node:test');
const assert = require('node:assert/strict');
const cekApiKey = require('../middlewares/cekApiKey');
const { errorHandler } = require('../middlewares/errorHandler');

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

test('API key middleware rejects requests if server key is not configured', () => {
  const previousKey = process.env.API_KEY;
  delete process.env.API_KEY;
  const res = createResponse();

  cekApiKey({ headers: {} }, res, () => assert.fail('next should not be called'));

  assert.equal(res.statusCode, 503);
  if (previousKey === undefined) delete process.env.API_KEY;
  else process.env.API_KEY = previousKey;
});

test('API key middleware rejects an incorrect key', () => {
  const previousKey = process.env.API_KEY;
  process.env.API_KEY = 'test-secret';
  const res = createResponse();

  cekApiKey({ headers: { 'x-api-key': 'wrong-key' } }, res, () => assert.fail('next should not be called'));

  assert.equal(res.statusCode, 401);
  if (previousKey === undefined) delete process.env.API_KEY;
  else process.env.API_KEY = previousKey;
});

test('API key middleware allows the configured key', () => {
  const previousKey = process.env.API_KEY;
  process.env.API_KEY = 'test-secret';
  const res = createResponse();
  let nextCalled = false;

  cekApiKey({ headers: { 'x-api-key': 'test-secret' } }, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
  if (previousKey === undefined) delete process.env.API_KEY;
  else process.env.API_KEY = previousKey;
});

test('error handler reports duplicate records as conflict', () => {
  const res = createResponse();

  errorHandler({ code: 11000 }, {}, res, () => {});

  assert.equal(res.statusCode, 409);
});
