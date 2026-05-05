const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

let client = null;
let currentQrCodeData = null;
let isReady = false;
let isAuthenticated = false;
let isInitializing = false;

function createClient() {
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;
    if (executablePath) {
        console.log(`[WA] Using browser from env: ${executablePath}`);
    } else {
        console.log('[WA] Using puppeteer bundled Chromium');
    }

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
                '--disable-background-networking',
                '--single-process',
            ],
            timeout: 120000, // 2 минуты на запуск браузера
        },
    });
}

async function destroyClient() {
    if (!client) return;
    const c = client;
    client = null;
    try { await c.destroy(); } catch {}
}

async function initWhatsAppClient() {
    if (isInitializing) {
        console.log('[WA] Already initializing, skipping...');
        return;
    }
    isInitializing = true;
    isReady = false;
    isAuthenticated = false;
    currentQrCodeData = null;

    await destroyClient();

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
        console.log('[WA] Retrying in 15 seconds...');
        setTimeout(() => initWhatsAppClient(), 15000);
    });

    client.on('disconnected', (reason) => {
        console.log('[WA] Disconnected:', reason);
        isReady = false;
        isAuthenticated = false;
        isInitializing = false;
        console.log('[WA] Reconnecting in 10 seconds...');
        setTimeout(() => initWhatsAppClient(), 10000);
    });

    client.initialize().catch(async (err) => {
        console.error('[WA] Initialization error:', err.message || err);
        isReady = false;
        isAuthenticated = false;
        isInitializing = false;
        await destroyClient();
        console.log('[WA] Retrying in 15 seconds...');
        setTimeout(() => initWhatsAppClient(), 15000);
    });
}

async function getQrCodeHtml() {
    if (isReady && isAuthenticated) {
        return `
            <html><head><meta charset="utf-8"><title>AutoPro Gateway</title>
            <style>body{font-family:sans-serif;text-align:center;margin-top:80px;background:#f8fafc;}</style>
            </head><body>
            <h1 style="color:#16a34a">&#10003; WhatsApp Подключен</h1>
            <p>Сессия активна. Шлюз готов к работе.</p>
            <p><a href="/status">Проверить статус</a></p>
            </body></html>
        `;
    }

    if (isInitializing && !currentQrCodeData) {
        return `
            <html>
            <head><meta http-equiv="refresh" content="5"><meta charset="utf-8"><title>AutoPro Gateway</title>
            <style>body{font-family:sans-serif;text-align:center;margin-top:80px;background:#f8fafc;}</style>
            </head>
            <body>
                <h2>Запуск браузера...</h2>
                <p>Первый запуск может занять 30–60 секунд. Страница обновится автоматически.</p>
            </body>
            </html>
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
            <h2>Ожидание...</h2>
            <p>Шлюз запускается. Подождите.</p>
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
    await destroyClient();
    console.log('[WA] Logged out. Restarting in 3 seconds...');
    setTimeout(() => initWhatsAppClient(), 3000);
}

module.exports = {
    initWhatsAppClient,
    getQrCodeHtml,
    getStatus,
    sendMessage,
    logout,
};
