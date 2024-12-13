// pages/api/auth/register.js
import { connectDB } from '@/lib/database';
import User from '@/models/User';
import { hash } from 'bcryptjs';


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { name, email, password, role } = req.body;

  // Verificar que todos los campos requeridos estén presentes
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Por favor, completa todos los campos' });
  }

  try {
    await connectDB();

    // Verificar si el email ya está registrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(422).json({ message: 'El email ya está registrado' });
    }

    // Hashear la contraseña
    const hashedPassword = await hash(password, 12);

    // Crear el nuevo usuario
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'employee', // Asignar el rol predeterminado como 'employee' si no se proporciona uno
    });

    // Guardar el usuario en la base de datos
    await newUser.save();

    // Responder con éxito
    res.status(201).json({ message: 'Usuario creado correctamente', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}
