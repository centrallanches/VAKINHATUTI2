export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { amount } = req.body;
    
    // Pega a chave da API que você configurou no Vercel
    const ELITE_PAY_API_KEY = process.env.ELITE_PAY_API_KEY;
    
    if (!ELITE_PAY_API_KEY) {
      return res.status(500).json({ error: 'Chave da API não configurada' });
    }

    // Chama a Elite Pay
    const response = await fetch('https://api.elitepay.com.br/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ELITE_PAY_API_KEY}`,
      },
      body: JSON.stringify({
        amount: amount * 100, // Converte Reais para Centavos
        currency: 'BRL',
        description: 'Doação Tuti',
        payment_method: 'pix', // Força o método PIX
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao criar pagamento na Elite Pay');
    }

    // Retorna o código Pix Copia e Cola para o frontend
    // Ajuste 'data.qr_code' ou 'data.pix_code' conforme o retorno real da sua API
    return res.status(200).json({ 
      success: true, 
      pixCode: data.qr_code || data.pix_code || data.payment_url 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
