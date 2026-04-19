export const maxDuration = 60;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Convert any image — remote URL or raw base64 — into a safe data URI
async function toDataUri(input, mimeHint = 'image/png') {
  if (!input) throw new Error('Empty image value from API');

  // Already a data URI — validate it has actual data
  if (input.startsWith('data:')) {
    const [, b64] = input.split(',');
    if (!b64 || b64.length < 100) throw new Error('Data URI too short — image likely empty');
    return input;
  }

  // Raw base64 string (no data: prefix) — wrap it
  if (!input.startsWith('http')) {
    if (input.length < 100) throw new Error('Base64 string too short — image likely empty');
    return `data:${mimeHint};base64,${input}`;
  }

  // Remote URL — fetch server-side to avoid CORS issues on the client
  const res = await fetch(input);
  if (!res.ok) throw new Error(`Failed to fetch image URL (${res.status})`);
  const ct  = res.headers.get('content-type') || mimeHint;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) throw new Error('Downloaded image too small — likely empty');
  return `data:${ct};base64,${buf.toString('base64')}`;
}

// ── OpenRouter image generation ───────────────────────────────────────────────
async function generateWithOpenRouter(prompt, apiKey) {
  const models = [
    'google/gemini-2.5-flash-image',
    'openai/gpt-5-image-mini',
  ];

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    console.log(`[OR Image] Trying: ${model}`);

    let res;
    try {
      res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://bricks-website.vercel.app",
          "X-Title": "Bricks PFP Maker"
        },
        body: JSON.stringify({
          model,
          modalities: ["image"],
          messages: [{ role: "user", content: prompt }]
        })
      });
    } catch (fetchErr) {
      console.warn(`[OR Image] Network error on ${model}:`, fetchErr.message);
      if (i < models.length - 1) { await sleep(1000); continue; }
      throw fetchErr;
    }

    if (!res.ok) {
      const txt = await res.text();
      console.warn(`[OR Image] ${model} HTTP ${res.status}:`, txt.substring(0, 200));
      if (i < models.length - 1) { await sleep(1000); continue; }
      throw new Error(`OpenRouter image gen failed (${res.status})`);
    }

    let json;
    try { json = await res.json(); } catch (e) {
      console.warn(`[OR Image] ${model} returned non-JSON`);
      if (i < models.length - 1) { await sleep(1000); continue; }
      throw new Error('OpenRouter returned non-JSON response');
    }

    const choice = json?.choices?.[0]?.message;
    if (!choice) {
      console.warn(`[OR Image] ${model} no choice:`, JSON.stringify(json).substring(0, 200));
      if (i < models.length - 1) { await sleep(1000); continue; }
      throw new Error('No choice in OpenRouter response');
    }

    // Try every known response shape
    try {
      // Shape 1: message.images[] — array of base64 strings
      if (Array.isArray(choice.images) && choice.images[0]) {
        return await toDataUri(choice.images[0]);
      }

      // Shape 2: content as array of parts
      if (Array.isArray(choice.content)) {
        for (const part of choice.content) {
          if (part.type === 'image_url' && part.image_url?.url) {
            return await toDataUri(part.image_url.url);
          }
          const inline = part.inline_data || part.inlineData;
          if (inline?.data) {
            return await toDataUri(inline.data, inline.mime_type || 'image/png');
          }
        }
      }

      // Shape 3: content is a plain string that might be a URL or base64
      if (typeof choice.content === 'string' && choice.content.length > 50) {
        return await toDataUri(choice.content);
      }
    } catch (parseErr) {
      console.warn(`[OR Image] ${model} parse error:`, parseErr.message);
      if (i < models.length - 1) { await sleep(1000); continue; }
      throw parseErr;
    }

    // Unrecognised structure
    console.warn(`[OR Image] ${model} unrecognised response shape:`, JSON.stringify(json).substring(0, 300));
    if (i < models.length - 1) { await sleep(1000); continue; }
    throw new Error(`Unrecognised image response from ${model}`);
  }
}

// ── Pollinations fallback ─────────────────────────────────────────────────────
async function generateWithPollinations(prompt) {
  const models = ['flux', 'turbo'];
  const encoded = encodeURIComponent(prompt);

  for (let i = 0; i < models.length; i++) {
    if (i > 0) await sleep(1500);
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&model=${models[i]}&nologo=true&seed=${Math.floor(Math.random() * 999999)}`;
    const imgRes = await fetch(url);
    if (imgRes.ok) {
      const ct  = imgRes.headers.get('content-type') || 'image/jpeg';
      const buf = Buffer.from(await imgRes.arrayBuffer());
      if (buf.length < 1000) throw new Error('Pollinations returned empty image');
      return `data:${ct};base64,${buf.toString('base64')}`;
    }
    if (imgRes.status !== 429) throw new Error(`Pollinations failed: ${imgRes.status}`);
  }
  throw new Error('Image generation rate limited. Please try again in a moment.');
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { image, background } = req.body;
  if (!image) return res.status(400).json({ error: 'No image provided' });

  const bg     = background?.trim() || 'clean white studio background';
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured.' });

  try {
    // Step 1 — Vision
    const visionRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://bricks-website.vercel.app",
        "X-Title": "Bricks PFP Maker"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        max_tokens: 200,
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "Describe this person's physical appearance for an AI image generator. Include: hair color and style, skin tone, eye color if visible, face shape, and any notable clothing. 1-2 sentences, specific and factual." },
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

    // Step 2 — Image generation
    const prompt = `A 3D rendered glossy plastic LEGO minifigure character. The figure must match this person's appearance exactly: ${description}. Background: ${bg}. Studio lighting, product photo style, photorealistic LEGO plastic texture.`;

    let imageUrl;
    try {
      imageUrl = await generateWithOpenRouter(prompt, apiKey);
    } catch (orErr) {
      console.warn('[PFP] OpenRouter failed, falling back to Pollinations:', orErr.message);
      imageUrl = await generateWithPollinations(prompt);
    }

    return res.status(200).json({ url: imageUrl, description });

  } catch (err) {
    console.error('[PFP Error]', err);
    return res.status(500).json({ error: err.message });
  }
}
