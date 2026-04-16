export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'No image URL provided' });
  }

  try {
    const response = await fetch(decodeURIComponent(url));
    if (!response.ok) {
      throw new Error('Failed to fetch image from external source');
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', response.headers.get('content-type') || 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename="bricks_identity.png"');
    
    return res.status(200).send(buffer);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error securely downloading image');
  }
}
