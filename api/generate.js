export const maxDuration = 60;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── OpenRouter image generation via chat/completions + modalities ─────────────
// Tries two cheap image models in order before giving up.
async function generateWithOpenRouter(prompt, apiKey) {
  const models = [
    'google/gemini-2.5-flash-image',  // ~$0.0025 per 1k tokens – effectively pennies
    'openai/gpt-5-image-mini',        // fallback
  ];

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    console.log(`[OR Image] Trying model: ${model}`);

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://bricks-website.vercel.app",
        "X-Title": "Bricks PFP Maker"
      },
      body: JSON.stringify({
        model,
        modalities: ["image"],          // tells OpenRouter we want an image output
        messages: [{
          role: "user",
          content: prompt
        }]
      })
    });

    if (!res.ok) {
      const txt = await res.text();
      console.warn(`[OR Image] ${model} failed (${res.status}): ${txt.substring(0, 200)}`);
      if (i < models.length - 1) { await sleep(1000); continue; }
      throw new Error(`OpenRouter image generation failed after all models: ${res.status}`);
    }

    const json = await res.json();

    // OpenRouter returns images in message.images[] as base64 strings
    const images = json?.choices?.[0]?.message?.images;
    if (images && images.length > 0) {
      console.log(`[OR Image] Success with ${model}`);
      return `data:image/png;base64,${images[0]}`;
    }

    // Some models embed the image in content parts instead
    const content = json?.choices?.[0]?.message?.content;
    if (Array.isArray(content)) {
      const imgPart = content.find(p => p.type === 'image_url');
      if (imgPart?.image_url?.url) return imgPart.image_url.url;
      const inlinePart = content.find(p => p.type === 'inline_data' || p.inlineData);
      const inline = inlinePart?.inline_data || inlinePart?.inlineData;
      if (inline?.data) return `data:${inline.mime_type || 'image/png'};base64,${inline.data}`;
    }

    // Unexpected response structure — log it and try next model
    console.warn(`[OR Image] ${model} returned unexpected structure:`, JSON.stringify(json).substring(0, 300));
    if (i < models.length - 1) { await sleep(1000); continue; }
    throw new Error(`OpenRouter returned no image data. Raw: ${JSON.stringify(json).substring(0, 200)}`);
  }
}

// ── Pollinations fallback (free, Flux) ──────────────────────────────────────
async function generateWithPollinations(prompt) {
  const models = ['flux', 'turbo'];
  const encodedPrompt = encodeURIComponent(prompt);

  for (let i = 0; i < models.length; i++) {
    if (i > 0) await sleep(1500);
    const model = models[i];
    const seed  = Math.floor(Math.random() * 999999);
    const url   = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&model=${model}&nologo=true&seed=${seed}`;
    const imgRes = await fetch(url);
    if (imgRes.ok) {
      const buf = Buffer.from(await imgRes.arrayBuffer());
      const ct  = imgRes.headers.get('content-type') || 'image/jpeg';
      return `data:${ct};base64,${buf.toString('base64')}`;
    }
    if (imgRes.status !== 429) throw new Error(`Pollinations failed: ${imgRes.status}`);
  }
  throw new Error('Image generation failed after retries. Please try again in a moment.');
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { image, background } = req.body;
  if (!image) return res.status(400).json({ error: 'No image provided' });

  const bg     = (background?.trim()) ? background.trim() : 'clean white studio background';
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OPENROUTER_API_KEY not set in Vercel environment.' });

  try {
    // ── Step 1: Vision — describe the person ──────────────────────────────────
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
            {
              type: "text",
              text: "Describe this person's physical appearance for an AI image generator. Include: hair color and style, skin tone, eye color if visible, face shape, and any notable clothing. Keep it to 1-2 sentences max. Be specific and factual."
            },
            { type: "image_url", image_url: { url: image } }
          ]
        }]
      })
    });

    if (!visionRes.ok) {
      const txt = await visionRes.text();
      return res.status(502).json({ error: `Vision step failed (${visionRes.status}): ${txt.substring(0, 200)}` });
    }

    const visionJson  = await visionRes.json();
    const description = visionJson?.choices?.[0]?.message?.content;
    if (!description || typeof description !== 'string') {
      return res.status(502).json({ error: 'Vision returned no usable description.' });
    }

    // ── Step 2: Image generation ──────────────────────────────────────────────
    const prompt = `A 3D rendered glossy plastic LEGO minifigure character. The LEGO figure must match this person's appearance exactly: ${description}. Background: ${bg}. Studio lighting, product photo style, photorealistic LEGO plastic texture.`;

    let imageUrl;
    try {
      // Primary: use OpenRouter credits
      imageUrl = await generateWithOpenRouter(prompt, apiKey);
    } catch (orErr) {
      console.warn('[PFP] OpenRouter image gen failed, falling back to Pollinations:', orErr.message);
      // Fallback: Pollinations (free Flux)
      imageUrl = await generateWithPollinations(prompt);
    }

    return res.status(200).json({ url: imageUrl, description });

  } catch (err) {
    console.error('[PFP Generate Error]', err);
    return res.status(500).json({ error: err.message });
  }
}
