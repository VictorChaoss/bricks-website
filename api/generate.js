export const maxDuration = 60;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── OpenRouter image generation with strict timeout ───────────────────────────
async function generateWithOpenRouter(prompt, apiKey) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000); // 25s max

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization":  `Bearer ${apiKey}`,
        "Content-Type":   "application/json",
        "HTTP-Referer":   "https://www.bricksonsol.xyz",
        "X-Title":        "Bricks PFP Maker"
      },
      body: JSON.stringify({
        model:      "black-forest-labs/flux-1.1-pro",  // dedicated text-to-image model
        modalities: ["image"],
        messages:   [{ role: "user", content: prompt }]
      })
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`OpenRouter ${res.status}: ${txt.substring(0, 150)}`);
    }

    const json = await res.json();
    const choice = json?.choices?.[0]?.message;

    // Shape 1: message.images[] — array of base64 strings
    if (Array.isArray(choice?.images) && choice.images[0]) {
      const b64 = choice.images[0];
      if (b64.length > 500) return `data:image/png;base64,${b64}`;
    }

    // Shape 2: content parts
    if (Array.isArray(choice?.content)) {
      for (const part of choice.content) {
        if (part.type === 'image_url' && part.image_url?.url) {
          return await fetchToDataUri(part.image_url.url);
        }
        const inline = part.inline_data || part.inlineData;
        if (inline?.data) return `data:${inline.mime_type || 'image/png'};base64,${inline.data}`;
      }
    }

    // Shape 3: plain string content (URL or base64)
    if (typeof choice?.content === 'string' && choice.content.length > 100) {
      if (choice.content.startsWith('http')) return await fetchToDataUri(choice.content);
      if (choice.content.startsWith('data:')) return choice.content;
      return `data:image/png;base64,${choice.content}`;
    }

    throw new Error(`Unrecognised OR response: ${JSON.stringify(json).substring(0, 200)}`);

  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') throw new Error('OpenRouter timed out after 25s');
    throw err;
  }
}

// Fetch a remote image URL server-side → base64 data URI (avoids CORS on client)
async function fetchToDataUri(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image from OR URL: ${res.status}`);
  const ct  = res.headers.get('content-type') || 'image/png';
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 500) throw new Error('Fetched image is empty');
  return `data:${ct};base64,${buf.toString('base64')}`;
}

// ── Pollinations fallback (free Flux) ────────────────────────────────────────
async function generateWithPollinations(prompt) {
  const models  = ['flux', 'turbo'];
  const encoded = encodeURIComponent(prompt);

  for (let i = 0; i < models.length; i++) {
    if (i > 0) await sleep(2000);
    const seed = Math.floor(Math.random() * 999999);
    const url  = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&model=${models[i]}&nologo=true&seed=${seed}`;
    const res  = await fetch(url);
    if (res.ok) {
      const ct  = res.headers.get('content-type') || 'image/jpeg';
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 500) continue;
      return `data:${ct};base64,${buf.toString('base64')}`;
    }
    if (res.status !== 429) throw new Error(`Pollinations failed: ${res.status}`);
  }
  throw new Error('Image generation temporarily unavailable. Please try again.');
}

// ── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { image, background } = req.body;
  if (!image) return res.status(400).json({ error: 'No image provided' });

  const bg     = background?.trim() || 'clean white studio background';
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured.' });

  try {
    // Step 1 — Vision: describe the person
    console.log('[Vision] Calling GPT-4o-mini');
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
            { type: "text", text: "Describe this person's physical appearance for an AI image generator. Include hair color and style, skin tone, eye color if visible, face shape, notable clothing. 1-2 sentences, specific and factual." },
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
    if (!description || typeof description !== 'string') {
      return res.status(502).json({ error: 'Vision returned no description.' });
    }
    console.log('[Vision] OK:', description.substring(0, 80));

    // Step 2 — Image generation
    const prompt = `A 3D rendered glossy plastic LEGO minifigure character. The figure must match this person's appearance exactly: ${description}. Background: ${bg}. Studio lighting, product photo style, photorealistic LEGO plastic texture.`;

    let imageUrl;
    try {
      console.log('[Image] Trying OpenRouter Flux-1.1-Pro');
      imageUrl = await generateWithOpenRouter(prompt, apiKey);
      console.log('[Image] OpenRouter success');
    } catch (orErr) {
      console.warn('[Image] OpenRouter failed:', orErr.message, '— falling back to Pollinations');
      imageUrl = await generateWithPollinations(prompt);
      console.log('[Image] Pollinations success');
    }

    return res.status(200).json({ url: imageUrl, description });

  } catch (err) {
    console.error('[PFP Error]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
