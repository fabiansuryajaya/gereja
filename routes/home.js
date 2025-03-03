// routes/GET-home.js
module.exports = async function (fastify, options) {
  fastify.get('/home', async (request, reply) => {
    return reply.sendFile('home.html'); // Mengirim file index.html
  });
};