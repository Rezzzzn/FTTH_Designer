require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');
const router = express.Router();
const session = require('express-session');
const multer = require('multer');
const app = express();
const bcrypt = require('bcrypt');
const md5 = require('md5');
const fs = require('fs');
const { parse } = require('json2csv');
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
app.set('view engine', 'ejs');
app.use('/uploads', express.static('public/uploads'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'secretkey',
    resave: false,
    saveUninitialized: true,
}));
app.get('/get-google-maps-api', (req, res) => {
    res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY });
});
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/home');
    } else {
        res.render('login');
    }
});
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
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });



// Route untuk update foto profil

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Nama dan password harus diisi" });
    }

    const sql = "SELECT * FROM user WHERE username = ?";
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Terjadi kesalahan server" });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "Nama atau password salah" });
        }

        const user = results[0];

        // Bandingkan MD5(password input) dengan password di database
        if (md5(password) !== user.password) {
            return res.status(401).json({ message: "Nama atau password salah" });
        }

        // Password cocok, buat session
        req.session.user = {
            user_id: user.username,
            nama: user.nama
        };

        res.redirect('/home');
    });
});
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Gagal logout:", err);
            return res.status(500).json({ message: "Gagal logout" });
        }
        res.redirect('/'); // Arahkan ke halaman login
    });
});


app.get('/get-material-prices', (req, res) => {
    const sql = "SELECT materials_id, name, price FROM materials";

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Gagal ambil harga material:", err);
            return res.status(500).json({ message: "Gagal mengambil harga material" });
        }
        res.json(results);
    });
});


// Endpoint untuk menyimpan proyek
app.post('/save-project', (req, res) => {
    const { projectName, segments } = req.body;

    if (!projectName || !segments || !Array.isArray(segments) || segments.length === 0) {
        return res.status(400).json({ message: "Data tidak lengkap" });
    }

    console.log("Menerima request penyimpanan project:", req.body);

    const insertProjectSql = `INSERT INTO projects (name, created_at) VALUES (?, NOW())`;
    db.query(insertProjectSql, [projectName], (err, projectResult) => {
        if (err) {
            console.error("Gagal menyimpan project:", err);
            return res.status(500).json({ message: "Gagal menyimpan project" });
        }

        const projectId = projectResult.insertId;

        function saveSegment(index) {
            if (index >= segments.length) {
                return res.json({ message: "Project dan semua segment berhasil disimpan" });
            }

            const segment = segments[index];
            const { tiang, kabel, markers = [], polyline = [] } = segment;

            const insertSegmentSql = `INSERT INTO segments (project_id, tiang, kabel) VALUES (?, ?, ?)`;
            db.query(insertSegmentSql, [projectId, tiang, kabel], (err, segmentResult) => {
                if (err) {
                    console.error("Gagal menyimpan segment:", err);
                    return res.status(500).json({ message: "Gagal menyimpan segment" });
                }

                const segmentId = segmentResult.insertId;
                const points = [];

                // Marker
                (Array.isArray(markers) ? markers : []).forEach((coord, i) => {
                    if (Array.isArray(coord) && coord.length === 2) {
                        points.push([segmentId, 'marker', i + 1, coord[0], coord[1]]);
                    } else if (coord && typeof coord.lat === 'number' && typeof coord.lng === 'number') {
                        points.push([segmentId, 'marker', i + 1, coord.lat, coord.lng]);
                    }
                });

                // Polyline
                (Array.isArray(polyline) ? polyline : []).forEach((coord, i) => {
                    if (Array.isArray(coord) && coord.length === 2) {
                        points.push([segmentId, 'polyline', i + 1, coord[0], coord[1]]);
                    } else if (coord && typeof coord.lat === 'number' && typeof coord.lng === 'number') {
                        points.push([segmentId, 'polyline', i + 1, coord.lat, coord.lng]);
                    }
                });

                if (points.length === 0) {
                    return saveSegment(index + 1); // lanjutkan meskipun tidak ada titik
                }

                const insertPointsSql = `INSERT INTO segment_points (segment_id, type, sequence, lat, lng) VALUES ?`;
                db.query(insertPointsSql, [points], (err) => {
                    if (err) {
                        console.error("Gagal menyimpan titik-titik segment:", err);
                        return res.status(500).json({ message: "Gagal menyimpan titik-titik segment" });
                    }

                    saveSegment(index + 1);
                });
            });
        }

        saveSegment(0);
    });
});
app.post('/api/save-project', (req, res) => {
const { projectName, segments } = req.body;

if (!projectName || !segments || !Array.isArray(segments) || segments.length === 0) {
    return res.status(400).json({ message: "Data tidak lengkap" });
}

console.log("Menerima request penyimpanan project:", req.body);

const insertProjectSql = `INSERT INTO projects (name, created_at) VALUES (?, NOW())`;
db.query(insertProjectSql, [projectName], (err, projectResult) => {
    if (err) {
        console.error("Gagal menyimpan project:", err);
        return res.status(500).json({ message: "Gagal menyimpan project" });
    }

    const projectId = projectResult.insertId;

    function saveSegment(index) {
        if (index >= segments.length) {
            return res.json({ message: "Project dan semua segment berhasil disimpan" });
        }

        const segment = segments[index];
        const { tiang, kabel, markers = [], polyline = [] } = segment;

        const insertSegmentSql = `INSERT INTO segments (project_id, tiang, kabel) VALUES (?, ?, ?)`;
        db.query(insertSegmentSql, [projectId, tiang, kabel], (err, segmentResult) => {
            if (err) {
                console.error("Gagal menyimpan segment:", err);
                return res.status(500).json({ message: "Gagal menyimpan segment" });
            }

            const segmentId = segmentResult.insertId;
            const points = [];

            // Marker
            (Array.isArray(markers) ? markers : []).forEach((coord, i) => {
                if (Array.isArray(coord) && coord.length === 2) {
                    points.push([segmentId, 'marker', i + 1, coord[0], coord[1]]);
                } else if (coord && typeof coord.lat === 'number' && typeof coord.lng === 'number') {
                    points.push([segmentId, 'marker', i + 1, coord.lat, coord.lng]);
                }
            });

            // Polyline
            (Array.isArray(polyline) ? polyline : []).forEach((coord, i) => {
                if (Array.isArray(coord) && coord.length === 2) {
                    points.push([segmentId, 'polyline', i + 1, coord[0], coord[1]]);
                } else if (coord && typeof coord.lat === 'number' && typeof coord.lng === 'number') {
                    points.push([segmentId, 'polyline', i + 1, coord.lat, coord.lng]);
                }
            });

            if (points.length === 0) {
                return saveSegment(index + 1); // lanjutkan meskipun tidak ada titik
            }

            const insertPointsSql = `INSERT INTO segment_points (segment_id, type, sequence, lat, lng) VALUES ?`;
            db.query(insertPointsSql, [points], (err) => {
                if (err) {
                    console.error("Gagal menyimpan titik-titik segment:", err);
                    return res.status(500).json({ message: "Gagal menyimpan titik-titik segment" });
                }

                saveSegment(index + 1);
            });
        });
    }

    saveSegment(0);
});
});

function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/'); // Redirect ke login jika belum login
    }
    next();
}

app.get('/home', requireLogin, (req, res) => {
    const username = req.session.user.user_id; // ambil username yang disimpan di session

    const sql = "SELECT nama FROM user WHERE username = ?"; // Tidak perlu ambil foto lagi

    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Terjadi kesalahan server");
        }

        if (results.length === 0) {
            return res.redirect('/logout'); // Logout jika user tidak ditemukan
        }

        const userData = results[0];

        // Kirim data ke view
        res.render('home', {
            name: userData.nama, // perbaiki name -> nama
            email: userData.username,
            profilePicture: 'rez.png' // langsung pakai foto statis
        });
    });
});


app.get('/boq', (req, res) => {
    res.render('boq'); // otomatis nyari file views/home.ejs
});
app.get('/edit_profile', requireLogin, (req, res) => {
    const username = req.session.user.user_id; // ambil username yang disimpan di session

    // Mengambil data user termasuk foto
    const sql = "SELECT username, nama FROM user WHERE username = ?";

    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Terjadi kesalahan server");
        }

        if (results.length === 0) {
            return res.redirect('/logout'); // Logout jika user tidak ditemukan
        }

        const userData = results[0];

        // Kirim data ke view dengan foto profil, jika tidak ada, gunakan foto default
        res.render('edit_profile', {
            name: userData.nama, // perbaiki name -> nama
            email: userData.username,
            profilePicture: 'rez.png' // langsung pakai foto statis
        });
    });
});



app.post('/profile/edit', (req, res) => {
    const { username, nama, currentPassword, newPassword, confirmPassword } = req.body;
    const loggedInUsername = req.session.username; // Ambil username dari session

    // Validasi input dasar
    if (!username || !nama) {
        return res.status(400).json({ message: 'Username dan Nama harus diisi.' });
    }

    // Cek apakah ingin mengubah password
    if (currentPassword || newPassword || confirmPassword) {
        // Cari user berdasarkan username dari session
        db.query('SELECT * FROM user WHERE username = ?', [loggedInUsername], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data pengguna.' });
            }

            const user = result[0];
            if (!user) {
                return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
            }

            // Validasi password lama
            if (user.password !== md5(currentPassword)) {
                return res.status(400).json({ message: 'Password saat ini salah.' });
            }

            // Validasi konfirmasi dan panjang password baru
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ message: 'Konfirmasi password tidak cocok.' });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({ message: 'Password baru minimal 8 karakter.' });
            }

            // Update password dan profil
            const hashedNewPassword = md5(newPassword);
            db.query(
                'UPDATE user SET password = ?, username = ?, nama = ? WHERE username = ?',
                [hashedNewPassword, username, nama, loggedInUsername],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui profil dan password.' });
                    }

                    // Update session username jika diubah
                    req.session.username = username;

                    return res.json({ message: 'Profil dan password berhasil diperbarui!' });
                }
            );
        });
    } else {
        // Hanya update username dan nama tanpa mengubah password
        db.query(
            'UPDATE user SET username = ?, nama = ? WHERE username = ?',
            [username, nama, loggedInUsername],
            (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui profil.' });
                }

                // Update session username jika diubah
                req.session.username = username;

                return res.json({ message: 'Profil berhasil diperbarui!' });
            }
        );
    }
});

app.get('/project', requireLogin, (req, res) =>{
    const username = req.session.user.user_id; // ambil username yang disimpan di session

    // Ambil data user
    const userQuery = "SELECT username, nama FROM user WHERE username = ?";
    db.query(userQuery, [username], (err, userResults) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Terjadi kesalahan server");
        }

        if (userResults.length === 0) {
            return res.redirect('/logout');
        }

        const userData = userResults[0];

        // Ambil data projects
        db.query('SELECT * FROM projects', (err, projectResults) => {
            if (err) {
                console.error('Error saat ambil data projects:', err);
                return res.status(500).send('Internal Server Error');
            }

            // Render halaman project.ejs dan kirim semua data
            res.render('project', {
                name: userData.nama, // perbaiki name -> nama
                email: userData.username,
                profilePicture: 'rez.png',
                projects: projectResults
            });
        });
    });
});
app.get('/project/search', requireLogin, (req, res) => {
    const searchQuery = req.query.q;
    const username = req.session.user.user_id;

    const userQuery = "SELECT username, nama FROM user WHERE username = ?";
    db.query(userQuery, [username], (err, userResults) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Terjadi kesalahan server");
        }

        if (userResults.length === 0) {
            return res.redirect('/logout');
        }

        const userData = userResults[0];

        // Cari project berdasarkan nama
        const projectQuery = "SELECT * FROM projects WHERE name LIKE ?"
        db.query(projectQuery, [`%${searchQuery}%`], (err, projectResults) => {
            if (err) {
                console.error('Error saat mencari data projects:', err);
                return res.status(500).send('Internal Server Error');
            }

            // Kirim hasilnya sebagai JSON
            res.json(projectResults);
        });
    });
});
app.get('/project/:id/details', (req, res) => {
    const projectId = req.params.id;

    // Ambil data project berdasarkan projectId
    db.query('SELECT * FROM projects WHERE project_id = ?', [projectId], (err, projects) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error fetching project data');
        }

        if (projects.length === 0) {
            return res.status(404).send('Project not found');
        }

        const project = projects[0]; // Ambil project pertama

        // Ambil data segments
        db.query(`
            SELECT 
                s.segment_id, 
                s.tiang, 
                s.kabel,
                m1.price AS tiang_price, 
                m1.unit AS tiang_unit,
                m2.price AS kabel_price, 
                m2.unit AS kabel_unit
            FROM segments s
            JOIN materials m1 ON m1.name = 'tiang'
            JOIN materials m2 ON m2.name = 'kabel'
            WHERE s.project_id = ?
        `, [projectId], (err, segments) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Error fetching segments');
            }

            if (segments.length === 0) {
                return res.render('details', { groupedSegments: [], project: project });
            }

            const groupedSegments = segments.map(seg => ({
                segment_id: seg.segment_id,
                tiang: seg.tiang,
                kabel: seg.kabel,
                items: [
                    {
                        material: 'tiang',
                        quantity: seg.tiang,
                        price: seg.tiang_price,
                        unit: seg.tiang_unit,
                        total: seg.tiang * seg.tiang_price
                    },
                    {
                        material: 'kabel',
                        quantity: seg.kabel,
                        price: seg.kabel_price,
                        unit: seg.kabel_unit,
                        total: seg.kabel * seg.kabel_price
                    }
                ]
            }));

            // Render halaman details dengan data project dan groupedSegments
            res.render('details', { groupedSegments, project: project });
        });
    });
});

// Route untuk mengambil data segments dalam format JSON
app.get('/project/:id/segments', (req, res) => {
    const projectId = req.params.id;
    console.log("Project ID received:", projectId);  // Debugging

    db.query(`
        SELECT 
            s.segment_id, 
            s.tiang, 
            s.kabel,
            m1.price AS tiang_price, 
            m1.unit AS tiang_unit,
            m2.price AS kabel_price, 
            m2.unit AS kabel_unit
        FROM segments s
        JOIN materials m1 ON m1.name = 'tiang'
        JOIN materials m2 ON m2.name = 'kabel'
        WHERE s.project_id = ?
    `, [projectId], (err, segments) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error fetching segments');
        }

        if (segments.length === 0) {
            return res.status(404).send('Segments not found for this project');
        }

        const groupedSegments = segments.map(seg => ({
            segment_id: seg.segment_id,
            tiang: seg.tiang,
            kabel: seg.kabel,
            items: [
                {
                    material: 'tiang',
                    quantity: seg.tiang,
                    price: seg.tiang_price,
                    unit: seg.tiang_unit,
                    total: seg.tiang * seg.tiang_price
                },
                {
                    material: 'kabel',
                    quantity: seg.kabel,
                    price: seg.kabel_price,
                    unit: seg.kabel_unit,
                    total: seg.kabel * seg.kabel_price
                }
            ]
        }));

        res.json(groupedSegments);
    });
});
app.get('/project/:projectId/export-kml', (req, res) => {
    const projectId = req.params.projectId;

    db.query(
        `SELECT segment_id AS segment_id FROM segments WHERE project_id = ?`,
        [projectId],
        (err, segments) => {
            if (err) {
                console.error("Query 1 error:", err);
                return res.status(500).send("Query error 1");
            }

            if (!Array.isArray(segments) || segments.length === 0) {
                return res.status(404).send("No segments found");
            }

            const segmentIds = segments.map(s => s.segment_id);

            db.query(
                `SELECT segment_id, lat, lng FROM segment_points WHERE segment_id IN (?) ORDER BY segment_id, sequence`,
                [segmentIds],
                (err, points) => {
                    if (err) {
                        console.error("Query 2 error:", err);
                        return res.status(500).send("Query error 2");
                    }

                    let kml = `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">\n<Document>\n`;

                    const grouped = {};
                    points.forEach(p => {
                        if (!grouped[p.segment_id]) grouped[p.segment_id] = [];
                        grouped[p.segment_id].push(p);
                    });

                    // Loop through each segment and generate KML
                    for (const segmentId in grouped) {
                        const segmentPoints = grouped[segmentId];

                        // Prepare polyline points
                        const polylinePath = segmentPoints.map(p => ({
                            lat: p.lat,
                            lng: p.lng
                        }));

                        // Cek apakah titik pertama dan terakhir sangat mirip (prevent loop)
                        const first = polylinePath[0];
                        const last = polylinePath[polylinePath.length - 1];
                        const isSamePoint = 
                            first.lat === last.lat && 
                            first.lng === last.lng;

                        // Jika titik pertama dan terakhir sangat mirip, potong titik terakhir
                        const finalPath = isSamePoint ? polylinePath.slice(0, -1) : polylinePath;

                        // First, create the LineString for the segment
                        kml += `<Placemark>\n<name>Segment ${segmentId}</name>\n<LineString>\n<coordinates>\n`;
                        finalPath.forEach(p => {
                            kml += `${p.lng},${p.lat},0\n`;
                        });
                        kml += `</coordinates>\n</LineString>\n</Placemark>\n`;

                        // Now, create a marker (Point) for each point
                        segmentPoints.forEach(p => {
                            kml += `<Placemark>\n<name>Point ${segmentId} - ${p.lat},${p.lng}</name>\n<Point>\n<coordinates>${p.lng},${p.lat},0</coordinates>\n</Point>\n</Placemark>\n`;
                        });
                    }

                    kml += `</Document>\n</kml>`;

                    res.setHeader('Content-Type', 'application/vnd.google-earth.kml+xml');
                    res.setHeader('Content-Disposition', `attachment; filename="project_${projectId}.kml"`);
                    res.send(kml);
                }
            );
        }
    );
});

app.get('/project/:id/map-data', (req, res) => {
    const projectId = req.params.id;

    console.log('Project ID:', projectId);  // Log projectId yang diterima

    const query = `
       SELECT 
    segments.segment_id,
    sp.point_id,  
    sp.lat, 
    sp.lng,
    sp.type,               -- <-- tambahkan ini
    segments.tiang,
    segments.kabel

FROM segments
JOIN segment_points sp ON segments.segment_id = sp.segment_id
WHERE segments.project_id = ?
ORDER BY segments.segment_id, sp.point_id;

    `;
    
    db.query(query, [projectId], (err, results) => {
        if (err) {
            console.error('Error ambil map data:', err);  // Log error jika query gagal
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        console.log('Results:', results);  // Log hasil query

        // Variabel untuk menyimpan tiang dan kabel
        let tiang = null;
        let kabel = null;
        let markers = [];  // Untuk menyimpan semua marker (lat, lng) berdasarkan segment_id
        
        // Menyimpan tiang dan kabel langsung dari hasil query, serta marker berdasarkan segment_id
        results.forEach(row => {
            console.log('Row:', row);  // Log tiap row untuk memeriksa data yang diterima

            if (row.tiang && !tiang) tiang = row;  // Assign tiang hanya jika belum ada
            if (row.kabel && !kabel) kabel = row;  // Assign kabel hanya jika belum ada

            markers.push({ 
                segment_id: row.segment_id, 
                point_id: row.point_id, 
                lat: row.lat, 
                lng: row.lng,
                type: row.type
            });
        });

        // Jika tiang atau kabel tidak ditemukan
        if (!tiang || !kabel) {
            console.error('Tiang atau kabel tidak ditemukan');
            return res.status(404).json({ error: "Tiang atau kabel tidak ditemukan" });
        }

        console.log('Tiang:', tiang);  // Log data tiang
        console.log('Kabel:', kabel);  // Log data kabel
        console.log('Markers:', markers);  // Log data marker

        res.json({
            tiang: { lat: tiang.lat, lng: tiang.lng },
            kabel: { lat: kabel.lat, lng: kabel.lng },
            jalur: markers  // Mengembalikan semua lokasi dan marker
        });
    });
});

        
        app.get('/project/:id/view-map', requireLogin, (req, res) => {
            const username = req.session.user.user_id;
            const projectId = req.params.id; 
            const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY; // Ambil dari .env
        
            const sql = "SELECT username, nama FROM user WHERE username = ?";
            
            db.query(sql, [username], (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send("Terjadi kesalahan server");
                }
        
                if (results.length === 0) {
                    return res.redirect('/logout');
                }
        
                const userData = results[0];
                res.render('homie', {
                    name: userData.nama,
                    email: userData.username,
                    profilePicture: 'rez.png',
                    projectId: projectId,
                    googleMapsApiKey: googleMapsApiKey, // Kirim API Key ke view
                });
            });
        });
        
        
        app.delete('/project/:id', (req, res) => {
            const projectId = req.params.id;
        
            // Cek apakah project-nya ada dulu
            const checkQuery = 'SELECT * FROM projects WHERE project_id = ?';
            db.query(checkQuery, [projectId], (err, results) => {
                if (err) {
                    console.error('Error saat cek project:', err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
        
                if (results.length === 0) {
                    return res.status(404).json({ error: 'Project tidak ditemukan' });
                }
        
                // Kalau ditemukan, lanjut hapus
                const deleteQuery = 'DELETE FROM projects WHERE project_id = ?';
                db.query(deleteQuery, [projectId], (err2, result) => {
                    if (err2) {
                        console.error('Error saat hapus project:', err2);
                        return res.status(500).json({ error: 'Gagal menghapus project' });
                    }
        
                    res.json({ message: 'Project berhasil dihapus' });
                });
            });
        });
        
      
        

app.get('/assets', (req, res) => {
    res.sendFile(path.join(__dirname,'..', 'public', 'asset.html'));
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
