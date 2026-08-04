export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { amount } = req.body;
    
    // Validação básica
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valor inválido' });
    }

    const ELITE_PAY_API_KEY = process.env.ELITE_PAY_API_KEY;
    
    if (!ELITE_PAY_API_KEY) {
      console.error('ERRO CRÍTICO: Variável ELITE_PAY_API_KEY não encontrada.');
      return res.status(500).json({ error: 'Configuração do servidor incompleta.' });
    }

    // Tenta conectar na Elite Pay
    const response = await fetch('https://api.elitepay.com.br/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ELITE_PAY_API_KEY}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Garante inteiro em centavos
        currency: 'BRL',
        description: 'Doação Tuti',
        payment_method: 'pix',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Loga o erro real no console do Vercel para você ver
      console.error('Erro Elite Pay:', data);
      throw new Error(data.message || `Erro HTTP ${response.status}`);
    }

    // Tenta achar o código Pix em diferentes campos comuns de APIs
    const pixCode = data.qr_code || data.pix_code || data.qrcode || data.payment_url;

    if (!pixCode) {
      console.error('Resposta da API sem código Pix:', data);
      throw new Error('A API não retornou um código Pix válido.');
    }

    return res.status(200).json({ 
      success: true, 
      pixCode: pixCode 
    });

  } catch (error) {
    console.error('Erro no backend:', error);
    return res.status(500).json({ error: error.message });
  }
}
