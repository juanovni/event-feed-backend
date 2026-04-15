import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  family: 4,
  tls: {
    rejectUnauthorized: false, // 👈 importante en algunos entornos como Render
  },
});

const buildVerificationTemplate = (code: string, userName: string): string => `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Código de verificación</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f4f4f7;
        font-family: 'Helvetica Neue', Arial, sans-serif;
      }

      .wrapper {
        width: 100%;
        padding: 40px 20px;
        background-color: #f4f4f7;
      }

      .container {
        max-width: 520px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
      }

      .header {
        background: linear-gradient(135deg, #ffffff, #dbdbdb);
        padding: 40px 32px;
        text-align: center;
      }

      .header h1 {
        color: #0f0f0f;
        font-size: 24px;
        margin: 0;
        font-weight: 700;
        letter-spacing: -0.5px;
      }

      .header p {
        color: rgba(0, 0, 0, 0.85);
        font-size: 14px;
        margin: 8px 0 0;
      }

      .body {
        padding: 40px 32px;
      }

      .greeting {
        font-size: 16px;
        color: #374151;
        margin-bottom: 16px;
      }

      .description {
        font-size: 14px;
        color: #6b7280;
        line-height: 1.6;
        margin-bottom: 32px;
      }

      .code-box {
        background: #f3f4f6;
        border: 2px dashed #000000;
        border-radius: 12px;
        padding: 24px;
        text-align: center;
        margin-bottom: 32px;
      }

      .code {
        font-size: 48px;
        font-weight: 800;
        letter-spacing: 16px;
        color: #00000;
        font-family: 'Courier New', monospace;
      }

      .expiry {
        font-size: 12px;
        color: #9ca3af;
        margin-top: 8px;
      }

      .warning {
        background: #fef3c7;
        border-left: 4px solid #f59e0b;
        border-radius: 6px;
        padding: 12px 16px;
        font-size: 13px;
        color: #92400e;
        margin-bottom: 24px;
      }

      .footer {
        background: #f9fafb;
        padding: 24px 32px;
        text-align: center;
        border-top: 1px solid #e5e7eb;
      }

      .footer p {
        font-size: 12px;
        color: #9ca3af;
        margin: 0;
        line-height: 1.6;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="header">
          <h1>Verificación de cuenta</h1>
          <p>Tu código de acceso seguro</p>
        </div>
        <div class="body">
          <p class="greeting">Hola, <strong>${userName}</strong> 👋 </p>
          <p class="description"> Recibimos una solicitud para verificar tu identidad. Usa el siguiente código para continuar. No lo compartas con nadie. </p>
          <div class="code-box">
            <div class="code">${code}</div>
            <p class="expiry">⏱ Válido por <strong>5 minutos</strong>
            </p>
          </div>
          <div class="warning"> ⚠️ Si no solicitaste este código, ignora este correo. Tu cuenta permanece segura. </div>
        </div>
        <div class="footer">
          <p>Este correo fue enviado automáticamente. Por favor no respondas. <br />© ${new Date().getFullYear()} QueBuenPlan!. Todos los derechos reservados. </p>
        </div>
      </div>
    </div>
  </body>
</html>
`;

export const sendVerificationEmail = async (
  to: string,
  userName: string,
  code: string
): Promise<void> => {
  await transporter.sendMail({
    from: `"QueBuenPlan!" <${process.env.SMTP_USER}>`,
    to,
    subject: `${code} es tu código de verificación`,
    html: buildVerificationTemplate(code, userName),
  });
};