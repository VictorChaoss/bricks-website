export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'No prediction ID provided' });
  }

  try {
    const replicateToken = process.env.REPLICATE_API_TOKEN;
    const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: {
        "Authorization": `Token ${replicateToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status !== 200) {
      const error = await response.json();
      return res.status(500).json({ error: error.detail || 'Failed to check status' });
    }

    const prediction = await response.json();
    return res.status(200).json({
      status: prediction.status,
      output: prediction.output,
      error: prediction.error
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
