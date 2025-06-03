import nodemailer from 'nodemailer';

// Validar variables de entorno
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  throw new Error('Las variables de entorno EMAIL_USER y EMAIL_PASSWORD son requeridas');
}

// Configuración del transporter de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Función para validar email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Función para generar un código de verificación aleatorio
export const generateVerificationCode = (): string => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  if (code.length !== 6) {
    throw new Error('Error al generar código de verificación');
  }
  return code;
};

// Función para enviar el correo de verificación
export const sendVerificationEmail = async (email: string, code: string): Promise<boolean> => {
  try {
    // Validar email
    if (!isValidEmail(email)) {
      console.error('Email inválido:', email);
      return false;
    }

    // Validar código
    if (!code || code.length !== 6) {
      console.error('Código de verificación inválido:', code);
      return false;
    }

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

    // Verificar la conexión antes de enviar
    await transporter.verify();
    
    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.messageId);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al enviar el correo:', {
        message: error.message,
        stack: error.stack
      });
    } else {
      console.error('Error desconocido al enviar el correo:', error);
    }
    return false;
  }
}; 