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

// ---------- Route per modul ----------
app.use('/kapal', kapalRoutes);
app.use('/dermaga', dermagaRoutes);

// ---------- Handler 404 dan error handler (paling bawah) ----------
app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });

  const shutdown = async () => {
    server.close();
    await mongoose.disconnect();
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);

  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI belum diatur. Salin .env.example menjadi .env untuk mengaktifkan akses database.');
    return server;
  }

  mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('Terhubung ke MongoDB'))
    .catch((err) => console.error(`Koneksi MongoDB gagal: ${err.message}`));

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };