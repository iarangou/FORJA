import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: Transporter;
  private readonly logger=new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.getOrThrow<string>('SMTP_HOST'),
      port: Number(config.getOrThrow<string>('SMTP_PORT')),
      secure: config.get<string>('SMTP_SECURE') === 'true',
      auth: {
        user: config.getOrThrow<string>('SMTP_USER'),
        pass: config.getOrThrow<string>('SMTP_PASSWORD'),
      },
    });
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    if(this.config.get<string>('VERIFICATION_LOG_CODES')==='true' &&
       this.config.get<string>('NODE_ENV')==='development'){
      // Únicamente para el entorno de pruebas local, nunca producción.
      this.logger.warn(`Código de prueba para ${email}: ${code}`);
      return;
    }
    if(!this.config.get<string>('SMTP_HOST')||
       !this.config.get<string>('SMTP_FROM')){
      throw new ServiceUnavailableException('Falta configurar el correo de verificación');
    }
    await this.transporter.sendMail({
      from: this.config.getOrThrow<string>('SMTP_FROM'),
      to: email,
      subject: 'Verifica tu cuenta de Forja',
      text: `Tu código de verificación es ${code}. Vence en 10 minutos.`,
      html: `
        <h2>Verificación de correo</h2>
        <p>Tu código de verificación es:</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:6px">
          ${code}
        </p>
        <p>Este código vence en 10 minutos.</p>
        <p>Si no solicitaste el registro, ignora este mensaje.</p>
      `,
    });
  }
}