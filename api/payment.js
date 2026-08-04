export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { amount, customerEmail, customerName } = req.body;

    // SUBSTITUA AQUI PELA SUA CHAVE DA ELITE PAY
    const ELITE_PAY_API_KEY = 'SUA_CHAVE_AQUI'; 
    
    const response = await fetch('https://api.elitepay.com.br/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ELITE_PAY_API_KEY}`,
      },
      body: JSON.stringify({
        amount: amount * 100, 
        currency: 'BRL',
        customer: {
          email: customerEmail,
          name: customerName,
        },
        description: 'Doação Tuti',
        payment_method: 'credit_card',
      }),
    });

    const data = await response.json();
    
    // Se der erro na API, avisa aqui
    if (!response.ok) throw new Error(data.message || 'Erro na API');

    return res.status(200).json({ success: true, paymentUrl: data.payment_url });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
