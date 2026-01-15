// tiktokDownloader(1).js
// Created: 12/1/2026

const axios = require('axios');
const fs = require('fs');
const qs = require('qs');

async function downloadAction(url, filename) {
    const writer = fs.createWriteStream(filename);
    const response = await axios({
        url, method: 'GET', responseType: 'stream'
    });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

async function aioDownloader(targetUrl) {
    if (!targetUrl) return console.log("❌ Masukin linknya dulu, Bosku!");

    console.log(`[🚀] Memproses Link AIO: ${targetUrl}`);

    try {
        const apiUrl = 'https://tikvideo.app/api/ajaxSearch';
        const response = await axios.post(apiUrl, qs.stringify({
            q: targetUrl,
            lang: 'en'
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://tikvideo.app/'
            }
        });

        const res = response.data;

        if (res.status !== 'ok') {
            return console.log("❌ API Gagal merespon. Coba ganti link.");
        }


        const links = res.data.match(/href="([^"]+)"/g);
        const titleMatch = res.data.match(/<h3>([^<]+)<\/h3>/);
        
        if (!links) return console.log("❌ Link download tidak ditemukan dalam response.");

        const cleanLink = links[0].replace('href="', '').replace('"', '');
        const title = titleMatch ? titleMatch[1].substring(0, 30) : 'video_aio';
        const fileName = `${title.replace(/\s+/g, '_')}_${Date.now()}.mp4`;

        console.log("\n" + "=".repeat(50));
        console.log(`[✅] Target Ditemukan!`);
        console.log(`[📝] Judul : ${title}`);
        console.log("=".repeat(50));

        console.log(`[⏳] Sedang mendownload...`);
        await downloadAction(cleanLink, fileName);
        
        console.log(`BERHASIL! File disimpan: ${fileName}`);

    } catch (err) {
        console.error(`Gagal total: ${err.message}`);
        console.log("Tips: Pastikan koneksi stabil atau coba link platform lain (IG/FB).");
    }
}

const args = process.argv.slice(2);
aioDownloader(args[0]);
