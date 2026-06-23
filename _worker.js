// Cloudflare Worker — 表单提交处理
// 部署到 Cloudflare Workers，设置路由 /api/contact

// 配置（部署时通过环境变量设置）
const CFG = {
  WEBHOOK_URL: typeof WEBHOOK_URL !== 'undefined' ? WEBHOOK_URL : '',
  TG_BOT_TOKEN: typeof TG_BOT_TOKEN !== 'undefined' ? TG_BOT_TOKEN : '',
  TG_CHAT_ID: typeof TG_CHAT_ID !== 'undefined' ? TG_CHAT_ID : '',
  GOOGLE_SCRIPT_URL: typeof GOOGLE_SCRIPT_URL !== 'undefined' ? GOOGLE_SCRIPT_URL : '',
};

async function handleRequest(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    var data = await request.json();
  } catch (e) {
    return new Response('Invalid JSON', { status: 400 });
  }

  // 验证必要字段
  if (!data.name || !data.phone) {
    return new Response(JSON.stringify({ error: '姓名和联系电话为必填项' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  var timestamp = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Hong_Kong' });

  // 格式化消息
  var services = Array.isArray(data.service) ? data.service.join(', ') : (data.service || '未选择');
  var destination = data.destination === 'other' && data.destination_other ? data.destination_other : (data.destination || '未选择');
  var message = [
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

  // 1. Telegram 通知
  if (CFG.TG_BOT_TOKEN && CFG.TG_CHAT_ID) {
    try {
      await fetch('https://api.telegram.org/bot' + CFG.TG_BOT_TOKEN + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CFG.TG_CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        })
      });
    } catch (e) {
      errors.push('Telegram: ' + e.message);
    }
  }

  // 2. Webhook (可选)
  if (CFG.WEBHOOK_URL) {
    try {
      await fetch(CFG.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, _timestamp: timestamp, _type: 'contact' })
      });
    } catch (e) {
      errors.push('Webhook: ' + e.message);
    }
  }

  // 3. Google Apps Script (写入 Google Sheets)
  if (CFG.GOOGLE_SCRIPT_URL) {
    try {
      await fetch(CFG.GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          age: data.age || '',
          city: data.city || '',
          service: services,
          destination: destination,
          wechat: data.wechat || '',
          phone: data.phone,
          message: data.message || '',
          timestamp: timestamp
        })
      });
    } catch (e) {
      errors.push('Google Sheets: ' + e.message);
    }
  }

  return new Response(JSON.stringify({
    success: true,
    message: '提交成功',
    errors: errors.length > 0 ? errors : undefined
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

addEventListener('fetch', function (event) {
  event.respondWith(handleRequest(event.request));
});
