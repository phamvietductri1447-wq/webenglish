// Cloudflare Worker: giữ API key phía server, chỉ nhận prompt từ trang LexiQuest của bạn.
export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const allowed = env.ALLOWED_ORIGIN || '*';
    const cors = {
      'Access-Control-Allow-Origin': allowed === '*' ? '*' : (origin === allowed ? origin : allowed),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });
    if (allowed !== '*' && origin !== allowed) return new Response('Forbidden', { status: 403, headers: cors });
    let prompt;
    try { ({ prompt } = await req.json()); } catch { return new Response('Bad JSON', { status: 400, headers: cors }); }
    if (typeof prompt !== 'string' || !prompt || prompt.length > 12000)
      return new Response('Invalid prompt', { status: 400, headers: cors });
    const model = env.MODEL || 'gemini-2.5-flash';
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 8192 },
      }),
    });
    if (!r.ok) return new Response('Upstream error ' + r.status + ': ' + (await r.text()).slice(0, 400), { status: r.status === 429 ? 429 : 502, headers: cors });
    const d = await r.json();
    const text = ((d.candidates || [])[0]?.content?.parts || []).map(p => p.text || '').join('');
    return new Response(JSON.stringify({ text }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  },
};
