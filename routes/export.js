const ExcelJS = require('exceljs');
const path = require('path');

module.exports = async function (fastify, options) {
    fastify.post('/api/export-transactions', async (request, reply) => {
        const { fromDate, toDate, bankRef } = request.body;

        // get year from fromDate
        const year = fromDate.split('-')[0];

        try {
            const connection = await fastify.db;

            // get balance from fromDate year
            const [balance] = await connection.execute(
                'SELECT * FROM balance WHERE year = ?',
                [year]
            );

            let last_balance = balance.length > 0 ? balance[0].amount : 0;

            // get bank_ref
            const [bank_ref] = await connection.execute(
                'SELECT * FROM bank_refs WHERE id = ?',
                [bankRef]
            );

            // Buat workbook baru
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet1');

            // Buat header excel
            // -------------------------------------------
            worksheet.getCell('A1').value = 'KAS ' + bank_ref[0].name + ' IFGF PADANG';
            worksheet.getCell('A1').font = { bold: true };

            worksheet.getCell('A2').value = 'TAHUN ' + year;
            worksheet.getCell('A2').font = { bold: true };

            worksheet.getCell('L1').value = 'SALDO AWAL KAS ' + fromDate;
            worksheet.getCell('L1').font = { bold: true };

            worksheet.getCell('L2').value = last_balance;
            worksheet.getCell('L2').font = { bold: true };

            worksheet.addRow();

            let start_row = 4;
            let mapping_rows = {
                "A" : "TANGGAL",
                "B" : "ALOKASI",
                "C" : "REF",
                "D" : "NO. PO",
                "E" : "KODE",
                "F" : "KATEGORI",
                "G" : "SUB KATEGORI",
                "H" : "KETERANGAN",
                "I" : "DEBET",
                "J" : "KREDIT",
                "K" : "SALDO"
            }

            for (const key in mapping_rows) {
                worksheet.getCell(key + start_row).value = mapping_rows[key];
                worksheet.getCell(key + start_row).font = { bold: true };
            }
            start_row++;
            // -------------------------------------------

            // ambil transaksi dari awal tahun
            const from_date = fromDate.replace(/-/g, '');
            const to_date = toDate.replace(/-/g, '');
            const [rows] = await connection.execute(
                'SELECT t.trx_id, t.trx_date, t.no_po, t.keterangan, t.amount, t.method, c.name as category_name, s.name as subcategory_name, a.alocation, t.kode_account '+
                'FROM transactions t '+
                    'join account a on (t.kode_account = a.code) '+
                    'join categories c on (a.id_categories = c.id) '+
                    'join subcategories s on (a.id_subcategories = s.id) '+
                'WHERE trx_date BETWEEN ? AND ?',
                [from_date.substring(0,4) + "0101", to_date.replace(/-/g, '')] // Mengubah format YYYY-MM-DD ke YYYYMMDD
            );

            rows.forEach((row) => {
                last_balance = row.method == "debit" ? last_balance - row.amount : last_balance + row.amount;

                const trx_date = row.trx_date;//YYYYMMDD
                
                if (1 * to_date.replace(/-/g, '')   < 1 * trx_date) {console.log("a");return;}
                if (1 * from_date.replace(/-/g, '') > 1 * trx_date) {console.log("b");return;}
                
                mapping_rows = {
                    A: trx_date.substring(6,8) + "-" + trx_date.substring(4,6) + "-" + trx_date.substring(0,4),
                    B: row.alocation,
                    C: bank_ref[0].name,
                    D: row.no_po,
                    E: row.kode_account,
                    F: row.category_name,
                    G: row.subcategory_name,
                    H: row.keterangan,
                    I: row.method == "debit"  ? row.amount : "",
                    J: row.method == "kredit" ? row.amount : "",
                    K: last_balance
                }

                for (const key in mapping_rows) {
                    worksheet.getCell(key + start_row).value = mapping_rows[key];
                }
            });

            const filePath = path.join(__dirname, '../exports/laporan_transaksi.xlsx');
            workbook.xlsx.writeFile(filePath);

            // Mengembalikan URL file untuk diunduh
            return reply.send({ fileUrl: `/exports/laporan_transaksi.xlsx` });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: 'Internal server error.' });
        }
    });
};