function cekApiKey(req, res, next) {
  if (!process.env.API_KEY) {
    return res.status(503).json({ message: 'API_KEY belum dikonfigurasi di server' });
  }

  const apiKey = req.headers['x-api-key'];

  if (typeof apiKey !== 'string' || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ message: 'API key tidak valid' });
  }

  next();
}

module.exports = cekApiKey;