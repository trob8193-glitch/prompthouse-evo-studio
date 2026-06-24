import nodemailer from 'nodemailer';
import { Log } from '../../autonomy/SovereignLogger.js';

export class EmailVector {
  constructor() {
    this.name = 'EmailVector';
    const smtpUrl = process.env.SMTP_URL; // e.g. smtps://user:pass@smtp.gmail.com
    
    if (!smtpUrl) {
      Log.error('[FATAL_REALITY_ERROR] SMTP_URL is missing. No simulations allowed in Evo Studio.');
      throw new Error("SMTP_URL missing. Absolute reality required for Email Vector.");
    }
    
    // smtp://username:password@host:port
    this.transporter = nodemailer.createTransport(smtpUrl);
    Log.info(`[EmailVector] Live SMTP connection established. Absolute Reality Engaged.`);
  }

  async sendColdOutreach(targetEmail, subject, htmlBody) {
    Log.info(`[EmailVector] 📧 Executing cold outreach to: ${targetEmail}`);
    try {
      const info = await this.transporter.sendMail({
        from: '"Evo Studio Autonomous Engine" <system@prompthouse.io>', // Default, overridden by SMTP config usually
        to: targetEmail,
        subject: subject,
        html: htmlBody,
      });
      Log.success(`[EmailVector] Message physically sent! Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      Log.error(`[EmailVector] Failed to send email: ${error.message}`);
      return false;
    }
  }
}
