const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

export default async function handler(req, res) {
    // 1. Validasi Method
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Hanya menerima metode POST' });
    }

    const data = req.body;
    const templateId = data.templateId || '1';
    let browser = null;

    try {
        // 2. Konfigurasi Launch Puppeteer yang Stabil untuk Vercel
        // Pastikan versi @sparticuz/chromium dan puppeteer-core sinkron
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(), // Memastikan path binary benar
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage();

        // 3. CSS Master - Styling detail untuk hasil PDF yang presisi
        const baseStyle = `
            * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; }
            body { font-family: 'Helvetica', Arial, sans-serif; color: #333; line-height: 1.6; background: #fff; width: 210mm; min-height: 297mm; }
            .page { padding: 15mm; position: relative; }
            h1 { font-size: 26pt; color: #2c3e50; margin-bottom: 5px; text-transform: uppercase; }
            h2 { font-size: 14pt; color: #34495e; border-bottom: 2px solid #ecf0f1; padding-bottom: 5px; margin: 20px 0 10px 0; text-transform: uppercase; letter-spacing: 1px; }
            h3 { font-size: 11pt; font-weight: bold; margin-bottom: 2px; }
            p { font-size: 10pt; margin-bottom: 8px; text-align: justify; }
            .profile-img { width: 35mm; height: 45mm; object-fit: cover; border: 2px solid #eee; border-radius: 5px; }
            .contact-info { font-size: 9pt; color: #7f8c8d; margin-bottom: 15px; }
            .skill-list { display: flex; flex-wrap: wrap; gap: 8px; list-style: none; }
            .skill-item { background: #f1f2f6; padding: 4px 10px; border-radius: 15px; font-size: 9pt; border: 1px solid #dfe4ea; }
            .exp-item { margin-bottom: 12px; }
            .exp-header { display: flex; justify-content: space-between; font-weight: bold; font-size: 10pt; }
        `;

        let htmlContent = '';

        // 4. Logika 5 Template Desain
        switch (templateId) {
            case '1': // --- HARVARD MODERN (Standard ATS) ---
                htmlContent = `
                <html><head><style>${baseStyle}</style></head><body><div class="page">
                    <div style="text-align: center; border-bottom: 3px solid #2c3e50; padding-bottom: 15px;">
                        <h1>${data.nama}</h1>
                        <div class="contact-info">${data.alamat} | ${data.telepon} | ${data.email}</div>
                    </div>
                    ${data.fotoUrl ? `<div style="text-align:center; margin-top:15px;"><img src="${data.fotoUrl}" class="profile-img"></div>` : ''}
                    <h2>Tentang Saya</h2><p>${data.deskripsi}</p>
                    <h2>Pengalaman Kerja</h2><div>${data.pengalaman.replace(/\n/g, '<br>')}</div>
                    <h2>Pendidikan</h2><p>${data.pendidikan}</p>
                    <h2>Keahlian</h2><div class="skill-list">${data.skill.split(',').map(s => `<span class="skill-item">${s.trim()}</span>`).join('')}</div>
                </div></body></html>`;
                break;

            case '2': // --- PROFESSIONAL SIDEBAR (Blue Theme) ---
                htmlContent = `
                <html><head><style>${baseStyle}
                    .page { display: flex; padding: 0; }
                    .sidebar { width: 35%; background: #2c3e50; color: white; padding: 15mm 10mm; min-height: 297mm; }
                    .main { width: 65%; padding: 15mm 10mm; }
                    .sidebar h1, .sidebar h2, .sidebar p { color: white; border-color: #34495e; }
                    .sidebar .skill-item { background: #34495e; color: white; border: none; }
                </style></head><body>
                    <div class="page">
                        <div class="sidebar">
                            ${data.fotoUrl ? `<img src="${data.fotoUrl}" class="profile-img" style="width:100%; border-radius:50%; border:4px solid #34495e; margin-bottom:20px;">` : ''}
                            <h1 style="font-size: 18pt;">${data.nama}</h1>
                            <div style="font-size: 8pt; margin-bottom:20px;">${data.email}<br>${data.telepon}</div>
                            <h2>Keahlian</h2><div class="skill-list">${data.skill.split(',').map(s => `<span class="skill-item">${s.trim()}</span>`).join('')}</div>
                        </div>
                        <div class="main">
                            <h2>Profil Profesional</h2><p>${data.deskripsi}</p>
                            <h2>Riwayat Karir</h2><p>${data.pengalaman.replace(/\n/g, '<br>')}</p>
                            <h2>Pendidikan</h2><p>${data.pendidikan}</p>
                        </div>
                    </div>
                </body></html>`;
                break;

            case '3': // --- MINIMALIST CHIC (Elegant Typography) ---
                htmlContent = `
                <html><head><style>${baseStyle}
                    h1 { color: #8e44ad; font-family: Georgia, serif; }
                    h2 { color: #8e44ad; border-bottom: 1px solid #8e44ad; }
                </style></head><body><div class="page">
                    <div style="display:flex; justify-content: space-between;">
                        <div><h1>${data.nama}</h1><p class="contact-info">${data.email} / ${data.telepon}</p></div>
                        ${data.fotoUrl ? `<img src="${data.fotoUrl}" style="width:25mm; height:25mm; border-radius:50%;">` : ''}
                    </div>
                    <h2>Summary</h2><p>${data.deskripsi}</p>
                    <h2>Experience</h2><p>${data.pengalaman}</p>
                    <h2>Skills</h2><p>${data.skill}</p>
                </div></body></html>`;
                break;

            case '4': // --- THE EXECUTIVE (Two Column Content) ---
                htmlContent = `
                <html><head><style>${baseStyle}
                    .header-box { background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
                    .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                </style></head><body><div class="page">
                    <div class="header-box"><h1>${data.nama}</h1><p>${data.email} | ${data.alamat}</p></div>
                    <div class="content-grid">
                        <div><h2>Tentang Saya</h2><p>${data.deskripsi}</p><h2>Pendidikan</h2><p>${data.pendidikan}</p></div>
                        <div><h2>Pengalaman</h2><p>${data.pengalaman}</p><h2>Keahlian</h2><p>${data.skill}</p></div>
                    </div>
                </div></body></html>`;
                break;

            case '5': // --- CREATIVE ACCENT (Green Sidebar) ---
                htmlContent = `
                <html><head><style>${baseStyle}
                    .accent-line { width: 5mm; height: 100%; background: #27ae60; position: absolute; left: 0; top: 0; }
                    .page { padding-left: 20mm; }
                    h1, h2 { color: #27ae60; }
                </style></head><body><div class="page">
                    <div class="accent-line"></div>
                    <h1>${data.nama}</h1><p>${data.email} | ${data.telepon}</p>
                    <h2>Profil</h2><p>${data.deskripsi}</p>
                    <h2>Pengalaman</h2><p>${data.pengalaman}</p>
                    <h2>Skill</h2><p>${data.skill}</p>
                </div></body></html>`;
                break;
        }

        // 5. Render HTML ke PDF
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' }); // Menunggu gambar selesai dimuat
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0', right: '0', bottom: '0', left: '0' }
        });

        // 6. Selesai & Tutup Browser
        await browser.close();

        // 7. Kirim Response PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', pdfBuffer.length);
        return res.send(pdfBuffer);

    } catch (error) {
        if (browser !== null) await browser.close();
        console.error("Puppeteer Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
