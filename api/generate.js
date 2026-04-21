export const maxDuration = 60;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── Pollinations (Flux) — proven working ──────────────────────────────────────
async function generateImage(prompt) {
  const models  = ['flux', 'turbo'];
  const encoded = encodeURIComponent(prompt);

  for (let i = 0; i < models.length; i++) {
    if (i > 0) await sleep(2000);
    const seed = Math.floor(Math.random() * 999999);
    const url  = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&model=${models[i]}&nologo=true&seed=${seed}`;
    console.log(`[Image] Trying Pollinations model=${models[i]}`);

    const res = await fetch(url);

    if (res.ok) {
      const ct  = res.headers.get('content-type') || 'image/jpeg';
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 500) {
        console.log(`[Image] OK model=${models[i]} size=${buf.length}`);
        return `data:${ct};base64,${buf.toString('base64')}`;
      }
      console.warn(`[Image] Empty response from ${models[i]}, retrying`);
      continue;
    }

    if (res.status === 429) {
      console.warn(`[Image] 429 from ${models[i]}`);
      continue;
    }

    throw new Error(`Image generation failed: ${res.status}`);
  }

  throw new Error('Image generation temporarily unavailable. Please try again in a moment.');
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
    if (!description) return res.status(502).json({ error: 'Could not read face description.' });

    // Step 2 — Generate image
    const prompt = `A 3D rendered glossy plastic LEGO minifigure character. The figure must match this person's appearance exactly: ${description}. Background: ${bg}. Studio lighting, product photo style, photorealistic LEGO plastic texture.`;
    const imageUrl = await generateImage(prompt);

    return res.status(200).json({ url: imageUrl, description });

  } catch (err) {
    console.error('[PFP Error]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
