module.exports = async function (fastify, options) {
    // Rute untuk mendapatkan semua saldo awal
    fastify.get('/api/saldo-awal', async (request, reply) => {
        try {
            const connection = await fastify.db;
            const [rows] = await connection.execute('SELECT b.*, br.name as ref_name FROM balance b join bank_refs br on b.ref = br.id');
            return reply.send({ saldo: rows });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: 'Internal server error.' });
        }
    });

    // Rute untuk mendapatkan saldo awal berdasarkan tahun
    fastify.get('/api/saldo-awal/:ref/:tahun', async (request, reply) => {
        const { tahun, ref } = request.params;
        try {
            const connection = await fastify.db;
            const [rows] = await connection.execute('SELECT b.*, br.name as ref_name FROM balance b join bank_refs br on b.ref = br.id WHERE year = ? and ref = ?', [tahun, ref]);
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
        const { tahun, nominal, ref } = request.body;
        try {
            const connection = await fastify.db;
            await connection.execute(
                'INSERT INTO balance VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE amount = VALUES(amount), ref = VALUES(ref)',
                [tahun, nominal, ref]
            );
            return reply.send({ message: 'Save Saldo successfully.' });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: 'Internal server error.' });
        }
    });
};