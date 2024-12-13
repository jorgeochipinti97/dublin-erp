import NextAuth from "next-auth";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import Client from "@/models/Client";
import { connectDB } from "@/lib/database";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB(); // Conectar a la base de datos

        const { email, password } = credentials;

        // Buscar en la colección de usuarios
        const userFound = await User.findOne({ email });

        if (userFound) {
          const isPasswordValid = await bcrypt.compare(password, userFound.password);
          if (!isPasswordValid) {
            throw new Error("Contraseña incorrecta");
          }

          // Retorna el perfil del usuario con tipo "user"
          return {
            id: userFound._id.toString(),
            name: userFound.name,
            email: userFound.email,
            role: userFound.role,
            permissions: userFound.permissions || [],
            userType: "user",
          };
        }

        // Si no es un usuario, buscar en la colección de clientes
        const clientFound = await Client.findOne({ email });

        if (clientFound) {
          const isPasswordValid = await bcrypt.compare(password, clientFound.password);
          if (!isPasswordValid) {
            throw new Error("Contraseña incorrecta");
          }

          // Retorna el perfil del cliente con tipo "client"
          return {
            id: clientFound._id.toString(),
            name: clientFound.name,
            email: clientFound.email,
            role: "client",
            stores: clientFound.stores || [],
            users: clientFound.users || [],
            userType: "client",
          };
        }

        // Si no se encuentra en ninguna colección
        throw new Error("No se encontró al usuario o cliente con ese email");
      },
    }),
  ],

  pages: {
    signIn: "/", // Ruta personalizada de inicio de sesión
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Incluye el `_id` en el token
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.permissions = user.permissions;
        token.userType = user.userType;
        if (user.userType === "client") {
          token.stores = user.stores;
          token.users = user.users;
        }
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id; // Incluye el `_id` en la sesión
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.role = token.role;
      session.user.permissions = token.permissions;
      session.user.userType = token.userType;
      if (token.userType === "client") {
        session.user.stores = token.stores;
        session.user.users = token.users;
      }
      return session;
    },
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 24 * 60 * 60, // 24 horas
  },

  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
});
