const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const data = req.body;
    const templateId = data.templateId || '1';
    let browser = null;

    try {
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });

        const page = await browser.newPage();

        // ---------------------------------------------------------
        // CSS MASTER & RESET (Banyak Baris untuk Presisi PDF)
        // ---------------------------------------------------------
        const baseStyle = `
            * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; background: #fff; }
            .container { width: 100%; min-height: 100vh; position: relative; }
            h1, h2, h3 { color: #2c3e50; line-height: 1.2; }
            p { margin-bottom: 5px; }
            .profile-img { width: 120px; height: 140px; object-fit: cover; border-radius: 4px; border: 2px solid #eee; }
            .section-header { font-size: 14pt; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #34495e; margin-bottom: 10px; margin-top: 20px; padding-bottom: 3px; }
            .contact-row { display: flex; flex-wrap: wrap; gap: 15px; font-size: 10pt; color: #555; }
            .skill-pill { display: inline-block; background: #f1f2f6; border: 1px solid #dfe4ea; padding: 3px 10px; border-radius: 15px; margin: 2px; font-size: 9pt; }
            ul { list-style-position: inside; }
        `;

        let htmlContent = '';

        // ---------------------------------------------------------
        // TEMPLATE ENGINE (Switch Case untuk 5 Desain)
        // ---------------------------------------------------------
        switch (templateId) {
            case '1': // DESAIN: HARVARD ATS (Minimalis, Clean)
                htmlContent = `
                <html><head><style>${baseStyle}
                    body { padding: 40px; }
                    .header-center { text-align: center; border-bottom: 3px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
                    .name-big { font-size: 28pt; font-weight: 800; letter-spacing: 2px; }
                </style></head><body>
                    <div class="header-center">
                        <h1 class="name-big">${data.nama}</h1>
                        <div class="contact-row" style="justify-content: center;">
                            <span>${data.alamat}</span> | <span>${data.telepon}</span> | <span>${data.email}</span>
                        </div>
                    </div>
                    <div class="section-header">Tentang Saya</div>
                    <div style="text-align: justify">${data.deskripsi}</div>
                    <div class="section-header">Pengalaman Kerja</div>
                    <div>${data.pengalaman.replace(/\n/g, '<br>')}</div>
                    <div class="section-header">Pendidikan</div>
                    <div>${data.pendidikan}</div>
                    <div class="section-header">Keahlian</div>
                    <div>${data.skill.split(',').map(s => `<span class="skill-pill">${s.trim()}</span>`).join('')}</div>
                </body></html>`;
                break;

            case '2': // DESAIN: MODERN BLUE (Sidebar Right)
                htmlContent = `
                <html><head><style>${baseStyle}
                    .main-grid { display: grid; grid-template-columns: 2fr 1fr; min-height: 100vh; }
                    .left-col { padding: 40px; }
                    .right-col { background: #f8f9fa; border-left: 1px solid #ddd; padding: 40px; }
                    .blue-box { background: #2980b9; color: white; padding: 30px; margin: -40px -40px 20px -40px; }
                    .blue-box h1 { color: white; }
                </style></head><body>
                    <div class="main-grid">
                        <div class="left-col">
                            <div class="blue-box"><h1>${data.nama}</h1><p>Professional Resume</p></div>
                            <div class="section-header">Profil</div><p>${data.deskripsi}</p>
                            <div class="section-header">Pengalaman</div><p>${data.pengalaman.replace(/\n/g, '<br>')}</p>
                        </div>
                        <div class="right-col">
                            ${data.fotoUrl ? `<img src="${data.fotoUrl}" class="profile-img" style="width:100%; margin-bottom:20px;">` : ''}
                            <h3>Kontak</h3><p>${data.email}</p><p>${data.telepon}</p><p>${data.alamat}</p>
                            <div class="section-header">Skill</div>
                            <div>${data.skill.split(',').map(s => `<div class="skill-pill">${s.trim()}</div>`).join('')}</div>
                        </div>
                    </div>
                </body></html>`;
                break;

            case '3': // DESAIN: THE EXECUTIVE (Left Sidebar Dark)
                htmlContent = `
                <html><head><style>${baseStyle}
                    body { padding: 0; }
                    .sidebar { position: fixed; width: 30%; height: 100%; background: #2c3e50; color: #ecf0f1; padding: 30px; }
                    .content { margin-left: 30%; width: 70%; padding: 40px; background: #fff; }
                    .sidebar h1 { color: #fff; font-size: 20pt; margin-bottom: 10px; }
                    .sidebar .section-header { color: #bdc3c7; border-bottom-color: #7f8c8d; }
                </style></head><body>
                    <div class="sidebar">
                        ${data.fotoUrl ? `<img src="${data.fotoUrl}" class="profile-img" style="width:100%; border-radius: 50%; margin-bottom:20px; border: 4px solid #34495e;">` : ''}
                        <h1>${data.nama}</h1>
                        <div class="section-header" style="font-size: 10pt;">Kontak</div>
                        <p style="font-size: 9pt;">${data.email}<br>${data.telepon}<br>${data.alamat}</p>
                        <div class="section-header" style="font-size: 10pt;">Keahlian</div>
                        <div style="font-size: 9pt;">${data.skill}</div>
                    </div>
                    <div class="content">
                        <div class="section-header">Ringkasan Karir</div>
                        <p>${data.deskripsi}</p>
                        <div class="section-header">Riwayat Pekerjaan</div>
                        <p>${data.pengalaman.replace(/\n/g, '<br>')}</p>
                        <div class="section-header">Pendidikan</div>
                        <p>${data.pendidikan}</p>
                    </div>
                </body></html>`;
                break;

            case '4': // DESAIN: CREATIVE ELEGANCE (Full Background Accent)
                htmlContent = `
                <html><head><style>${baseStyle}
                    body { padding: 40px; border: 10px solid #f1c40f; min-height: 100vh; }
                    .header-flex { display: flex; justify-content: space-between; align-items: center; background: #34495e; color: white; padding: 20px; margin: -10px -10px 20px -10px; }
                    .header-flex h1 { color: #f1c40f; }
                </style></head><body>
                    <div class="header-flex">
                        <div><h1>${data.nama}</h1><p>${data.email}</p></div>
                        ${data.fotoUrl ? `<img src="${data.fotoUrl}" class="profile-img" style="border: 3px solid #f1c40f;">` : ''}
                    </div>
                    <div class="section-header">Tentang</div><p>${data.deskripsi}</p>
                    <div class="section-header">Pengalaman</div><p>${data.pengalaman}</p>
                    <div class="section-header">Skill</div><p>${data.skill}</p>
                </body></html>`;
                break;

            case '5': // DESAIN: SIMPLE BOXED (Bordered Sections)
                htmlContent = `
                <html><head><style>${baseStyle}
                    body { padding: 30px; background: #ecf0f1; }
                    .paper { background: white; padding: 40px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                    .section-box { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 5px; }
                </style></head><body>
                    <div class="paper">
                        <h1>${data.nama}</h1><hr><p>${data.email} | ${data.telepon}</p>
                        <div class="section-box"><strong>Profil:</strong><br>${data.deskripsi}</div>
                        <div class="section-box"><strong>Pengalaman:</strong><br>${data.pengalaman}</div>
                        <div class="section-box"><strong>Keahlian:</strong><br>${data.skill}</div>
                    </div>
                </body></html>`;
                break;
        }

        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', pdfBuffer.length);
        return res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error("Puppeteer Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
