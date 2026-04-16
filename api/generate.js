export const maxDuration = 60; // Give Vercel 60 seconds to prevent timeouts

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'No image provided' });
  }

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'OPENROUTER_API_KEY is missing in Vercel Environment Variables.' });
    }

    // Step 1: Analyze the face using a Vision model on OpenRouter
    const visionResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [{
            role: "user",
            content: [
              { type: "text", text: "Describe this person's exact physical appearance (hair color/style, facial features, skin tone, prominent clothing) in a highly detailed 2-sentence paragraph. Do not mention the background." },
              { type: "image_url", image_url: { url: image } }
            ]
        }]
      })
    });

    if (!visionResponse.ok) {
        const err = await visionResponse.json();
        return res.status(500).json({ error: "Vision scan failed: " + (err.error?.message || "Unknown error") });
    }

    const visionData = await visionResponse.json();
    const faceDescription = visionData.choices[0].message.content;

    // Step 2: Generate the Lego PFP using DALL-E 3 on OpenRouter
    const generationResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/dall-e-3",
        messages: [{
          role: "user",
          content: `Generate a sleek, 3D glossy plastic lego minifigure character toy on a solid clean background. The minifigure MUST perfectly match this exact description: ${faceDescription}`
        }]
      })
    });

    if (!generationResponse.ok) {
      const error = await generationResponse.json();
      return res.status(500).json({ error: error.error?.message || 'Failed to generate image' });
    }

    const generationData = await generationResponse.json();
    
    // OpenRouter returns image URLs either directly or wrapped in Markdown
    let imageOutputUrl = generationData.choices[0].message.content;
    const urlMatch = imageOutputUrl.match(/(https?:\/\/[^\s\)]+)/);
    if (urlMatch) {
        imageOutputUrl = urlMatch[1];
    }

    return res.status(200).json({ url: imageOutputUrl });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
