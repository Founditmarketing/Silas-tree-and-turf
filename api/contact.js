import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, email, phone, message, source } = req.body;

  // Basic validation
  if (!name || !message) {
    return res.status(400).json({ error: 'Name and message are required.' });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Silas Tree & Turf <hello@silastreeandturf.com>',
      to: ['silastreeandturf@gmail.com'],
      reply_to: email || undefined,
      subject: `New Inquiry from ${name} — Silas Tree & Turf`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #123a02 0%, #1a5203 100%); padding: 36px 40px; text-align: center;">
            <h1 style="color: #54a029; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Silas Tree & Turf</h1>
            <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 8px 0 0; text-transform: uppercase; letter-spacing: 2px;">New Contact Inquiry</p>
          </div>

          <!-- Body -->
          <div style="padding: 40px;">
            <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">You have received a new inquiry through your website${source ? ` (${source})` : ''}.</p>

            <!-- Details Card -->
            <div style="background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; margin-bottom: 24px;">
              <div style="padding: 16px 24px; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; gap: 12px;">
                <span style="font-weight: 700; color: #123a02; width: 80px; flex-shrink: 0;">Name</span>
                <span style="color: #374151;">${name}</span>
              </div>
              ${email ? `<div style="padding: 16px 24px; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; gap: 12px;">
                <span style="font-weight: 700; color: #123a02; width: 80px; flex-shrink: 0;">Email</span>
                <a href="mailto:${email}" style="color: #54a029; text-decoration: none;">${email}</a>
              </div>` : ''}
              ${phone ? `<div style="padding: 16px 24px; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; gap: 12px;">
                <span style="font-weight: 700; color: #123a02; width: 80px; flex-shrink: 0;">Phone</span>
                <a href="tel:${phone}" style="color: #54a029; text-decoration: none;">${phone}</a>
              </div>` : ''}
            </div>

            <!-- Message -->
            <div style="background: #f0fdf4; border-left: 4px solid #54a029; border-radius: 0 8px 8px 0; padding: 20px 24px; margin-bottom: 32px;">
              <p style="color: #6b7280; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 8px;">Message</p>
              <p style="color: #111827; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>

            <!-- CTA -->
            ${email ? `<div style="text-align: center;">
              <a href="mailto:${email}" style="display: inline-block; background: linear-gradient(135deg, #54a029, #3d7a1e); color: white; font-weight: 700; font-size: 15px; padding: 14px 36px; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 14px rgba(84,160,41,0.4);">Reply to ${name}</a>
            </div>` : ''}
          </div>

          <!-- Footer -->
          <div style="background: #f1f5f9; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2026 Silas Tree and Turf · Fairhope, AL · <a href="tel:2512785506" style="color: #54a029; text-decoration: none;">251.278.5506</a></p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email. Please try again.' });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}
