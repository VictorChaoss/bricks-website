export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'No image provided' });
  }

  try {
    const replicateToken = process.env.REPLICATE_API_TOKEN;
    if (!replicateToken) {
        return res.status(500).json({ error: 'REPLICATE_API_TOKEN is missing in Vercel Environment Variables.' });
    }

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${replicateToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "a07f252abbbd832009640b27f063ea52d87d7a23a185ca165bec23b5adc8deaf",
        input: {
          image: image,
          style: "3D",
          prompt: "A detailed 3D render of a Lego minifigure toy, shiny plastic texture, smooth, high quality, solid color background. retain the exact face shape and likeness",
          negative_prompt: "realistic skin, blur, ugly, deformed, noisy",
          prompt_strength: 0.55,
          denoising_strength: 0.65
        },
      }),
    });

    if (response.status !== 201) {
      const error = await response.json();
      return res.status(500).json({ error: error.detail || 'Failed to start generation' });
    }

    const prediction = await response.json();
    return res.status(200).json({ id: prediction.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
