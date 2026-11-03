require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

mongoose.set('bufferCommands', false);

const logger = require('./middlewares/logger');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');


const kapalRoutes = require('./routes/kapalRoutes');
const dermagaRoutes = require('./routes/dermagaRoutes');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ---------- Middleware global ----------
app.use(logger);
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

// ---------- Route dasar ----------
app.get('/', (req, res) => {
  res.send('Server Express.js berjalan!');
});

function requireDatabase(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database MongoDB belum terhubung' });
  }
  next();
}

// ---------- Route per modul ----------
app.use('/kapal', requireDatabase, kapalRoutes);
app.use('/dermaga', requireDatabase, dermagaRoutes);

// ---------- Handler 404 dan error handler (paling bawah) ----------
app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI belum diatur. Salin .env.example menjadi .env untuk mengaktifkan akses database.');
  }

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('Terhubung ke MongoDB');

  const server = app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });

  const shutdown = async () => {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    await mongoose.disconnect();
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);

  return server;
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error(`Gagal menjalankan server: ${err.message}`);
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };