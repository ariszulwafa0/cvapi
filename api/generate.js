const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

export default async function handler(req, res) {
    // 1. Validasi Method (Wajib POST)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Hanya menerima metode POST' });
    }

    const data = req.body;
    const templateId = data.templateId || '1';
    let browser = null;

    try {
        // 2. Konfigurasi Launch Puppeteer Khusus Vercel
        // Menggunakan flag --no-sandbox untuk menghindari error library Linux
        browser = await puppeteer.launch({
            args: [
                ...chromium.args,
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--hide-scrollbars',
                '--mute-audio'
            ],
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage();

        // 3. CSS Master - Desain dasar untuk hasil cetak A4 yang presisi
        const baseStyle = `
            * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; }
            body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; line-height: 1.5; background: #fff; width: 210mm; min-height: 297mm; }
            .page { padding: 15mm; position: relative; min-height: 297mm; }
            h1 { font-size: 24pt; color: #2c3e50; margin-bottom: 5px; text-transform: uppercase; font-weight: bold; }
            h2 { font-size: 13pt; color: #1a5f7a; border-bottom: 2px solid #eee; padding-bottom: 5px; margin: 15px 0 10px 0; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
            p { font-size: 10pt; margin-bottom: 8px; text-align: justify; white-space: pre-line; }
            .profile-img { width: 32mm; height: 42mm; object-fit: cover; border: 2px solid #eee; border-radius: 4px; }
            .contact-info { font-size: 9pt; color: #555; margin-bottom: 10px; }
            .skill-list { display: flex; flex-wrap: wrap; gap: 6px; list-style: none; }
            .skill-item { background: #f8f9fa; padding: 3px 10px; border-radius: 4px; font-size: 8.5pt; border: 1px solid #ddd; color: #444; }
            .section { margin-bottom: 15px; }
        `;

        let htmlContent = '';

        // 4. Logika 5 Template CV
        switch (templateId) {
            case '1': // --- TEMPLATE 1: MODERN MINIMALIST (ATS FRIENDLY) ---
                htmlContent = `<html><head><style>${baseStyle}</style></head><body><div class="page">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 4px solid #1a5f7a; padding-bottom: 15px;">
                        <div style="width: 70%;">
                            <h1>${data.nama}</h1>
                            <div class="contact-info">📍 ${data.alamat} | 📞 ${data.telepon}<br>📧 ${data.email}</div>
                        </div>
                        ${data.fotoUrl ? `<img src="${data.fotoUrl}" class="profile-img">` : ''}
                    </div>
                    <div class="section"><h2>Profil Profesional</h2><p>${data.deskripsi}</p></div>
                    <div class="section"><h2>Pengalaman Kerja</h2><p>${data.pengalaman}</p></div>
                    <div class="section"><h2>Pendidikan</h2><p>${data.pendidikan}</p></div>
                    <div class="section"><h2>Keahlian</h2><div class="skill-list">${data.skill.split(',').map(s => `<span class="skill-item">${s.trim()}</span>`).join('')}</div></div>
                </div></body></html>`;
                break;

            case '2': // --- TEMPLATE 2: ROYAL SIDEBAR ---
                htmlContent = `<html><head><style>${baseStyle}
                    .page { display: flex; padding: 0; }
                    .sidebar { width: 35%; background: #1e3a5f; color: white; padding: 15mm 8mm; }
                    .main { width: 65%; padding: 15mm 10mm; }
                    .sidebar h2 { color: #a5c9e1; border-color: #2c5282; }
                    .sidebar p, .sidebar .contact-info { color: #e2e8f0; }
                    .sidebar .skill-item { background: #2c5282; color: white; border: none; }
                </style></head><body><div class="page">
                    <div class="sidebar">
                        ${data.fotoUrl ? `<img src="${data.fotoUrl}" class="profile-img" style="width:100%; height: auto; margin-bottom:15px; border-radius:8px;">` : ''}
                        <h1 style="color:white; font-size: 18pt;">${data.nama}</h1>
                        <div class="contact-info">📧 ${data.email}<br>📞 ${data.telepon}<br>📍 ${data.alamat}</div>
                        <h2>Keahlian</h2><div class="skill-list">${data.skill.split(',').map(s => `<span class="skill-item">${s.trim()}</span>`).join('')}</div>
                    </div>
                    <div class="main">
                        <h2>Profil</h2><p>${data.deskripsi}</p>
                        <h2>Pengalaman</h2><p>${data.pengalaman}</p>
                        <h2>Pendidikan</h2><p>${data.pendidikan}</p>
                    </div>
                </div></body></html>`;
                break;

            case '3': // --- TEMPLATE 3: ELEGANT CHIC ---
                htmlContent = `<html><head><style>${baseStyle}
                    h1 { color: #6b46c1; text-align: center; }
                    h2 { color: #6b46c1; border-bottom: 1px solid #6b46c1; text-align: center; }
                    .contact-info { text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px; }
                </style></head><body><div class="page">
                    ${data.fotoUrl ? `<div style="text-align:center;"><img src="${data.fotoUrl}" class="profile-img" style="border-radius:50%; width:30mm; height:30mm; margin-bottom:10px;"></div>` : ''}
                    <h1>${data.nama}</h1>
                    <div class="contact-info">${data.email} | ${data.telepon} | ${data.alamat}</div>
                    <h2>Tentang Saya</h2><p>${data.deskripsi}</p>
                    <h2>Riwayat Pekerjaan</h2><p>${data.pengalaman}</p>
                    <h2>Pendidikan</h2><p>${data.pendidikan}</p>
                    <h2>Keahlian</h2><p style="text-align:center;">${data.skill}</p>
                </div></body></html>`;
                break;

            case '4': // --- TEMPLATE 4: THE EXECUTIVE (GRID) ---
                htmlContent = `<html><head><style>${baseStyle}
                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                    .header-box { background: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
                </style></head><body><div class="page">
                    <div class="header-box">
                        <h1>${data.nama}</h1>
                        <div class="contact-info">${data.email} | ${data.telepon}</div>
                    </div>
                    <div class="grid">
                        <div class="grid-left"><h2>Profil</h2><p>${data.deskripsi}</p><h2>Pendidikan</h2><p>${data.pendidikan}</p></div>
                        <div class="grid-right"><h2>Pengalaman</h2><p>${data.pengalaman}</p><h2>Skill</h2><p>${data.skill}</p></div>
                    </div>
                </div></body></html>`;
                break;

            case '5': // --- TEMPLATE 5: CLEAN GREEN ---
                htmlContent = `<html><head><style>${baseStyle}
                    h1, h2 { color: #2f855a; }
                    .line { height: 6px; background: #2f855a; margin-bottom: 20px; }
                </style></head><body><div class="page">
                    <div class="line"></div>
                    <h1>${data.nama}</h1>
                    <div class="contact-info">📧 ${data.email} | 📞 ${data.telepon}</div>
                    <div style="display:flex; gap: 20px; margin-top: 15px;">
                        <div style="flex:1;">
                            <h2>Tentang</h2><p>${data.deskripsi}</p>
                            <h2>Pendidikan</h2><p>${data.pendidikan}</p>
                        </div>
                        <div style="flex:1;">
                            <h2>Pengalaman</h2><p>${data.pengalaman}</p>
                            <h2>Skill</h2><p>${data.skill}</p>
                        </div>
                    </div>
                </div></body></html>`;
                break;
        }

        // 5. Render ke PDF
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0', right: '0', bottom: '0', left: '0' }
        });

        // 6. Selesai
        await browser.close();

        // 7. Output
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer);

    } catch (error) {
        if (browser !== null) await browser.close();
        console.error("LOG ERROR:", error);
        res.status(500).json({ error: error.message });
    }
}
