require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Koneksi Database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database.');
});

app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/get-google-maps-api', (req, res) => {
    res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY });
});

// Fungsi untuk menyimpan lokasi jika belum ada
const saveLocation = (lat, lng) => {
    return new Promise((resolve, reject) => {
        const checkSql = "SELECT locations_id FROM locations WHERE latt = ? AND lng = ?";
        db.query(checkSql, [lat, lng], (err, result) => {
            if (err) return reject(err);
            if (result.length > 0) {
                resolve(result[0].locations_id);
            } else {
                const insertSql = "INSERT INTO locations (latt, lng) VALUES (?, ?)";
                db.query(insertSql, [lat, lng], (err, insertResult) => {
                    if (err) return reject(err);
                    resolve(insertResult.insertId);
                });
            }
        });
    });
};

// Endpoint untuk menyimpan proyek
app.post('/save-project', async (req, res) => {
    const { tiang, kabel, start, end } = req.body;

    if (!tiang || !kabel || !start || !end) {
        return res.status(400).json({ message: "Data tidak lengkap" });
    }

    try {
        // Simpan lokasi start dan end
        const startLocationId = await saveLocation(start.lat, start.lng);
        const endLocationId = await saveLocation(end.lat, end.lng);

        // Simpan ke tabel `boq`
        const sql = `INSERT INTO boq (materials_id, locations_id, quantity) VALUES (2, ?, ?),   (1, ?, ?)`;
        const values = [
            startLocationId, tiang,
            endLocationId, kabel
        ];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Gagal menyimpan data" });
            }
            res.json({ message: "Data berhasil disimpan", boq_id: result.insertId });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan saat menyimpan data" });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'..', 'public', 'home.html'));
});
app.get('/boq', (req, res) => {
    res.sendFile(path.join(__dirname,'..', 'public', 'boq.html'));
});
app.get('/assets', (req, res) => {
    res.sendFile(path.join(__dirname,'..', 'public', 'asset.html'));
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
