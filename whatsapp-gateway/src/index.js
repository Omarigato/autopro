require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const { initWhatsAppClient, getQrCodeHtml, getStatus, sendMessage, logout } = require('./whatsappClient');

const app = express();
const PORT = process.env.PORT || 3001;
const TOKEN = process.env.WHATSAPP_GATEWAY_TOKEN;
const ADMIN_LOGIN = process.env.ADMIN_LOGIN || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

// Configuration
app.use(helmet({
    contentSecurityPolicy: false, // allow inline scripts for simplicity in our html
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'super-secret-key-autopro',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Basic Rate Limit for /messages/send
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later.' }
});

// Middleware to check API token for backend communication
const checkApiToken = (req, res, next) => {
    if (!TOKEN) {
        console.warn('WHATSAPP_GATEWAY_TOKEN is not set on the server!');
        return next();
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'Unauthorized. Bearer token missing.' });
    }
    const token = authHeader.split(' ')[1];
    if (token !== TOKEN) {
        return res.status(403).json({ success: false, error: 'Forbidden. Invalid token.' });
    }
    next();
};

// Middleware to check Web Session
const checkWebSession = (req, res, next) => {
    if (req.session.isAuthenticated) {
        return next();
    }
    res.redirect('/login');
};

// ========================
// WEB UI ROUTES
// ========================

app.get('/login', (req, res) => {
    if (req.session.isAuthenticated) {
        return res.redirect('/');
    }
    res.send(`
        <html>
        <head>
            <meta charset="utf-8">
            <title>AutoPro WhatsApp Gateway - Login</title>
            <style>
                body { font-family: sans-serif; background-color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                .card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); text-align: center; width: 300px; }
                input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #e2e8f0; border-radius: 10px; box-sizing: border-box; }
                button { width: 100%; padding: 12px; background-color: #0f172a; color: white; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; margin-top: 10px; }
                button:hover { background-color: #1e293b; }
                h1 { margin-top: 0; color: #0f172a; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>Вход в Шлюз</h1>
                ${req.query.error ? '<p style="color:red;font-size:14px;">Неверный логин или пароль</p>' : ''}
                <form action="/login" method="POST">
                    <input type="text" name="username" placeholder="Логин" required>
                    <input type="password" name="password" placeholder="Пароль" required>
                    <button type="submit">Войти</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
        req.session.isAuthenticated = true;
        res.redirect('/');
    } else {
        res.redirect('/login?error=1');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/', checkWebSession, async (req, res) => {
    try {
        const qrHtml = await getQrCodeHtml();

        // Вставляем кнопку выхода и статус бар в HTML
        const modifiedHtml = qrHtml.replace('<body>', `
            <body>
                <div style="position:absolute; top:20px; right:20px; text-align:right;">
                    <a href="/logout" style="display:inline-block; padding:8px 16px; background:#dc2626; color:white; text-decoration:none; border-radius:8px; font-weight:bold;">Выйти из панели</a>
                </div>
                <div style="margin-top:20px;">
                    <form action="/api/logout-whatsapp" method="POST" onsubmit="return confirm('Вы уверены, что хотите разорвать сессию с телефоном?');">
                        <button type="submit" style="padding:10px 20px; background:#f59e0b; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Сбросить сессию WhatsApp</button>
                    </form>
                </div>
        `);
        res.send(modifiedHtml);
    } catch (e) {
        res.status(500).send("Error generating page: " + e.message);
    }
});

// Action to forcefully logout whatsapp session
app.post('/api/logout-whatsapp', checkWebSession, async (req, res) => {
    try {
        await logout();
        res.redirect('/');
    } catch (e) {
        res.send("Error logging out whatsapp: " + e.message);
    }
});


// ========================
// API ROUTES (Backend)
// ========================

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/status', (req, res) => {
    res.json(getStatus());
});

app.post('/messages/send', checkApiToken, apiLimiter, async (req, res) => {
    try {
        const { phone, message } = req.body;
        if (!phone || !message) {
            return res.status(400).json({ success: false, error: 'Phone and message are required.' });
        }

        const result = await sendMessage(phone, message);
        res.json(result);
    } catch (error) {
        console.error('Error sending message:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`WhatsApp Gateway is running on port ${PORT}`);
    if (!TOKEN) {
        console.warn('WARNING: WHATSAPP_GATEWAY_TOKEN is not set. API is unprotected!');
    }
    initWhatsAppClient();
});
