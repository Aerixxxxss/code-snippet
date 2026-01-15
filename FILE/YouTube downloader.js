const axios = require('axios');

async function getLinkOnly() {
    const targetUrl = process.argv[2];
    if (!targetUrl) return console.log("❌ Masukin link YouTube-nya!");

    console.log(`[🔍] Sedang mencari link HD untuk: ${targetUrl}`);

    try {
        const res = await axios.post('https://thesocialcat.com/api/youtube-download', {
            url: targetUrl,
            format: "1080p" 
        }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Referer': 'https://thesocialcat.com/tools/youtube-video-downloader'
            }
        });

        const data = res.data;

        if (data.mediaUrl) {
            console.log("\n" + "=".repeat(50));
            console.log(`[✅] BERHASIL DAPET LINK!`);
            console.log(`[📝] Judul : ${data.caption}`);
            console.log(`[🎥] Resolusi: ${data.format}`);
            console.log("=".repeat(50));
            console.log(`\n🔗 LINK DOWNLOAD (KLIK KANAN/TAHAN UNTUK SALIN):\n`);
            console.log(data.mediaUrl);
            console.log("\n" + "=".repeat(50));
        } else {
            console.log("❌ Link download nggak ketemu di respon API.");
        }

    } catch (err) {
        console.log(`[❌] Error: ${err.message}`);
    }
}

getLinkOnly();
