export const maxDuration = 60;

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

    // Step 1: Describe the person using vision model
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

    const visionText = await visionResponse.text();
    if (!visionResponse.ok) {
      return res.status(500).json({ error: "Vision failed: " + visionText });
    }

    const visionData = JSON.parse(visionText);
    if (!visionData.choices?.[0]?.message?.content) {
      return res.status(500).json({ error: 'Vision returned unexpected structure: ' + visionText.substring(0, 300) });
    }
    const faceDescription = visionData.choices[0].message.content;

    // Step 2: Generate the Lego image
    // Using openai/gpt-4o as the image generation bridge — returns a real image URL
    const genRes = await fetch("https://openrouter.ai/api/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-image-mini",
        prompt: `A 3D rendered glossy plastic LEGO minifigure toy with a plain white background. The minifigure looks like: ${faceDescription}. Studio lighting, photorealistic, clean product shot.`,
        n: 1,
        size: "1024x1024",
        response_format: "url"
      })
    });

    const genText = await genRes.text();
    if (!genRes.ok) {
      return res.status(500).json({ error: 'Image generation failed: ' + genText });
    }

    // Parse the standard OpenAI images/generations response: { data: [{ url: "..." }] }
    let genData;
    try {
      genData = JSON.parse(genText);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse image response: ' + genText.substring(0, 300) });
    }

    // Support both standard URL format and b64_json format
    let imageUrl = null;
    if (genData?.data?.[0]?.url) {
      imageUrl = genData.data[0].url;
    } else if (genData?.data?.[0]?.b64_json) {
      imageUrl = `data:image/png;base64,${genData.data[0].b64_json}`;
    } else if (genData?.choices?.[0]?.message) {
      // OpenRouter wraps image output as chat.completion - inspect the message structure
      const msg = genData.choices[0].message;
      // Dump the full message content structure for debugging
      return res.status(500).json({ 
        error: 'DEBUG - message structure: ' + JSON.stringify(msg).substring(0, 800) 
      });
    } else {
      return res.status(500).json({ error: 'Unrecognized structure keys: ' + Object.keys(genData).join(', ') + ' | ' + genText.substring(0, 300) });
    }

    return res.status(200).json({ url: imageUrl });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Fatal: ' + error.message });
  }
}
