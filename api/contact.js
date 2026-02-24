export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { name, email, phone, service, message } = req.body || {};
  if (!name || !email || !phone) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer re_uNuDSJpa_7W4nZ4DQXKrXp823FcWhjjQA',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'eXpress Spa Deliveries <tim@sondersites.com>',
        to: ['expressspadelivery@gmail.com'],
        reply_to: email,
        subject: `New Quote Request from ${name}`,
        html: `
          <h2>New Quote Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Service:</strong> ${service || 'Not specified'}</p>
          <p><strong>Message:</strong></p>
          <p>${message || 'No message provided'}</p>
          <hr>
          <p style="color:#888;font-size:12px">Sent from expressspa.com.au contact form</p>
        `
      })
    });

    if (response.ok) return res.status(200).json({ success: true });
    const err = await response.text();
    return res.status(500).json({ error: err });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
