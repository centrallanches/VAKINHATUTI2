export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { amount } = req.body;
    
    const ELITE_PAY_API_KEY = process.env.ELITE_PAY_API_KEY;
    const ELITE_CLIENT_ID = process.env.ELITE_CLIENT_ID; 
    
    if (!ELITE_PAY_API_KEY || !ELITE_CLIENT_ID) {
      return res.status(500).json({ error: 'Credenciais faltando' });
    }

    const response = await fetch('https://api.elitepay.com.br/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ELITE_PAY_API_KEY}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: 'BRL',
        description: 'Doação Tuti',
        payment_method: 'pix',
        client_id: ELITE_CLIENT_ID,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro na API');
    }

    const pixCode = data.qr_code || data.pix_code || data.payment_url;

    return res.status(200).json({ 
      success: true, 
      pixCode: pixCode 
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
