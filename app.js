require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

const logger = require('./middlewares/logger');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');


const kapalRoutes = require('./routes/kapalRoutes');
const dermagaRoutes = require('./routes/dermagaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

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
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI belum diatur. Salin .env.example menjadi .env lalu isi konfigurasinya.');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Terhubung ke MongoDB');

  const server = app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });

  const shutdown = async () => {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

if (require.main === module) {
  startServer().catch(async (err) => {
    console.error(`Gagal menjalankan server: ${err.message}`);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };