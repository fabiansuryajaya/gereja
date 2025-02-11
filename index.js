// index.js
const fastify = require('fastify')({ logger: true });
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');

// Konfigurasi koneksi database
const dbConfig = {
  host: 'localhost', // Ganti dengan host database Anda
  user: 'root',      // Ganti dengan username database Anda
  password: '',      // Ganti dengan password database Anda
  database: 'greja'  // Ganti dengan nama database Anda
};

// Inisialisasi koneksi database
const initDbConnection = async () => {
  const connection = await mysql.createConnection(dbConfig);
  return connection;
};

// Mengatur folder statis untuk file HTML dan CSS
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
});

// Menyimpan koneksi database di Fastify
fastify.decorate('db', initDbConnection());

// Membaca folder routes dan mendaftarkan semua file sebagai rute
const routesPath = path.join(__dirname, 'routes');

// Rute untuk mengembalikan file HTML berdasarkan nama rute
fastify.get('/content/:page', async (request, reply) => {
  const { page } = request.params;
  const filePath = path.join(__dirname, 'public', `${page}.html`);

  try {
    // Cek apakah file ada
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return { content }; // Mengembalikan konten HTML
    } else {
      return reply.status(404).send({ message: 'Page not found' });
    }
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
});

fs.readdirSync(routesPath).forEach(file => {
  if (file.endsWith('.js')) {
    const route = require(path.join(routesPath, file));
    fastify.register(route);
  }
});

// Menjalankan server
const start = async () => {
  try {
    await fastify.listen(3000);
    fastify.log.info(`Server listening on http://localhost:3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();