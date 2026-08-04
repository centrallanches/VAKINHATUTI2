export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { amount, customerEmail, customerName } = req.body;

    // Verifica se a chave está configurada
    const ELITE_PAY_API_KEY = process.env.ELITE_PAY_API_KEY;
    if (!ELITE_PAY_API_KEY) {
      return res.status(500).json({ error: 'Chave da API não configurada no Vercel' });
    }

    const response = await fetch('https://api.elitepay.com.br/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ELITE_PAY_API_KEY}`,
      },
      body: JSON.stringify({
        amount: amount * 100, // Valor em centavos
        currency: 'BRL',
        customer: {
          email: customerEmail,
          name: customerName,
        },
        description: 'Doação Tuti',
        payment_method: 'pix', // MUDANÇA AQUI: Força o PIX
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao criar pagamento');
    }

    // A Elite Pay geralmente retorna o QR Code em 'qr_code' ou 'qr_code_base64'
    // Ou um link 'payment_url' que contém o QR Code
    return res.status(200).json({ 
      success: true, 
      qrCode: data.qr_code || data.qr_code_base64,
      paymentUrl: data.payment_url 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
