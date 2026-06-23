// Cloudflare Pages Function — POST /api/contact

var TG_BOT_TOKEN = '8977663630:AAFjtrA-og7IAEJmDu5Lq187Ntu-ZGF28D4';
var TG_CHAT_ID = '7561488528';

export async function onRequest(context) {
  var request = context.request;
  var env = context.env;

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  var data;
  try {
    data = await request.json();
  } catch (e) {
    return new Response('Invalid JSON', { status: 400 });
  }

  if (!data.name || !data.phone) {
    return new Response(JSON.stringify({ error: '姓名和联系电话为必填项' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  var timestamp = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Hong_Kong' });
  var services = Array.isArray(data.service) ? data.service.join(', ') : (data.service || '未选择');
  var destination = data.destination === 'other' && data.destination_other ? data.destination_other : (data.destination || '未选择');

  var text = [
    '📋 新咨询',
    '━━━━━━━━━━━━━',
    '⏰ ' + timestamp,
    '━━━━━━━━━━━━━',
    '👤 姓名: ' + data.name,
    '🎂 年龄: ' + (data.age || '未填写'),
    '🏙 城市: ' + (data.city || '未填写'),
    '📋 项目: ' + services,
    '📍 目的地: ' + destination,
    '💬 微信: ' + (data.wechat || '未填写'),
    '📞 电话: ' + data.phone,
    '📝 备注: ' + (data.message || '无'),
    '━━━━━━━━━━━━━'
  ].join('\n');

  var errors = [];

  var botToken = env.TG_BOT_TOKEN || TG_BOT_TOKEN;
  var chatId = env.TG_CHAT_ID || TG_CHAT_ID;

  if (botToken && chatId) {
    try {
      await fetch('https://api.telegram.org/bot' + botToken + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: text })
      });
    } catch (e) {
      errors.push('Telegram: ' + e.message);
    }
  }

  // Webhook
  if (env.WEBHOOK_URL) {
    try {
      await fetch(env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, _timestamp: timestamp })
      });
    } catch (e) {
      errors.push('Webhook: ' + e.message);
    }
  }

  // Google Sheets
  if (env.GOOGLE_SCRIPT_URL) {
    try {
      await fetch(env.GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name, age: data.age || '', city: data.city || '',
          service: services, destination: destination,
          wechat: data.wechat || '', phone: data.phone,
          message: data.message || '', timestamp: timestamp
        })
      });
    } catch (e) {
      errors.push('Google Sheets: ' + e.message);
    }
  }

  return new Response(JSON.stringify({
    success: true, message: '提交成功',
    errors: errors.length > 0 ? errors : undefined
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
