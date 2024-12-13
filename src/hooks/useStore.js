import { useEffect, useState } from "react";
import { create } from "zustand";

export const useStoreStore = create((set) => ({
  selectedStore: null, // Comienza vacío
  setSelectedStore: (store) => {
    set({ selectedStore: store });
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedStore", JSON.stringify(store));
    }
  },
}));

export function useInitializeStore() {
  const setSelectedStore = useStoreStore((state) => state.setSelectedStore);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedStore = localStorage.getItem("selectedStore");
      if (savedStore && savedStore !== "undefined") {
        try {
          const parsedStore = JSON.parse(savedStore);
          setSelectedStore(parsedStore);
        } catch (error) {
          console.error("Error al analizar el JSON de selectedStore:", error);
          localStorage.removeItem("selectedStore"); // Limpia el almacenamiento en caso de error
        }
      }
      setIsInitialized(true);
    }
  }, [setSelectedStore]);

  return isInitialized;
}
