import nodemailer from 'nodemailer';

// Configuración del transporter de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Función para generar un código de verificación aleatorio
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Función para enviar el correo de verificación
export const sendVerificationEmail = async (email: string, code: string): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Código de Verificación - App Ventas',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Verificación de Cuenta</h2>
          <p>Gracias por registrarte en App Ventas. Para completar tu registro, por favor utiliza el siguiente código de verificación:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; margin: 0;">${code}</h1>
          </div>
          <p>Este código expirará en 10 minutos.</p>
          <p>Si no solicitaste este registro, por favor ignora este correo.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    return false;
  }
}; 