module.exports = async function (fastify, options) {
    // Rute untuk mendapatkan semua saldo awal
    fastify.get('/api/saldo-awal', async (request, reply) => {
        try {
            const connection = await fastify.db;
            const [rows] = await connection.execute('SELECT * FROM balance');
            return reply.send({ saldo: rows });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: 'Internal server error.' });
        }
    });

    // Rute untuk mendapatkan saldo awal berdasarkan tahun
    fastify.get('/api/saldo-awal/:tahun', async (request, reply) => {
        const { tahun } = request.params;
        try {
            const connection = await fastify.db;
            const [rows] = await connection.execute('SELECT * FROM balance WHERE year = ?', [tahun]);
            if (rows.length === 0) {
                return reply.status(404).send({ message: 'Saldo not found.' });
            }
            return reply.send(rows[0]);
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: 'Internal server error.' });
        }
    });

    // Rute untuk menambahkan saldo awal
    fastify.post('/api/saldo-awal', async (request, reply) => {
        const { tahun, nominal } = request.body;
        try {
            const connection = await fastify.db;
            await connection.execute(
                'INSERT INTO balance VALUES (?, ?) ON DUPLICATE KEY UPDATE amount = VALUES(amount)',
                [tahun, nominal]
            );
            return reply.send({ message: 'Save Saldo successfully.' });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: 'Internal server error.' });
        }
    });
};