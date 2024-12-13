import { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { Delete, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "../ui/checkbox";
import { useToast } from "../ui/use-toast";

const permissionsList = [
  "view_products",
  "picking",
  "despacho",
  "movimiento_interno",
  "ingresos",
  "view_orders",
  "view_users",
  "manage_users",
];

const TableUsers = () => {
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [selectedStores, setSelectedStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  // Obtener la lista de usuarios y tiendas
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const usersResponse = await axios.get("/api/database/users");
        setUsers(usersResponse.data);

        const storesResponse = await axios.get("/api/database/stores");
        setStores(storesResponse.data);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        toast({ title: "Error al cargar los datos" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setSelectedPermissions(user.permissions || []);
    setSelectedStores(user.stores.map((store) => store._id) || []);
  };

  const handlePermissionChange = (permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleStoreChange = (storeId) => {
    setSelectedStores((prev) =>
      prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [...prev, storeId]
    );
  };

  const handleSave = async () => {
    try {
      const updatedUser = {
        permissions: selectedPermissions,
        stores: selectedStores,
      };
      await axios.put(
        `/api/database/users/id/${selectedUser._id}`,
        updatedUser
      );
      setUsers((prev) =>
        prev.map((user) =>
          user._id === selectedUser._id ? { ...user, ...updatedUser } : user
        )
      );
      setSelectedUser(null);
      toast({ title: "Usuario actualizado correctamente" });
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      toast({ title: "Hubo un problema al actualizar el usuario." });
    }
  };

  const handleStatusChange = async (userId, currentStatus) => {
    try {
      const updatedUser = await axios.put(`/api/database/users/id/${userId}`, {
        active: !currentStatus,
      });
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, active: !currentStatus } : user
        )
      );
      toast({
        title: `Usuario ${
          !currentStatus ? "activado" : "desactivado"
        } exitosamente.`,
      });
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      toast({ title: "Hubo un problema al cambiar el estado del usuario." });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4">Cargando datos...</div>;
  }

  return (
    <div className="flex justify-center w-full">
      <Table className="w-[70vw]">
        <TableCaption>Lista de Usuarios</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Permisos</TableHead>
            <TableHead>Tiendas Asociadas</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                {user.permissions && user.permissions.length > 0
                  ? user.permissions.join(", ")
                  : "Sin permisos"}
              </TableCell>
              <TableCell>
                {user.stores && user.stores.length > 0
                  ? user.stores.map((store) => store.name).join(", ")
                  : "Sin tiendas asociadas"}
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={user.active}
                  onCheckedChange={() =>
                    handleStatusChange(user._id, user.active)
                  }
                />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger>
                      <Button size="icon" onClick={() => handleEdit(user)}>
                        <Edit />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Usuario</DialogTitle>
                        <DialogDescription>
                          Modifica los permisos y tiendas asociadas para{" "}
                          <strong>{user.name}</strong>.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold">Permisos</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {permissionsList.map((permission) => (
                              <label
                                key={permission}
                                className="flex items-center"
                              >
                                <Checkbox
                                  checked={selectedPermissions.includes(
                                    permission
                                  )}
                                  onCheckedChange={() =>
                                    handlePermissionChange(permission)
                                  }
                                />
                                <span className="ml-2 capitalize">
                                  {permission.replace("_", " ")}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold">Tiendas Asociadas</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {stores.map((store) => (
                              <label
                                key={store._id}
                                className="flex items-center"
                              >
                                <Checkbox
                                  checked={selectedStores.includes(store._id)}
                                  onCheckedChange={() =>
                                    handleStoreChange(store._id)
                                  }
                                />
                                <span className="ml-2">{store.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <Button onClick={handleSave}>Guardar Cambios</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableUsers;
