import { decodeToken } from "@/lib/utils";

// pages/api/protected.js


export default function handler(req, res) {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: "No autenticado" });
  }

  const user = decodeToken(token);

  if (!user || !user.permissions.includes("admin")) {
    return res.status(403).json({ message: "No autorizado" });
  }

  // Usuario autenticado y autorizado
  res.status(200).json({ message: "Acceso permitido" });
}
