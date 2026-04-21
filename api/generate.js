export const maxDuration = 60;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── OpenRouter Flux.2-Pro image generation ────────────────────────────────────
async function generateWithOpenRouter(prompt, apiKey) {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), 28000);

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type":  "application/json",
        "HTTP-Referer":  "https://www.bricksonsol.xyz",
        "X-Title":       "Bricks PFP Maker"
      },
      body: JSON.stringify({
        model:      "black-forest-labs/flux.2-pro",
        modalities: ["image"],
        messages:   [{ role: "user", content: prompt }]
      })
    });
    clearTimeout(tid);

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`OR ${res.status}: ${txt.substring(0, 150)}`);
    }

    const json   = await res.json();
    const choice = json?.choices?.[0]?.message;

    // Shape 1: message.images[] — base64 strings
    if (Array.isArray(choice?.images) && choice.images[0]?.length > 500) {
      return `data:image/png;base64,${choice.images[0]}`;
    }

    // Shape 2: content array with parts
    if (Array.isArray(choice?.content)) {
      for (const part of choice.content) {
        if (part.type === 'image_url' && part.image_url?.url) {
          return await urlToDataUri(part.image_url.url);
        }
        const inline = part.inline_data || part.inlineData;
        if (inline?.data) return `data:${inline.mime_type || 'image/png'};base64,${inline.data}`;
      }
    }

    // Shape 3: string content (URL or base64)
    if (typeof choice?.content === 'string' && choice.content.length > 200) {
      if (choice.content.startsWith('http')) return await urlToDataUri(choice.content);
      if (choice.content.startsWith('data:')) return choice.content;
      return `data:image/png;base64,${choice.content}`;
    }

    throw new Error(`Unrecognised OR response shape: ${JSON.stringify(json).substring(0, 200)}`);
  } catch (err) {
    clearTimeout(tid);
    if (err.name === 'AbortError') throw new Error('OpenRouter timed out');
    throw err;
  }
}

async function urlToDataUri(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Could not fetch OR image URL: ${r.status}`);
  const ct  = r.headers.get('content-type') || 'image/png';
  const buf = Buffer.from(await r.arrayBuffer());
  return `data:${ct};base64,${buf.toString('base64')}`;
}

// ── Pollinations fallback ─────────────────────────────────────────────────────
async function generateWithPollinations(prompt) {
  const models  = ['flux', 'turbo'];
  const encoded = encodeURIComponent(prompt);

  for (let i = 0; i < models.length; i++) {
    if (i > 0) await sleep(1500);
    const seed = Math.floor(Math.random() * 999999);
    const url  = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&model=${models[i]}&nologo=true&seed=${seed}`;
    const res  = await fetch(url);
    if (res.ok) {
      const ct  = res.headers.get('content-type') || 'image/jpeg';
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 500) return `data:${ct};base64,${buf.toString('base64')}`;
    }
    if (res.status !== 429) throw new Error(`Pollinations ${res.status}`);
  }
  throw new Error('All image generation services are busy. Please try again in a moment.');
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { image, background } = req.body;
  if (!image) return res.status(400).json({ error: 'No image provided' });

  const bg     = background?.trim() || 'clean white studio background';
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured.' });

  try {
    // Step 1 — Vision
    const visionRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type":  "application/json",
        "HTTP-Referer":  "https://www.bricksonsol.xyz",
        "X-Title":       "Bricks PFP Maker"
      },
      body: JSON.stringify({
        model:      "openai/gpt-4o-mini",
        max_tokens: 200,
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "Describe this person's physical appearance for an AI image generator. Include hair color and style, skin tone, eye color if visible, face shape, notable clothing. 1-2 sentences max, specific and factual." },
            { type: "image_url", image_url: { url: image } }
          ]
        }]
      })
    });

    if (!visionRes.ok) {
      const txt = await visionRes.text();
      return res.status(502).json({ error: `Vision failed (${visionRes.status}): ${txt.substring(0, 200)}` });
    }

    const visionJson  = await visionRes.json();
    const description = visionJson?.choices?.[0]?.message?.content;
    if (!description) return res.status(502).json({ error: 'Could not analyse photo.' });

    // Step 2 — Image
    const prompt = `A 3D rendered glossy plastic LEGO minifigure character. The figure must match this person's appearance exactly: ${description}. Background: ${bg}. Studio lighting, product photo style, photorealistic LEGO plastic texture.`;

    let imageUrl;
    try {
      console.log('[Image] Trying OpenRouter flux.2-pro');
      imageUrl = await generateWithOpenRouter(prompt, apiKey);
      console.log('[Image] OpenRouter success');
    } catch (orErr) {
      console.warn('[Image] OR failed:', orErr.message, '→ Pollinations fallback');
      imageUrl = await generateWithPollinations(prompt);
      console.log('[Image] Pollinations success');
    }

    return res.status(200).json({ url: imageUrl, description });

  } catch (err) {
    console.error('[PFP Error]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
