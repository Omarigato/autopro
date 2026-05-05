# AutoPro WhatsApp Gateway

Отдельный сервис для отправки сервисных сообщений через WhatsApp Web.

## Локальный запуск
1. Установите зависимости: `npm install`
2. Скопируйте `.env.example` в `.env` (если нужно) и задайте токен или установите переменную: `export WHATSAPP_GATEWAY_TOKEN=your_token`
3. Запустите: `npm start`
4. Откройте в браузере: `http://localhost:3001/qr`
5. Отсканируйте QR код через WhatsApp на телефоне (Настройки -> Связанные устройства -> Привязать устройство).
6. Проверьте статус: `http://localhost:3001/status` (должно быть `ready: true`).

## Отправка сообщений
```bash
curl -X POST http://localhost:3001/messages/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{"phone": "+77000000000", "message": "Test"}'
```

## Запуск в Docker
```bash
docker build -t autopro-whatsapp-gateway .
docker run -p 3001:3001 -e WHATSAPP_GATEWAY_TOKEN=your_token autopro-whatsapp-gateway
```
