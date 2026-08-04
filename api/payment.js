export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { amount } = req.body;

    const clientId = process.env.ELITE_CLIENT_ID;
    const clientSecret = process.env.ELITE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({
        success: false,
        error: "Credenciais da Elite Pay não configuradas."
      });
    }

    const response = await fetch("https://api.elitepaybr.com/api/v1/deposit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": clientId,
        "x-client-secret": clientSecret
      },
      body: JSON.stringify({
        amount: Number(amount),
        description: "Doação Tuti",
        payerName: "Apoiador",
        payerDocument: "12345678900"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({
      success: true,
      pixCode: data.copyPaste,
      qrCode: data.qrcodeUrl,
      transactionId: data.transactionId,
      status: data.status
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
