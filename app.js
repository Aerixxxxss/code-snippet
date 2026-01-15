const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'snippet-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Password admin
const ADMIN_PASSWORD = 'ilhamganteng';
const FILE_DIR = path.join(__dirname, 'FILE');

// Pastikan direktori FILE ada
fs.mkdir(FILE_DIR, { recursive: true }).catch(console.error);

// Middleware untuk cek admin
const checkAdmin = (req, res, next) => {
    if (req.session.isAdmin) {
        next();
    } else {
        res.status(403).json({ error: 'Akses ditolak' });
    }
};

// API: Login admin
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    
    if (password === ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        req.session.username = 'admin';
        res.json({ success: true, message: 'Login berhasil' });
    } else {
        res.status(401).json({ success: false, error: 'Password salah' });
    }
});

// API: Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// API: Cek status session
app.get('/api/session', (req, res) => {
    res.json({
        isAdmin: !!req.session.isAdmin,
        username: req.session.username || 'guest'
    });
});

// API: Get semua file snippet
app.get('/api/files', async (req, res) => {
    try {
        const files = await fs.readdir(FILE_DIR);
        const fileList = [];
        
        for (const file of files) {
            if (file.endsWith('.js')) {
                const content = await fs.readFile(path.join(FILE_DIR, file), 'utf8');
                fileList.push({
                    name: file,
                    content: content,
                    size: content.length
                });
            }
        }
        
        res.json(fileList);
    } catch (error) {
        res.status(500).json({ error: 'Gagal membaca file' });
    }
});

// API: Get file tertentu
app.get('/api/file/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filepath = path.join(FILE_DIR, filename);
        
        const content = await fs.readFile(filepath, 'utf8');
        res.json({ 
            name: filename, 
            content: content 
        });
    } catch (error) {
        res.status(404).json({ error: 'File tidak ditemukan' });
    }
});

// API: Buat/update file (hanya admin)
app.post('/api/file', checkAdmin, async (req, res) => {
    try {
        const { filename, content } = req.body;
        
        if (!filename || !filename.endsWith('.js')) {
            return res.status(400).json({ error: 'Format file harus .js' });
        }
        
        const filepath = path.join(FILE_DIR, filename);
        await fs.writeFile(filepath, content, 'utf8');
        
        res.json({ success: true, message: 'File berhasil disimpan' });
    } catch (error) {
        res.status(500).json({ error: 'Gagal menyimpan file' });
    }
});

// API: Hapus file (hanya admin)
app.delete('/api/file/:filename', checkAdmin, async (req, res) => {
    try {
        const filename = req.params.filename;
        const filepath = path.join(FILE_DIR, filename);
        
        await fs.unlink(filepath);
        res.json({ success: true, message: 'File berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ error: 'Gagal menghapus file' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
