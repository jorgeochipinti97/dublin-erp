import { Resend } from "resend";

const resend = new Resend('re_HCnjf7rR_LYSeJnhH1sPd2gnVNYQ8AEJU');

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const { to, storeName, orderId, trackingLink } = req.body;

  // Validar datos requeridos
  if (!to || !storeName || !orderId || !trackingLink) {
    return res.status(400).json({
      message: "Faltan campos requeridos: to, storeName, orderId, trackingLink",
    });
  }

  // HTML del correo
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Orden Despachada</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f8f9fa;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          padding: 20px;
          border: 1px solid #dddddd;
          border-radius: 8px;
        }
        h1 {
          color: #007BFF;
          font-size: 24px;
        }
        p {
          margin: 10px 0;
        }
        a {
          display: inline-block;
          background-color: #007BFF;
          color: #ffffff;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin-top: 20px;
        }
        a:hover {
          background-color: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Tu pedido ha sido despachado</h1>
        <p>Hola,</p>
        <p>Te informamos que tu pedido número <strong>${orderId}</strong> de <strong>${storeName}</strong> ha sido despachado por E-Full Logística.</p>
        <p>Puedes realizar el seguimiento de tu pedido haciendo clic en el siguiente enlace:</p>
        <a href="${trackingLink}">Rastrear mi pedido</a>
        <p>Tené en cuenta que  comenzarás a ver movimientos en tu pedido, dentro de las próximas 24 a 48 horas. ¡Gracias por confiar en nosotros!</p>
      </div>
    </body>
    </html>
  `;

  try {
    // Enviar correo con Resend
    const response = await resend.emails.send({
      from: "E-Full Logística <no-reply@logistica-e-full.com >",
      to,
      subject: `Tu pedido de ${storeName} ha sido despachado`,
      html: htmlContent,
    });

    res.status(200).json({ message: "Correo enviado exitosamente", response });
  } catch (error) {
    console.error("Error enviando correo:", error);
    res.status(500).json({ message: "Error al enviar correo", error: error.message });
  }
}
