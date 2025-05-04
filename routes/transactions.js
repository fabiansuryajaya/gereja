module.exports = async function (fastify, options) {
    // Rute untuk mendapatkan semua transaksi
    fastify.get('/api/transactions', async (request, reply) => {
        try {
            const connection = await fastify.db;
            const [rows] = await connection.execute('SELECT * FROM transactions');

            let current_year = new Date().getFullYear();
            const [balance] = await connection.execute('SELECT * FROM balance WHERE year = ?', [current_year]);
            return reply.send({ transactions: rows, have_balance: balance.length });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: 'Internal server error.' });
        }
    });

    // Rute untuk mendapatkan transaksi berdasarkan ID
    fastify.get('/api/transactions/:id', async (request, reply) => {
        const { id } = request.params;
        try {
            const connection = await fastify.db;
            const [rows] = await connection.execute('SELECT * FROM transactions WHERE trx_id = ?', [id]);
            if (rows.length === 0) {
                return reply.status(404).send({ message: 'Transaction not found.' });
            }
            return reply.send(rows[0]);
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: 'Internal server error.' });
        }
    });

    // Rute untuk membuat transaksi baru
    fastify.post('/api/transactions', async (request, reply) => {
        const { kode_account, trx_date, no_po, keterangan, amount, method, username } = request.body;
        try {
            const connection = await fastify.db;

            // get account 
            const [account] = await connection.execute('SELECT method FROM account WHERE code = ?', [kode_account]);
            if (account.length === 0) {
                return reply.status(404).send({ message: 'Account not found.' });
            }

            await connection.execute(
                'INSERT INTO transactions (kode_account, trx_date, no_po, keterangan, amount, method, username) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [kode_account, trx_date, no_po, keterangan, amount, account[0].method, username]
            );
            return reply.send({ message: 'Transaction created successfully.' });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: 'Internal server error.' });
        }
    });

    // Rute untuk memperbarui transaksi
    fastify.put('/api/transactions/:id', async (request, reply) => {
        const { id } = request.params;
        const { kode_account, trx_date, no_po, keterangan, amount, method } = request.body;
        try {
            const connection = await fastify.db;

            const [account] = await connection.execute('SELECT method FROM account WHERE kode = ?', [kode_account]);
            if (account.length === 0) {
                return reply.status(404).send({ message: 'Account not found.' });
            }

            await connection.execute(
                'UPDATE transactions SET kode_account = ?, trx_date = ?, no_po = ?, keterangan = ?, amount = ?, method = ? WHERE trx_id = ?',
                [kode_account, trx_date, no_po, keterangan, amount, account[0].method, id]
            );
            return reply.send({ message: 'Transaction updated successfully.' });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: 'Internal server error.' });
        }
    });
};