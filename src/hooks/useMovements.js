import { useState, useEffect } from "react";
import axios from "axios";

const useMovements = (depotId = null, initialPage = 1, itemsPerPage = 30) => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialPage); // Asegúrate de inicializar con initialPage
  const [totalMovements, setTotalMovements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchMovements = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("/api/database/movements", {
        params: {
          depotId,
          page: currentPage,
          limit: itemsPerPage,
        },
      });
      const { movements, totalMovements, totalPages } = response.data; // currentPage ya lo tienes como estado

      setMovements(movements);
      setTotalMovements(totalMovements);
      setTotalPages(totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements(); // Elimina la verificación de currentPage, ya está inicializado
  }, [currentPage, depotId]); // Agrega depotId como dependencia si quieres que la consulta cambie cuando cambie depotId

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const jumpToPage = (page) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  return {
    movements,
    loading,
    error,
    currentPage,
    totalPages,
    totalMovements,
    nextPage,
    prevPage,
    jumpToPage,
  };
};

export default useMovements;
