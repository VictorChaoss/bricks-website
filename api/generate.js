export const maxDuration = 60;

// Small sleep helper
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Pollinations fetch with retry + model fallback on 429
async function fetchPollinationsImage(prompt, retries = 3) {
  const models = ['flux', 'turbo', 'flux-realism'];
  const encodedPrompt = encodeURIComponent(prompt);

  for (let attempt = 0; attempt < retries; attempt++) {
    const model = models[attempt % models.length];
    const seed  = Math.floor(Math.random() * 999999);
    const url   = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&model=${model}&nologo=true&seed=${seed}`;

    const imgRes = await fetch(url);

    if (imgRes.ok) {
      return imgRes; // success
    }

    if (imgRes.status === 429) {
      // Rate limited — wait a bit then try next model
      const waitMs = 1500 * (attempt + 1); // 1.5s, 3s, 4.5s
      console.warn(`[Pollinations] 429 on model=${model}, waiting ${waitMs}ms before retry ${attempt + 1}/${retries}`);
      await sleep(waitMs);
      continue;
    }

    // Any other error — fail immediately
    throw new Error(`Image generation failed: ${imgRes.status} ${imgRes.statusText}`);
  }

  throw new Error('Image generation failed after multiple retries (rate limited). Please try again in a moment.');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { image, background } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'No image provided' });
  }

  const bg = (background && background.trim()) ? background.trim() : 'clean white studio background';

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY missing from Vercel environment variables.' });
  }

  try {
    // ── Step 1: Describe the person using GPT-4o-mini vision ─────────────────
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
            {
              type: "image_url",
              image_url: { url: image }
            }
          ]
        }]
      })
    });

    if (!visionRes.ok) {
      const errText = await visionRes.text();
      return res.status(502).json({ error: `Vision failed (${visionRes.status}): ${errText.substring(0, 200)}` });
    }

    const visionJson = await visionRes.json();
    const description = visionJson?.choices?.[0]?.message?.content;

    if (!description || typeof description !== 'string') {
      return res.status(502).json({ error: 'Vision returned no usable description.' });
    }

    // ── Step 2: Generate Lego image via Pollinations.ai (with retry) ─────────
    const prompt = `A 3D rendered glossy plastic LEGO minifigure character. The LEGO figure must match this person's appearance exactly: ${description}. Background: ${bg}. Studio lighting, product photo style, photorealistic LEGO plastic texture.`;

    const imgRes = await fetchPollinationsImage(prompt);

    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await imgRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');

    return res.status(200).json({
      url: `data:${contentType};base64,${base64}`,
      description
    });

  } catch (err) {
    console.error('[PFP Generate Error]', err);
    return res.status(500).json({ error: err.message });
  }
}
