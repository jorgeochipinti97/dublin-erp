import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useToast } from "../ui/use-toast";

const CreateUserForm = () => {
  const { register, handleSubmit, reset } = useForm();
  const [stores, setStores] = useState([]); // Almacena las tiendas obtenidas
  const [selectedStores, setSelectedStores] = useState([]); // Almacena las tiendas seleccionadas
  const { toast } = useToast();
  const [permissions, setPermissions] = useState({
    view_products: false,
    picking: false,
    despacho: false,
    movimiento_interno: false,
    ingresos: false,
    view_orders: false,
    view_users: false,
    manage_users: false,
  });

  // Roles posibles
  const roles = ["admin", "employee", "client"];

  // Obtener las tiendas al cargar el componente
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await axios.get("/api/database/stores");
        setStores(response.data); // Guardar las tiendas en el estado
      } catch (error) {
        console.log("Error obteniendo tiendas:", error);
        toast({
          title: "No se pudieron cargar las tiendas",
          variant: "destructive",
        });
      }
    };
    fetchStores();
  }, []);

  // Manejar el envío del formulario
  const onSubmit = async (data) => {
    try {
      const newUser = {
        ...data,
        permissions: Object.keys(permissions).filter((key) => permissions[key]), // Filtrar permisos seleccionados
        stores: selectedStores, // Asociar las tiendas seleccionadas
      };

      console.log(newUser);
      const response = await axios.post("/api/database/users", newUser);
      console.log(response);
      toast({ title: "Usuario creado exitosamente" });
      reset(); // Reiniciar el formulario
      setSelectedStores([]); // Limpiar las tiendas seleccionadas
      setPermissions({}); // Limpiar permisos
    } catch (error) {
      console.error("Error creando usuario:", error);
      toast({ title: "Error al crear el usuario", variant: "destructive" });
    }
  };

  // Manejar el cambio de estado de los permisos
  const handlePermissionChange = (permission) => {
    setPermissions((prev) => ({
      ...prev,
      [permission]: !prev[permission],
    }));
  };

  // Manejar la selección de tiendas
  const handleStoreChange = (storeId) => {
    setSelectedStores(
      (prev) =>
        prev.includes(storeId)
          ? prev.filter((id) => id !== storeId) // Desmarcar tienda
          : [...prev, storeId] // Agregar tienda
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4">Crear Usuario</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block font-bold mb-1">Nombre</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            {...register("name", { required: true })}
          />
        </div>
        <div className="mb-4">
          <label className="block font-bold mb-1">Email</label>
          <input
            type="email"
            className="w-full p-2 border rounded"
            {...register("email", { required: true })}
          />
        </div>
        <div className="mb-4">
          <label className="block font-bold mb-1">Contraseña</label>
          <input
            type="password"
            className="w-full p-2 border rounded"
            {...register("password", { required: true })}
          />
        </div>
        <div className="mb-4">
          <label className="block font-bold mb-1">Rol</label>
          <select
            className="w-full p-2 border rounded"
            {...register("role", { required: true })}
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block font-bold mb-1">Tiendas Asociadas</label>
          <div className="grid grid-cols-2 gap-4">
            {stores.length > 0 ? (
              stores.map((store) => (
                <div key={store._id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`store-${store._id}`}
                    checked={selectedStores.includes(store._id)}
                    onChange={() => handleStoreChange(store._id)}
                    className="mr-2"
                  />
                  <label
                    htmlFor={`store-${store._id}`}
                    className="cursor-pointer"
                  >
                    {store.name}
                  </label>
                </div>
              ))
            ) : (
              <p>Cargando tiendas...</p>
            )}
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-bold mb-1">Permisos</label>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Permiso</th>
                <th className="border border-gray-300 p-2">Otorgar</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(permissions).map((permission) => (
                <tr key={permission}>
                  <td className="border border-gray-300 p-2 capitalize">
                    {permission.replace("_", " ")}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <input
                      type="checkbox"
                      checked={permissions[permission]}
                      onChange={() => handlePermissionChange(permission)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Crear Usuario
        </button>
      </form>
    </div>
  );
};

export default CreateUserForm;
