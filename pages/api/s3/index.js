import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "us-east-1", 
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  switch (req.method) {
    case "POST":
      try {
        const { fileType, key } = req.body;

        if (!fileType || !key) {
          return res.status(400).json({ error: "Faltan datos requeridos: fileType o key." });
        }

        const command = new PutObjectCommand({
          Bucket: "vibra-bucket", 
          Key: key, 
          ContentType: fileType, 
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        return res.status(200).json({
          url: signedUrl,
          key: key,
        });
      } catch (error) {
        console.error("Error generando la URL con firma previa:", error);
        return res.status(500).json({ error: "Falló la generación de la URL con firma previa." });
      }

    case "DELETE":
      try {
        const { key } = req.body;

        if (!key) {
          return res.status(400).json({ error: "Falta el key del objeto a eliminar." });
        }

        const command = new DeleteObjectCommand({
          Bucket: "vibra-bucket", 
          Key: key, 
        });

        await s3Client.send(command);

        return res.status(200).json({ message: "Objeto eliminado exitosamente." });
      } catch (error) {
        console.error("Error eliminando el objeto:", error);
        return res.status(500).json({ error: "Falló la eliminación del objeto." });
      }

    default:
      res.setHeader("Allow", ["POST", "DELETE"]);
      return res.status(405).end(`Método ${req.method} no permitido`);
  }
}
