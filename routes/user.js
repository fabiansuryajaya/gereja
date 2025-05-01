module.exports = async function (fastify, options) {
    // Tambah atau edit user
    fastify.post('/api/user', async (request, reply) => {
      const { username, password, status, edit } = request.body;
  
      if (!username || !password || status === undefined || edit === undefined) {
        return reply.status(400).send({ message: 'All fields are required.' });
      }
  
      try {
        const connection = await fastify.db;
  
        if (edit == -1) {
          // INSERT user baru
          const query = `INSERT INTO users (username, password, properties, status) VALUES (?, ?, ?, ?)`;
          await connection.execute(query, [username, password, '{}', status]);
          return reply.send({ message: 'User created successfully!' });
        } else {
          // UPDATE user yang sudah ada
          const query = `UPDATE users SET username = ?, password = ?, status = ? WHERE username = ?`;
          await connection.execute(query, [username, password, status, edit]);
          return reply.send({ message: 'User updated successfully!' });
        }
      } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: 'Internal server error.' });
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
        return reply.status(500).send({ message: 'Internal server error.' });
      }
    });
  };
  