module.exports = async function (fastify, options) {
    fastify.post('/api/account', async (request, reply) => {
        const { kode, kategori, sub_kategori, ref, alokasi, method, edit } = request.body;

        // Validasi input
        if (!kode || !kategori || !sub_kategori || !ref || !alokasi || !method || !edit) {
            return reply.status(400).send({ message: 'All fields are required.' });
        }

        try {
            // Ambil koneksi dari Fastify
            const connection = await fastify.db;

            // Query untuk memasukkan data ke tabel account
            let query = ``;
            if (edit == -1){
                query = `INSERT INTO account (kategori, sub_kategori, ref, alokasi, method, kode) VALUES (?, ?, ?, ?, ?, ?)`;
            await connection.execute(query, [kategori, sub_kategori, ref, alokasi, method, kode]);
            }else{
                query = `UPDATE account SET kode = ?, kategori = ?, sub_kategori = ?, ref = ?, alokasi = ?, method = ? WHERE kode = ?`;
            await connection.execute(query, [kode, kategori, sub_kategori, ref, alokasi, method, edit]);
            }

            return reply.send({ message: 'Account ' + (edit == -1 ? 'created' : 'updated') + ' successfully!' });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: 'Internal server error.' });
        }
    });

    fastify.get('/api/accounts', async (request, reply) => {
        try {
            // Ambil koneksi dari Fastify
            const connection = await fastify.db;

            // Query untuk mengambil semua akun
            const [rows] = await connection.execute('SELECT * FROM account');

            // Mengembalikan daftar akun
            return reply.send({ accounts: rows });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: 'Internal server error.' });
        }
    });
};