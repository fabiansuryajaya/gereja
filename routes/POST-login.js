// routes/POST-login.js
module.exports = async function (fastify, options) {
  fastify.post('/api/login', async (request, reply) => {
    const { username, password } = request.body;

    try {
      // Mengambil koneksi dari Fastify
      const connection = await fastify.db;

      // Mencari pengguna di database
      const [rows] = await connection.execute('SELECT * FROM users WHERE username = ? and status = 1', [username]);

      if (rows.length > 0 && rows[0].password === password) {
        return reply.send({ message: 'Login successful!' });
      } else {
        return reply.status(401).send({ message: 'Invalid username or password.' });
      }
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ message: 'Internal server error.' });
    }
  });
};