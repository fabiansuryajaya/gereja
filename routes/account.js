module.exports = async function (fastify, options) {
    fastify.post('/api/account', async (request, reply) => {
        const { kode, kategori, sub_kategori, alokasi, method, edit } = request.body;

        // Validasi input
        if (!kode || !kategori || !sub_kategori || !alokasi || !method || !edit) {
            return reply.status(400).send({ message: 'All fields are required.' });
        }

        try {
            // Ambil koneksi dari Fastify
            const connection = await fastify.db;

            // Query untuk memasukkan data ke tabel account
            let query = ``;
            if (edit == -1){
                query = `INSERT INTO account (id_categories, id_subcategories, alocation, method, code) VALUES (?, ?, ?, ?, ?)`;
                await connection.execute(query, [kategori, sub_kategori, alokasi, method, kode]);
            }else{
                query = `UPDATE account SET code = ?, id_categories = ?, id_subcategories = ?, alocation = ?, method = ? WHERE code = ?`;
                await connection.execute(query, [kode, kategori, sub_kategori, alokasi, method, edit]);
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
            const [rows] = await connection.execute('SELECT a.code as kode, a.alocation as alokasi, a.method, c.id as kategori, s.id as sub_kategori, c.name as category, s.name as subcategory FROM account a join categories c on a.id_categories = c.id join subcategories s on a.id_subcategories = s.id');

            // Mengembalikan daftar akun
            return reply.send({ accounts: rows });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: 'Internal server error.' });
        }
    });

    fastify.get('/api/categories', async (request, reply) => {
        try {
            const connection = await fastify.db;
            const [rows] = await connection.execute('SELECT * FROM categories'); // Ganti dengan query yang sesuai
            return reply.send({ categories: rows });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: 'Internal server error.' });
        }
    });

    fastify.get('/api/subcategories', async (request, reply) => {
        try {
            const connection = await fastify.db;
            const [rows] = await connection.execute('SELECT * FROM subcategories'); // Ganti dengan query yang sesuai
            return reply.send({ subcategories: rows });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: 'Internal server error.' });
        }
    });

    fastify.get('/api/bank-refs', async (request, reply) => {
        try {
            const connection = await fastify.db;
            const [rows] = await connection.execute('SELECT id, name FROM bank_refs'); // Ganti dengan query yang sesuai
            return reply.send({ refs: rows });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: 'Internal server error.' });
        }
    });
};