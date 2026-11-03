function errorHttp(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function notFoundHandler(req, res) {
  res.status(404).json({ message: `Rute ${req.method} ${req.originalUrl} tidak ditemukan` });
}

function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Format JSON tidak valid' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  if (err.name === 'CastError' || err.name === 'BSONError') {
    return res.status(400).json({ message: 'ID atau nilai data tidak valid' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Data dengan nilai unik tersebut sudah ada' });
  }

  const status = err.status || 500;

  if (status === 500) {
    console.error(err.stack);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }

  res.status(status).json({ message: err.message });
}

module.exports = { errorHttp, notFoundHandler, errorHandler };