module.exports = async function (fastify, options) {
  // Tambah atau edit user
  fastify.post('/api/user', async (request, reply) => {
    const { username, password, status, edit, properties } = request.body;

    if (!username || !password || status === undefined || edit === undefined || !properties) {
      return reply.status(400).send({ message: 'Semua field harus diisi.' });
    }

    let parsedProperties;
    try {
      parsedProperties = typeof properties === 'string' ? JSON.parse(properties) : properties;
    } catch (err) {
      return reply.status(400).send({ message: 'Format properties tidak valid.' });
    }

    if (!Array.isArray(parsedProperties.menus) || parsedProperties.menus.length === 0) {
      return reply.status(400).send({ message: 'Minimal satu menu akses harus dipilih.' });
    }

    try {
      const connection = await fastify.db;

      if (edit == -1 || edit === '-1') {
        // INSERT user baru
        const query = `INSERT INTO users (username, password, properties, status) VALUES (?, ?, ?, ?)`;
        await connection.execute(query, [
          username,
          password,
          JSON.stringify(parsedProperties),
          status
        ]);
        return reply.send({ message: 'User berhasil dibuat!' });
      } else {
        // UPDATE user yang sudah ada
        const query = `UPDATE users SET username = ?, password = ?, properties = ?, status = ? WHERE username = ?`;
        await connection.execute(query, [
          username,
          password,
          JSON.stringify(parsedProperties),
          status,
          edit
        ]);
        return reply.send({ message: 'User berhasil diperbarui!' });
      }
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ message: 'Terjadi kesalahan pada server.' });
    }
  });

  // Ambil semua user
  fastify.get('/api/users', async (request, reply) => {
    try {
      const connection = await fastify.db;
      const [rows] = await connection.execute(`SELECT username, password, properties, status FROM users`);

      return reply.send({ users: rows });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ message: 'Gagal mengambil data user.' });
    }
  });
};
