"use client";

import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Delete, PlusCircle } from "lucide-react";

const Page = () => {
  const { data: session } = useSession(); // Obtener la sesión
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]); // Estado para almacenar los usuarios

  // Obtener usuarios al cargar la página
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/database/users");
        if (!response.ok) {
          throw new Error("Error al obtener los usuarios");
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        setMessage(`Error: ${error.message}`);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newUser = {
      email,
      password,
      name,
      role,
    };

    try {
      // Crear el usuario
      const createUserResponse = await fetch("/api/database/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!createUserResponse.ok) {
        const errorData = await createUserResponse.json();
        throw new Error(errorData.message);
      }

      const createdUser = await createUserResponse.json();

      // Obtener clientId de la sesión
      const clientId = session?.user?.id; // Asegúrate de que el clientId está en session.user.id

      if (!clientId) {
        throw new Error("No se pudo obtener el ID del cliente de la sesión");
      }

      // Asociar el usuario con el cliente
      const associateResponse = await fetch("/api/database/clients/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: createdUser._id, // ID del usuario creado
          clientId, // ID del cliente obtenido de la sesión
        }),
      });

      if (!associateResponse.ok) {
        const errorData = await associateResponse.json();
        throw new Error(errorData.message);
      }

      // Actualizar la lista de usuarios
      setUsers((prevUsers) => [...prevUsers, createdUser]);

      setMessage("Usuario creado y asociado con éxito");
      setEmail("");
      setPassword("");
      setName("");
      setRole("user");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`/api/database/users/id/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error desconocido al eliminar el usuario"
        );
      }

      // Actualizar la lista de usuarios eliminando el usuario
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      toast({ title: "Usuario eliminado con éxito" });
    } catch (error) {
      toast({ title: `Error: ${error.message}` });
    }
  };

  if (!session) {
    return <p>Debe iniciar sesión para crear usuarios.</p>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Crear Usuario</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-md mb-8"
      >
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded w-full px-3 py-2"
            placeholder="Nombre del usuario"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded w-full px-3 py-2"
            placeholder="Correo electrónico"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded w-full px-3 py-2"
            placeholder="Contraseña"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Rol</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border rounded w-full px-3 py-2"
          >
            <option value="employee">Empleado</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <Button type="submit" className="">
          <PlusCircle />
          Crear Usuario
        </Button>
        {message && <p className="mt-4 text-center text-sm">{message}</p>}
      </form>

      {/* Tabla de usuarios */}
      <h2 className="text-xl font-bold mb-4">Lista de Usuarios</h2>
      <div className="bg-white rounded shadow-md w-full max-w-4xl p-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="border-b px-4 py-2">Nombre</th>
              <th className="border-b px-4 py-2">Email</th>
              <th className="border-b px-4 py-2">Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td className="border-b px-4 py-2">{user.name}</td>
                <td className="border-b px-4 py-2">{user.email}</td>
                <td className="border-b px-4 py-2">
                  {user.role == "employee" ? "empleado" : "administrador"}
                </td>
                <td className="border-b px-4 py-2">
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteUser(user._id)}
                  >
                    <Delete />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Page;
