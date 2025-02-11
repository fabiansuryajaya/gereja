// routes/GET-home.js
module.exports = async function (fastify, options) {
  fastify.get('/', async (request, reply) => {
    return reply.sendFile('index.html'); // Mengirim file index.html
  });
};