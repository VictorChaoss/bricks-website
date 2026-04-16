export const maxDuration = 60;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'No image provided' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY missing from Vercel environment variables.' });
  }

  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "https://bricks-website.vercel.app",
    "X-Title": "Bricks PFP Maker"
  };

  try {
    // ── Step 1: Describe the person ──────────────────────────────────────────
    const visionRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "Describe this person's physical appearance (hair color, style, facial features, skin tone, clothing) in a detailed 2‑sentence paragraph. Be specific. Do not mention the background." },
            { type: "image_url", image_url: { url: image } }
          ]
        }]
      })
    });

    if (!visionRes.ok) {
      const t = await visionRes.text();
      return res.status(502).json({ error: `Vision call failed (${visionRes.status}): ${t.substring(0, 300)}` });
    }

    const visionJson = await visionRes.json();
    const description = visionJson?.choices?.[0]?.message?.content;
    if (!description || typeof description !== "string") {
      return res.status(502).json({ error: "Vision returned no description: " + JSON.stringify(visionJson).substring(0, 200) });
    }

    // ── Step 2: Generate the Lego image ──────────────────────────────────────
    const genRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        modalities: ["image", "text"],
        messages: [{
          role: "user",
          content: `Create a 3D rendered glossy plastic LEGO minifigure character on a clean white background. The LEGO figure must match this person's appearance exactly: ${description}. Studio lighting, product photo style.`
        }]
      })
    });

    if (!genRes.ok) {
      const t = await genRes.text();
      return res.status(502).json({ error: `Generation call failed (${genRes.status}): ${t.substring(0, 300)}` });
    }

    const genJson = await genRes.json();
    const content = genJson?.choices?.[0]?.message?.content;

    // OpenRouter image models return content as an array of typed parts
    if (Array.isArray(content)) {
      for (const part of content) {
        if (part.type === "image_url" && part.image_url?.url) {
          return res.status(200).json({ url: part.image_url.url });
        }
        // Some models nest the image inside inline_data
        if (part.type === "image" && part.source?.data) {
          const mime = part.source.media_type || "image/png";
          return res.status(200).json({ url: `data:${mime};base64,${part.source.data}` });
        }
      }
      // Parts found but no image — dump them so we can see the structure
      return res.status(502).json({ error: "No image part in response. Parts: " + JSON.stringify(content).substring(0, 400) });
    }

    // Some models return content as a plain string with a data URI or URL
    if (typeof content === "string") {
      const urlMatch = content.match(/(https?:\/\/[^\s)]+)/);
      if (urlMatch) return res.status(200).json({ url: urlMatch[1] });

      const b64Match = content.match(/(data:image\/[^\s)]+)/);
      if (b64Match) return res.status(200).json({ url: b64Match[1] });

      // String content but no image found — show it
      return res.status(502).json({ error: "Content was text, not image: " + content.substring(0, 300) });
    }

    // Totally unexpected structure — dump it
    return res.status(502).json({ error: "Unexpected response structure: " + JSON.stringify(genJson).substring(0, 400) });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server exception: " + err.message });
  }
}
