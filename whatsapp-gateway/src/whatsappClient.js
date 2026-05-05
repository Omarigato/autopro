const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

let client = null;
let currentQrCodeData = null;
let isReady = false;
let isAuthenticated = false;
let isInitializing = false;

// Найти Chrome/Chromium на Windows или использовать системный
function getChromePath() {
    const paths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files\\Chromium\\Application\\chrome.exe',
        process.env.PUPPETEER_EXECUTABLE_PATH,
    ].filter(Boolean);

    const fs = require('fs');
    for (const p of paths) {
        try {
            if (fs.existsSync(p)) return p;
        } catch {}
    }
    return undefined; // puppeteer сам найдет
}

function createClient() {
    const executablePath = getChromePath();
    console.log(executablePath
        ? `[WA] Using Chrome at: ${executablePath}`
        : '[WA] Using bundled Chromium (puppeteer default)');

    return new Client({
        authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
        puppeteer: {
            headless: true,
            executablePath: executablePath,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-first-run',
                '--disable-extensions',
            ],
            timeout: 60000,
        },
        webVersionCache: {
            type: 'remote',
            remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1017054952-alpha/index.html',
        }
    });
}

function initWhatsAppClient() {
    if (isInitializing) return;
    isInitializing = true;
    console.log('[WA] Initializing WhatsApp client...');

    client = createClient();

    client.on('qr', (qr) => {
        console.log('[WA] QR Received. Open http://localhost:3001/ to scan.');
        currentQrCodeData = qr;
        isReady = false;
        isAuthenticated = false;
    });

    client.on('ready', () => {
        console.log('[WA] Client is ready!');
        isReady = true;
        isAuthenticated = true;
        currentQrCodeData = null;
        isInitializing = false;
    });

    client.on('authenticated', () => {
        console.log('[WA] Client authenticated!');
        isAuthenticated = true;
    });

    client.on('auth_failure', (msg) => {
        console.error('[WA] Auth failure:', msg);
        isAuthenticated = false;
        isReady = false;
        isInitializing = false;
        // Через 5 секунд попробуем снова
        setTimeout(() => initWhatsAppClient(), 5000);
    });

    client.on('disconnected', (reason) => {
        console.log('[WA] Disconnected:', reason);
        isReady = false;
        isAuthenticated = false;
        isInitializing = false;
        // Попробуем переподключиться через 5 секунд
        setTimeout(() => initWhatsAppClient(), 5000);
    });

    // Глобальный перехват unhandled rejection от puppeteer
    client.initialize().catch((err) => {
        console.error('[WA] Initialization error:', err.message || err);
        isReady = false;
        isAuthenticated = false;
        isInitializing = false;
        // Через 10 секунд попробуем снова
        setTimeout(() => initWhatsAppClient(), 10000);
    });
}

async function getQrCodeHtml() {
    if (isReady && isAuthenticated) {
        return `
            <html><head><meta charset="utf-8"><title>AutoPro Gateway</title>
            <style>body{font-family:sans-serif;text-align:center;margin-top:80px;background:#f8fafc;}</style>
            </head><body>
            <h1 style="color:#16a34a">✓ WhatsApp Подключен</h1>
            <p>Сессия активна. Шлюз готов к работе.</p>
            <p><a href="/status">Статус</a></p>
            </body></html>
        `;
    }

    if (currentQrCodeData) {
        const qrImage = await qrcode.toDataURL(currentQrCodeData);
        return `
            <html>
            <head>
                <meta http-equiv="refresh" content="5">
                <meta charset="utf-8">
                <title>AutoPro Gateway - Подключение</title>
                <style>
                    body { font-family: sans-serif; text-align: center; margin-top: 50px; background:#f8fafc; }
                    img { width: 300px; height: 300px; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.1); }
                    .instructions { max-width: 500px; margin: 0 auto 20px; line-height: 1.8; font-size: 16px; text-align: left; background:white; padding:20px; border-radius:16px; }
                    h1 { font-size: 28px; }
                </style>
            </head>
            <body>
                <h1>Подключение AutoPro WhatsApp</h1>
                <div class="instructions">
                    <p><b>1.</b> Откройте WhatsApp на телефоне.</p>
                    <p><b>2.</b> Зайдите в <b>Настройки → Связанные устройства</b>.</p>
                    <p><b>3.</b> Нажмите <b>Привязать устройство</b> и отсканируйте QR-код.</p>
                </div>
                <img src="${qrImage}" alt="QR Code" />
                <p style="color:#94a3b8;font-size:13px;margin-top:20px;">Страница обновляется автоматически каждые 5 секунд</p>
            </body>
            </html>
        `;
    }

    return `
        <html>
        <head><meta http-equiv="refresh" content="3"><meta charset="utf-8"><title>AutoPro Gateway</title>
        <style>body{font-family:sans-serif;text-align:center;margin-top:80px;background:#f8fafc;}</style>
        </head>
        <body>
            <h2>Инициализация...</h2>
            <p>Запуск браузера и подключение к WhatsApp Web. Подождите 20–40 секунд.</p>
            <p style="color:#94a3b8;font-size:13px;">Страница обновляется автоматически</p>
        </body>
        </html>
    `;
}

function getStatus() {
    return {
        ready: isReady,
        authenticated: isAuthenticated,
        initializing: isInitializing,
    };
}

async function sendMessage(phone, message) {
    if (!isReady) {
        throw new Error('WhatsApp is not connected. Please scan QR code first.');
    }
    const formattedPhone = phone.replace('+', '').replace(/\s/g, '') + '@c.us';
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    const response = await client.sendMessage(formattedPhone, message);
    return { success: true, messageId: response.id.id, status: 'sent' };
}

async function logout() {
    isReady = false;
    isAuthenticated = false;
    isInitializing = false;
    currentQrCodeData = null;
    if (client) {
        try { await client.logout(); } catch {}
        try { await client.destroy(); } catch {}
        client = null;
    }
    // Запустить заново — для нового QR
    setTimeout(() => initWhatsAppClient(), 2000);
}

module.exports = {
    initWhatsAppClient,
    getQrCodeHtml,
    getStatus,
    sendMessage,
    logout,
};
