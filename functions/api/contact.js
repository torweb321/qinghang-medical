// Cloudflare Pages Function — POST /api/contact
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

  // Debug: check if env vars exist
  var debug = {
    has_token: !!env.TG_BOT_TOKEN,
    has_chat: !!env.TG_CHAT_ID,
    token_prefix: env.TG_BOT_TOKEN ? env.TG_BOT_TOKEN.substring(0, 8) + '...' : 'missing',
    chat_id: env.TG_CHAT_ID || 'missing'
  };

  var timestamp = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Hong_Kong' });
  var services = Array.isArray(data.service) ? data.service.join(', ') : (data.service || '未选择');
  var destination = data.destination === 'other' && data.destination_other ? data.destination_other : (data.destination || '未选择');

  var text = [
    '📋 新咨询',
    '━━━━━━━━━━━━━', '⏰ ' + timestamp,
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

  if (env.TG_BOT_TOKEN && env.TG_CHAT_ID) {
    try {
      var tg = await fetch('https://api.telegram.org/bot' + env.TG_BOT_TOKEN + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: env.TG_CHAT_ID, text: text })
      });
      var tgResult = await tg.json();
      if (!tgResult.ok) errors.push('TG: ' + JSON.stringify(tgResult));
    } catch (e) {
      errors.push('TG: ' + e.message);
    }
  } else {
    errors.push('TG: env vars missing');
  }

  return new Response(JSON.stringify({
    success: true, message: '提交成功',
    debug: debug,
    errors: errors.length > 0 ? errors : undefined
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
