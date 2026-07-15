import express from 'express';
import pg from 'pg';

const app = express();
const port = 3000;

const { Pool } = pg;

// Middleware
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);

// Koneksi Database PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'mahasiswa',
    password: 'nurainun', // Ganti jika password PostgreSQL berbeda
    port: 5432,
});

// Cek koneksi database
pool.connect()
    .then(() => {
        console.log("Berhasil terhubung ke PostgreSQL");
    })
    .catch((err) => {
        console.error("Gagal terhubung ke PostgreSQL:", err.message);
    });

    app.get('/biodata', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM biodata ORDER BY id'
        );

        res.status(200).json(result.rows);

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

/* ===========================
      GET Berdasarkan ID
=========================== */
app.get('/biodata/:id', async (req, res) => {

    try {

        const result = await pool.query(
            'SELECT * FROM biodata WHERE id = $1',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Data tidak ditemukan"
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

});
/* ===========================
         POST Data
=========================== */
app.post('/biodata', async (req, res) => {

    const { nama, nim, kelas } = req.body;

    try {

        const result = await pool.query(
            `INSERT INTO biodata (nama, nim, kelas)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [nama, nim, kelas]
        );

        res.status(201).json({
            message: "Data berhasil ditambahkan",
            data: result.rows[0]
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

});
/* ===========================
        UPDATE Data
=========================== */
app.put('/biodata/:id', async (req, res) => {

    const { nama, nim, kelas } = req.body;

    try {

        const result = await pool.query(
            `UPDATE biodata
             SET nama = $1,
                 nim = $2,
                 kelas = $3
             WHERE id = $4
             RETURNING *`,
            [nama, nim, kelas, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Data tidak ditemukan"
            });
        }

        res.status(200).json({
            message: "Data berhasil diupdate",
            data: result.rows[0]
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

});
/* ===========================
        DELETE Data
=========================== */
app.delete('/biodata/:id', async (req, res) => {

    try {

        const result = await pool.query(
            `DELETE FROM biodata
             WHERE id = $1
             RETURNING *`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Data tidak ditemukan"
            });
        }

        res.status(200).json({
            message: "Data berhasil dihapus",
            data: result.rows[0]
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

});

// Menjalankan Server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});