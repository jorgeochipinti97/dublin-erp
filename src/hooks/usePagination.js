import { useState, useEffect } from 'react';

export const usePagination = (dataArray = [], initialPage = 1, itemsPerPage = 30) => {
  const [paginatedData, setPaginatedData] = useState([]); // Datos paginados a mostrar
  const [loading, setLoading] = useState(false); // Estado de carga
  const [error, setError] = useState(null); // Estado de error
  const [currentPage, setCurrentPage] = useState(initialPage); // Página actual
  const [totalItems, setTotalItems] = useState(dataArray.length); // Total de ítems

  // Calcular el número máximo de páginas
  const maxPage = Math.ceil(totalItems / itemsPerPage);

  // Para depurar el estado inicial y cuando se actualicen los datos
  console.log('Initial Data:', dataArray);
  console.log('Total Items:', totalItems);
  console.log('Current Page:', currentPage);
  console.log('Max Page:', maxPage);
  
  useEffect(() => {
    const paginateData = () => {
      console.log('Paginating Data...'); // Para ver cuándo empieza la paginación
      setLoading(true); // Activa el estado de carga
      setError(null); // Resetea el estado de error

      try {
        // Calcular los índices de inicio y fin para los datos paginados
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentData = dataArray.slice(startIndex, endIndex);

        console.log('Start Index:', startIndex); // Índice de inicio
        console.log('End Index:', endIndex); // Índice de fin
        console.log('Current Data (paginated):', currentData); // Datos actuales paginados

        // Actualizar los datos paginados
        setPaginatedData(currentData);
        setTotalItems(dataArray.length); // Actualiza el total de ítems
      } catch (err) {
        setError(err.message); // Maneja los errores
        console.error('Pagination Error:', err.message); // Log de errores
      } finally {
        setLoading(false); // Desactiva el estado de carga
        console.log('Loading Complete'); // Fin de carga
      }
    };

    // Llama a la función para paginar los datos cada vez que cambian los parámetros relevantes
    paginateData();
  }, [currentPage, itemsPerPage, dataArray]);

  // Función para avanzar a la siguiente página
  const next = () => {
    setCurrentPage((prevPage) => {
      console.log('Next Page Triggered:', prevPage); // Página antes de avanzar
      if (prevPage < maxPage) {
        console.log('Moving to Next Page:', prevPage + 1); // Página siguiente
        return prevPage + 1;
      }
      console.log('Already at Max Page:', maxPage); // Si ya está en la última página
      return prevPage;
    });
  };

  // Función para retroceder a la página anterior
  const prev = () => {
    setCurrentPage((prevPage) => {
      console.log('Previous Page Triggered:', prevPage); // Página antes de retroceder
      if (prevPage > 1) {
        console.log('Moving to Previous Page:', prevPage - 1); // Página anterior
        return prevPage - 1;
      }
      console.log('Already at Min Page: 1'); // Si ya está en la primera página
      return prevPage;
    });
  };

  // Función para saltar a una página específica
  const jump = (page) => {
    const pageNumber = Math.max(1, Math.min(page, maxPage));
    console.log('Jumping to Page:', pageNumber); // Verifica a qué página se está saltando
    setCurrentPage(pageNumber);
  };

  return { 
    paginatedData, // Datos paginados
    currentPage,   // Página actual
    maxPage,       // Número máximo de páginas
    loading,       // Estado de carga
    error,         // Estado de error
    next,          // Función para avanzar a la siguiente página
    prev,          // Función para retroceder a la página anterior
    jump,          // Función para saltar a una página específica
  };
};
